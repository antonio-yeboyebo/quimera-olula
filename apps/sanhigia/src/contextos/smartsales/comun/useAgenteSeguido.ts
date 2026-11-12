import { useEffect, useState, useSyncExternalStore } from "react";
import { Agente, UsuarioSmartsales } from "./diseño.ts";
import { getAgentesPermitidos, getUsuarioSmartsales } from "./infraestructura.ts";

type DatosAgentes = {
    usuario: UsuarioSmartsales;
    agentes: Agente[];
};

let carga: Promise<DatosAgentes> | null = null;
let agenteElegido: string | null = null;
let sesion: string | null = null;
const suscriptores = new Set<() => void>();

const comprobarSesion = () => {
    const actual = localStorage.getItem("token-refresco");
    if (actual === sesion) return;
    sesion = actual;
    carga = null;
    agenteElegido = null;
};

const cargarDatos = () => {
    comprobarSesion();
    carga ??=Promise.all([getUsuarioSmartsales(), getAgentesPermitidos()])
        .then(([usuario, agentes]) => ({ usuario, agentes }))
        .catch((error) => {
            carga = null;
            throw error;
        });
    return carga;
};

const suscribir = (aviso: () => void) => {
    suscriptores.add(aviso);
    return () => suscriptores.delete(aviso);
};

export const seguirAgente = (codigo: string) => {
    agenteElegido = codigo;
    suscriptores.forEach((aviso) => aviso());
};

export const useAgenteSeguido = () => {
    const [datos, setDatos] = useState<DatosAgentes | null>(null);
    const [error, setError] = useState(false);
    const elegido = useSyncExternalStore(suscribir, () => agenteElegido);

    useEffect(() => {
        let activo = true;
        cargarDatos()
            .then((d) => activo && setDatos(d))
            .catch(() => activo && setError(true));
        return () => {
            activo = false;
        };
    }, []);

    const agentes = datos?.agentes ?? [];

    return {
        cargando: datos === null && !error,
        error,
        usuario: datos?.usuario ?? null,
        agentePropio: datos?.usuario.agente ?? null,
        agenteSeguido: elegido ?? datos?.usuario.agente ?? null,
        agentes,
        puedeVerOtros: agentes.length > 1,
        seguirAgente,
    };
};
