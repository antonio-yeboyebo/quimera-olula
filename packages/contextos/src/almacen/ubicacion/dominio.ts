import { MetaModelo } from "@olula/lib/dominio.ts";
import { EstadoActividadUbicacion, NuevaUbicacion, Ubicacion } from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

export const estadosUbicacion: { valor: EstadoActividadUbicacion; descripcion: string }[] = [
    { valor: "ACTIVA", get descripcion() { return tAlmacen("ubicacion.activa"); } },
    { valor: "BLOQUEADA", get descripcion() { return tAlmacen("ubicacion.bloqueada"); } },
];

export const descripcionEstadoUbicacion = (estado: string): string =>
    estadosUbicacion.find((e) => e.valor === estado)?.descripcion ?? estado;

export const descripcionCaraUbicacion = (cara: string | null): string =>
    cara === "IZQUIERDA" ? tAlmacen("ubicacion.izquierda") : cara === "DERECHA" ? tAlmacen("ubicacion.derecha") : "";

const sinTexto = (s: string | null | undefined) => !s || s.trim() === "";

type CamposPosicion = {
    codigo: string;
    pasilloId: string | null;
    modulo: number | null;
    nivel: number | null;
    hueco: number | null;
};

const esEntero = (n: number | null): n is number => n !== null && Number.isInteger(n);

/**
 * Valida la posición de una ubicación. Sin pasillo basta el código; con pasillo son
 * obligatorios módulo (> 0), nivel (>= 0) y hueco (>= 1) y el código puede ir vacío.
 * Devuelve `true` si es válido o el mensaje del primer error.
 */
export const validarPosicionUbicacion = (u: CamposPosicion): string | true => {
    if (!sinTexto(u.pasilloId)) {
        if (!esEntero(u.modulo) || u.modulo <= 0) return tAlmacen("ubicacion.elModuloDebeSerUnEntero");
        if (!esEntero(u.nivel) || u.nivel < 0) return tAlmacen("ubicacion.elNivelDebeSerUnEntero");
        if (!esEntero(u.hueco) || u.hueco < 1) return tAlmacen("ubicacion.elHuecoDebeSerUnEntero");
        return true;
    }
    if (sinTexto(u.codigo)) return tAlmacen("ubicacion.elCodigoEsObligatorio");
    return true;
};

export const ubicacionVacia = (): Ubicacion => ({
    id: "",
    codigo: "",
    idZona: "",
    zona: "",
    pasilloId: null,
    pasillo: null,
    modulo: null,
    cara: null,
    nivel: null,
    hueco: null,
    tipoUbicacionId: null,
    tipoUbicacion: null,
    estado: "ACTIVA",
});

/** Constante estable (no función) para el formulario de alta. */
export const nuevaUbicacionVacia: NuevaUbicacion = {
    codigo: "",
    zonaId: "",
    pasilloId: null,
    modulo: null,
    nivel: null,
    hueco: null,
    tipoUbicacionId: null,
};

export const metaNuevaUbicacion: MetaModelo<NuevaUbicacion> = {
    campos: {
        codigo: { requerido: false },
        zonaId: { requerido: true },
        pasilloId: { requerido: false },
        modulo: { requerido: false, tipo: "entero" },
        nivel: { requerido: false, tipo: "entero" },
        hueco: { requerido: false, tipo: "entero" },
        tipoUbicacionId: { requerido: false },
    },
    validacion: validarPosicionUbicacion,
    onChange: (modelo, campo) =>
        campo === "zonaId" ? { ...modelo, pasilloId: null } : modelo,
};

export const metaUbicacion: MetaModelo<Ubicacion> = {
    campos: {
        codigo: { requerido: false },
        idZona: { requerido: true },
        pasilloId: { requerido: false },
        modulo: { requerido: false, tipo: "entero" },
        nivel: { requerido: false, tipo: "entero" },
        hueco: { requerido: false, tipo: "entero" },
        tipoUbicacionId: { requerido: false },
        estado: { requerido: true },
    },
    validacion: validarPosicionUbicacion,
    onChange: (modelo, campo) =>
        campo === "idZona" ? { ...modelo, pasilloId: null } : modelo,
};
