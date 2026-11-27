import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { tLib } from "../i18n/textos.ts";

// Tipos mínimos de la Web Speech API (no vienen en lib.dom). Locales en vez de los
// globales de speech-recognition.d.ts: este hook se compila también desde otros
// paquetes (componentes, contextos), donde ese .d.ts no está incluido.
interface EventoResultadoVoz {
    resultIndex: number;
    results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
}

interface Reconocedor {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    onresult: ((event: EventoResultadoVoz) => void) | null;
    onerror: ((event: { error: string }) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    abort: () => void;
}

type ConstructorReconocedor = new () => Reconocedor;

const getSpeechRecognition = (): ConstructorReconocedor | null => {
    if (typeof window === "undefined") return null;
    const w = window as unknown as Record<string, ConstructorReconocedor | undefined>;
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export const reconocimientoContinuoSoportado = (): boolean => getSpeechRecognition() !== null;

export interface ResultadoEscucha {
    texto: string;
    /** false = transcripción provisional (va cambiando mientras se habla). */
    final: boolean;
}

export interface OpcionesEscuchaContinua {
    /** Mientras sea true (y la pestaña esté visible) se mantiene escuchando. */
    activa: boolean;
    onResultado: (resultado: ResultadoEscucha) => void;
    lang?: string;
    /** Al cambiar, se descarta la sesión de reconocimiento en curso y se empieza otra:
     * lo que el reconocedor tuviera oído y aún sin entregar se pierde (p. ej. el eco
     * de lo que acaba de decir el sintetizador). */
    sesion?: number;
}

export interface UseEscuchaContinua {
    soportado: boolean;
    escuchando: boolean;
    /** Error que impide seguir escuchando (permiso denegado, sin micrófono). Mientras
     * esté informado no se reintenta solo: hay que llamar a `reintentar`. */
    error: string | null;
    reintentar: () => void;
}

// Errores tras los que no tiene sentido reintentar en bucle: el usuario tiene que
// hacer algo (dar permiso, conectar un micro).
const ERRORES_FATALES: Record<string, string> = {
    get "not-allowed"() { return tLib("gen.voz.permisoDeMicrofonoDenegado"); },
    get "service-not-allowed"() { return tLib("gen.voz.elNavegadorNoPermiteElReconocimiento"); },
    get "audio-capture"() { return tLib("gen.voz.noSeHaEncontradoMicrofono"); },
};

// "no-speech" (silencio) y "aborted" (lo hemos parado nosotros) no son fallos reales.
const ERRORES_IGNORABLES = new Set(["no-speech", "aborted"]);

const RETARDO_BASE_MS = 500;
const RETARDO_MAX_MS = 10_000;

const suscribirVisibilidad = (avisar: () => void) => {
    document.addEventListener("visibilitychange", avisar);
    return () => document.removeEventListener("visibilitychange", avisar);
};
const documentoVisible = () => document.visibilityState !== "hidden";

/**
 * Reconocimiento de voz continuo (Web Speech API, `continuous = true`).
 *
 * Chrome corta la sesión de reconocimiento sola cada cierto tiempo (silencio, límite
 * de duración, errores de red): se rearranca automáticamente mientras `activa` siga a
 * true, con espera exponencial si los cortes son por error. Se pausa con la pestaña
 * oculta — no tiene sentido (ni es deseable) escuchar en una pestaña que no se ve.
 */
export const useEscuchaContinua = ({
    activa, onResultado, lang = "es-ES", sesion = 0,
}: OpcionesEscuchaContinua): UseEscuchaContinua => {
    const SpeechRecognitionClass = getSpeechRecognition();
    const soportado = SpeechRecognitionClass !== null;
    const visible = useSyncExternalStore(suscribirVisibilidad, documentoVisible, () => true);
    const [escuchando, setEscuchando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // El callback cambia en cada render del llamante — se lee siempre el último sin
    // reiniciar el reconocimiento por ello.
    const onResultadoRef = useRef(onResultado);
    useEffect(() => {
        onResultadoRef.current = onResultado;
    });

    const debeEscuchar = activa && visible && error === null;

    useEffect(() => {
        if (!SpeechRecognitionClass || !debeEscuchar) return;

        let detenido = false;
        let fallosSeguidos = 0;
        let temporizador: ReturnType<typeof setTimeout> | undefined;
        let recognition: Reconocedor | null = null;

        const arrancar = () => {
            if (detenido) return;
            const r = new SpeechRecognitionClass();
            r.lang = lang;
            r.continuous = true;
            r.interimResults = true;
            r.maxAlternatives = 1;

            r.onresult = (event) => {
                fallosSeguidos = 0;
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const resultado = event.results[i];
                    const texto = resultado[0].transcript.trim();
                    if (texto) onResultadoRef.current({ texto, final: resultado.isFinal });
                }
            };

            r.onerror = (event) => {
                const fatal = ERRORES_FATALES[event.error];
                if (fatal) {
                    detenido = true;
                    setError(fatal);
                    return;
                }
                if (!ERRORES_IGNORABLES.has(event.error)) fallosSeguidos++;
            };

            r.onend = () => {
                setEscuchando(false);
                if (detenido) return;
                const retardo = fallosSeguidos === 0
                    ? 0
                    : Math.min(RETARDO_BASE_MS * 2 ** (fallosSeguidos - 1), RETARDO_MAX_MS);
                temporizador = setTimeout(arrancar, retardo);
            };

            recognition = r;
            try {
                r.start();
                setEscuchando(true);
            } catch {
                // start() lanza si la sesión anterior aún no ha terminado de cerrarse.
                fallosSeguidos++;
                temporizador = setTimeout(arrancar, RETARDO_BASE_MS);
            }
        };

        arrancar();

        return () => {
            detenido = true;
            clearTimeout(temporizador);
            if (recognition) {
                recognition.onend = null;
                recognition.onresult = null;
                recognition.onerror = null;
                recognition.abort();
            }
            setEscuchando(false);
        };
    }, [SpeechRecognitionClass, debeEscuchar, lang, sesion]);

    return { soportado, escuchando, error, reintentar: () => setError(null) };
};
