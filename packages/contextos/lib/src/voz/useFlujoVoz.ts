import { useCallback, useEffect, useRef, useState } from "react";
import { parsearNumeroVoz } from "./parsearNumeroVoz.ts";
import { useSintesisVoz } from "./useSintesisVoz.ts";
import { reservarVoz } from "./voz_ocupada.ts";
import { tLib } from "../i18n/textos.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getWindowSpeechRecognition = (): (new () => any) | null => {
    if (typeof window === "undefined") return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null;
};

export type TipoRespuesta = "numero" | "texto" | "si-no";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ValorVoz = any;

export interface PreguntaVoz {
    instruccion: string;
    tipo: TipoRespuesta;
    /** Transforma el texto reconocido en el valor final (ej: buscar caja por código en API). Null = no encontrado, pedir repetición. */
    resolver?: (textoReconocido: string) => Promise<ValorVoz | null>;
    confirmacion: (valor: ValorVoz) => string;
}

export type EstadoFlujoVoz = "inactivo" | "hablando" | "escuchando" | "confirmando";

export interface UseFlujoVoz {
    estado: EstadoFlujoVoz;
    textoReconocido: string | null;
    interino: string | null;
    preguntar: (pregunta: PreguntaVoz) => Promise<ValorVoz>;
    cancelar: () => void;
    soportado: boolean;
    vocesDisponibles: boolean;
}

const AFIRMACIONES = ["sí", "si", "correcto", "vale", "ok", "afirmativo", "exacto", "eso es"];
const NEGACIONES = ["no", "incorrecto", "repite", "repetir", "otra vez"];

const parsearSiNo = (texto: string): boolean | null => {
    const limpio = texto.trim().toLowerCase().normalize("NFC");
    if (AFIRMACIONES.some((a) => limpio.includes(a))) return true;
    if (NEGACIONES.some((n) => limpio.includes(n))) return false;
    return null;
};

const parsearRespuesta = (texto: string, tipo: TipoRespuesta): string | number | boolean | null => {
    switch (tipo) {
        case "numero":
            return parsearNumeroVoz(texto);
        case "si-no":
            return parsearSiNo(texto);
        case "texto":
            return texto.trim() || null;
    }
};

/**
 * Escucha una frase por voz de forma imperativa (Promise-based).
 * Evita el problema de stale closures al no depender de estado React.
 */
const escucharUnaVez = (
    onInterino: (texto: string) => void,
    signal: AbortSignal
): Promise<string> => {
    const SR = getWindowSpeechRecognition();
    if (!SR) return Promise.reject(new Error("STT no soportado"));

    return new Promise((resolve, reject) => {
        if (signal.aborted) {
            reject(new Error("cancelado"));
            return;
        }

        const recognition = new SR();
        recognition.lang = "es-ES";
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        let resuelta = false;
        let ultimoInterino = "";

        const abortar = () => {
            recognition.abort();
            if (!resuelta) {
                resuelta = true;
                reject(new Error("cancelado"));
            }
        };

        signal.addEventListener("abort", abortar, { once: true });

        recognition.onresult = (event: { results: SpeechRecognitionResultList; resultIndex: number }) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    resuelta = true;
                    signal.removeEventListener("abort", abortar);
                    resolve(result[0].transcript.trim());
                    return;
                }
                ultimoInterino = result[0].transcript.trim();
                onInterino(ultimoInterino);
            }
        };

        recognition.onerror = (event: { error: string }) => {
            if (resuelta) return;
            resuelta = true;
            signal.removeEventListener("abort", abortar);
            if (event.error === "aborted" || event.error === "canceled") {
                reject(new Error("cancelado"));
            } else {
                const mensajes: Record<string, string> = {
                    "no-speech": tLib("gen.voz.noSeHaDetectadoVoz"),
                    "audio-capture": tLib("gen.voz.noSeHaEncontradoMicrofono"),
                    "not-allowed": tLib("gen.voz.permisoDeMicrofonoDenegado"),
                };
                reject(new Error(mensajes[event.error] ?? `Error STT: ${event.error}`));
            }
        };

        recognition.onend = () => {
            if (resuelta) return;
            resuelta = true;
            signal.removeEventListener("abort", abortar);
            // Si hay texto interino pendiente, usarlo como resultado final
            if (ultimoInterino) {
                resolve(ultimoInterino);
            } else {
                reject(new Error("No se ha detectado voz"));
            }
        };

        recognition.start();
    });
};

