import { useCallback, useEffect, useRef, useState } from "react";
import type {
    SpeechRecognitionErrorEvent,
    SpeechRecognitionEvent,
    SpeechRecognitionInstance,
} from "./speech-recognition.d.ts";

const getSpeechRecognition = (): (new () => SpeechRecognitionInstance) | null => {
    if (typeof window === "undefined") return null;
    return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
};

export interface UseReconocimientoVoz {
    soportado: boolean;
    escuchando: boolean;
    resultado: string | null;
    interino: string | null;
    error: string | null;
    iniciar: () => void;
    detener: () => void;
    reiniciar: () => void;
}

export const useReconocimientoVoz = (): UseReconocimientoVoz => {
    const SpeechRecognitionClass = getSpeechRecognition();
    const soportado = SpeechRecognitionClass !== null;

    const [escuchando, setEscuchando] = useState(false);
    const [resultado, setResultado] = useState<string | null>(null);
    const [interino, setInterino] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

    useEffect(() => {
        return () => {
            recognitionRef.current?.abort();
        };
    }, []);

    const iniciar = useCallback(() => {
        if (!SpeechRecognitionClass) return;

        recognitionRef.current?.abort();

        const recognition = new SpeechRecognitionClass();
        recognition.lang = "es-ES";
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = "";
            let interimTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            if (finalTranscript) {
                setResultado(finalTranscript.trim());
                setInterino(null);
            } else if (interimTranscript) {
                setInterino(interimTranscript.trim());
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            const mensajes: Record<string, string> = {
                "no-speech": "No se ha detectado voz",
                "audio-capture": "No se ha encontrado micrófono",
                "not-allowed": "Permiso de micrófono denegado",
                "network": "Error de red",
                "aborted": "",
            };
            const mensaje = mensajes[event.error] ?? `Error: ${event.error}`;
            if (mensaje) setError(mensaje);
            setEscuchando(false);
        };

        recognition.onend = () => {
            setEscuchando(false);
        };

        recognitionRef.current = recognition;
        setResultado(null);
        setInterino(null);
        setError(null);
        setEscuchando(true);
        recognition.start();
    }, [SpeechRecognitionClass]);

    const detener = useCallback(() => {
        recognitionRef.current?.stop();
    }, []);

    const reiniciar = useCallback(() => {
        setResultado(null);
        setInterino(null);
        setError(null);
        iniciar();
    }, [iniciar]);

    return { soportado, escuchando, resultado, interino, error, iniciar, detener, reiniciar };
};
