import { useEffect, useRef } from "react";
// import { redirect } from "react-router";
import { comprobarToken } from "./login/dominio.ts";

export const useTimerRefresco = ({ segundos_refresco = 60 }: { segundos_refresco?: number } = {}) => {
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        timerRef.current = setInterval(async () => {
            await comprobarToken().catch((_e) => {
                if (window.location.pathname !== "/login") window.location.href = "/login";
            })
        }, segundos_refresco * 1000);

        return () => {
            clearInterval(timerRef.current!);
        }
    })
};