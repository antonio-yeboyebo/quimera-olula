import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import { Subcuenta } from "../diseño.ts";
import { tContabilidad } from "../../i18n/index.ts";

export type EstadoMaestroSubcuenta = 'INICIAL' | 'CREANDO';

export type ContextoMaestroSubcuenta = {
    estado: EstadoMaestroSubcuenta;
    subcuentas: ListaActivaEntidades<Subcuenta>;
};

export const metaTablaSubcuenta: MetaTabla<Subcuenta> = [
    { id: 'codigo', get cabecera() { return tContabilidad("subcuenta.codigo"); } },
    { id: 'nombre', get cabecera() { return tContabilidad("subcuenta.descripcion"); } },
    { id: 'codigoCuenta', get cabecera() { return tContabilidad("subcuenta.cuenta"); } },
    { id: 'ejercicioId', get cabecera() { return tContabilidad("subcuenta.ejercicio"); } },
];

/** Filtro explícito: el metaFiltro por defecto usaría el `id` camelCase de la
 * columna como nombre de campo de API, y la API espera snake_case. */
export const metaFiltroSubcuenta: MetaFiltro = {
    ejercicioId: {
        id: "ejercicioId",
        campo: "ejercicio_id",
        get label() { return tContabilidad("subcuenta.ejercicio"); },
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["ejercicio_id", "eq", valor as string];
        },
    },
    codigo: {
        id: "codigo",
        campo: "codigo",
        get label() { return tContabilidad("subcuenta.codigo"); },
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["codigo", "~", valor as string];
        },
    },
    nombre: {
        id: "nombre",
        campo: "nombre",
        get label() { return tContabilidad("subcuenta.descripcion"); },
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["nombre", "~", valor as string];
        },
    },
};

export const criteriaSubcuentasDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [["ejercicio_id", "eq", ejercicioActual()]],
    orden: ["codigo", "ASC"],
});