/**
 * Hook que orquesta el ciclo completo de interacción por voz:
 * hablar instrucción → escuchar respuesta → confirmar → resolver.
 *
 * `preguntar()` devuelve una Promise con el valor confirmado.
 */
export const useFlujoVoz = (): UseFlujoVoz => {
    const tts = useSintesisVoz();
    const [estado, setEstado] = useState<EstadoFlujoVoz>("inactivo");
    const [textoReconocido, setTextoReconocido] = useState<string | null>(null);
    const [interino, setInterino] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    // La voz queda reservada desde la primera pregunta hasta cancelar o desmontar —
    // entre pregunta y pregunta también, para que el modo voz del asistente no se cuele.
    const liberarVozRef = useRef<(() => void) | null>(null);

    const sttSoportado = getWindowSpeechRecognition() !== null;
    const soportado = sttSoportado && tts.soportado;

    const preguntar = useCallback(
        async (pregunta: PreguntaVoz): Promise<ValorVoz> => {
            abortControllerRef.current?.abort();
            liberarVozRef.current ??= reservarVoz();
            const controller = new AbortController();
            abortControllerRef.current = controller;
            const signal = controller.signal;

            const escuchar = (): Promise<string> => {
                setEstado("escuchando");
                setTextoReconocido(null);
                setInterino(null);
                return escucharUnaVez(
                    (texto) => setInterino(texto),
                    signal
                );
            };

            const ciclo = async (): Promise<ValorVoz> => {
                // 1. Hablar la instrucción
                setEstado("hablando");
                await tts.hablar(pregunta.instruccion);
                if (signal.aborted) throw new Error("cancelado");

                // 2. Escuchar respuesta
                const texto = await escuchar();
                setTextoReconocido(texto);
                if (signal.aborted) throw new Error("cancelado");

                // 3. Resolver valor (parser o resolver custom)
                let valor: ValorVoz;
                if (pregunta.resolver) {
                    const resuelto = await pregunta.resolver(texto);
                    if (resuelto === null) {
                        setEstado("hablando");
                        await tts.hablar("No he encontrado coincidencia. Repite por favor.");
                        if (signal.aborted) throw new Error("cancelado");
                        return ciclo();
                    }
                    valor = resuelto;
                } else {
                    const parseado = parsearRespuesta(texto, pregunta.tipo);
                    if (parseado === null) {
                        setEstado("hablando");
                        await tts.hablar("No he entendido. Repite por favor.");
                        if (signal.aborted) throw new Error("cancelado");
                        return ciclo();
                    }
                    valor = parseado;
                }

                // 4. Confirmar
                setEstado("confirmando");
                const textoConfirmacion = pregunta.confirmacion(valor);
                await tts.hablar(textoConfirmacion);
                if (signal.aborted) throw new Error("cancelado");

                // 5. Escuchar confirmación
                const respuestaConf = await escuchar();
                if (signal.aborted) throw new Error("cancelado");

                const esAfirmativo = parsearSiNo(respuestaConf);
                if (esAfirmativo === true) {
                    setEstado("inactivo");
                    return valor;
                }

                // No confirmado → repetir
                setEstado("hablando");
                await tts.hablar("De acuerdo, repite.");
                if (signal.aborted) throw new Error("cancelado");
                return ciclo();
            };

            try {
                return await ciclo();
            } catch (err) {
                setEstado("inactivo");
                throw err;
            }
        },
        [tts]
    );

    const cancelar = useCallback(() => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
        liberarVozRef.current?.();
        liberarVozRef.current = null;
        tts.detener();
        setEstado("inactivo");
        setTextoReconocido(null);
        setInterino(null);
    }, [tts]);

    // Cancelar todo al desmontar el componente
    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
            abortControllerRef.current = null;
            liberarVozRef.current?.();
            liberarVozRef.current = null;
            window.speechSynthesis?.cancel();
        };
    }, []);

    return {
        estado,
        textoReconocido,
        interino,
        preguntar,
        cancelar,
        soportado,
        vocesDisponibles: tts.vocesDisponibles,
    };
};
