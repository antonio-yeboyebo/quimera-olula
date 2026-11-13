import { useEffect, useRef } from "react";
import { SITEKEY } from "./captcha.ts";

/**
 * Captcha de Cloudflare Turnstile. Solo se muestra si la app define
 * VITE_SAAS_CAPTCHA_SITEKEY; sin él (desarrollo) el backend tampoco lo comprueba.
 */
const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type Turnstile = {
    render: (elemento: HTMLElement, opciones: { sitekey: string; callback: (token: string) => void }) => void;
};

const turnstile = () => (window as unknown as { turnstile?: Turnstile }).turnstile;

export const Captcha = ({ onToken }: { onToken: (token: string) => void }) => {
    const contenedor = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const clave = SITEKEY;
        if (!clave || !contenedor.current) return;
        const pintar = () => {
            const api = turnstile();
            if (api && contenedor.current) api.render(contenedor.current, { sitekey: clave, callback: onToken });
        };
        if (turnstile()) {
            pintar();
            return;
        }
        const script = document.createElement("script");
        script.src = SCRIPT;
        script.async = true;
        script.onload = pintar;
        document.head.appendChild(script);
    }, [onToken]);

    if (!SITEKEY) return null;
    return <div ref={contenedor} />;
};
