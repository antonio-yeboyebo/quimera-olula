import { AUTH_STORAGE_CHANGED_EVENT } from "@olula/lib/api/auth_storage_events.ts";
import { useEffect } from "react";

/**
 * Personalización de la empresa (whoami.saas, ver olula_servidor
 * apps/olula_saas/_controladores/saas/tenant_actual.py): nombre en el título de la
 * pestaña y, si la empresa lo tiene configurado, su color principal.
 */
interface DatosSaas {
    nombre?: string;
    personalizacion?: { nombre_comercial?: string; color_primario?: string };
}

const leerSaas = (): DatosSaas | null => {
    try {
        return (JSON.parse(localStorage.getItem("whoami") ?? "null") as { saas?: DatosSaas } | null)?.saas ?? null;
    } catch {
        return null;
    }
};

export const aplicarPersonalizacion = () => {
    const saas = leerSaas();
    const nombre = saas?.personalizacion?.nombre_comercial || saas?.nombre;
    document.title = nombre ? `${nombre} · Olula` : "Olula";
    const color = saas?.personalizacion?.color_primario;
    if (color) document.documentElement.style.setProperty("--color-primario", color);
    else document.documentElement.style.removeProperty("--color-primario");
};

export const usePersonalizacionTenant = () => {
    useEffect(() => {
        aplicarPersonalizacion();
        window.addEventListener(AUTH_STORAGE_CHANGED_EVENT, aplicarPersonalizacion);
        return () => window.removeEventListener(AUTH_STORAGE_CHANGED_EVENT, aplicarPersonalizacion);
    }, []);
};
