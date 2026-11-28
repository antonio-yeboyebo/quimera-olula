import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import { Cuenta } from "../diseño.ts";
import { tContabilidad } from "../../i18n/index.ts";

export type EstadoMaestroCuenta = 'INICIAL' | 'CREANDO';

export type ContextoMaestroCuenta = {
    estado: EstadoMaestroCuenta;
    cuentas: ListaActivaEntidades<Cuenta>;
};

export const metaTablaCuenta: MetaTabla<Cuenta> = [
    { id: 'codigo', get cabecera() { return tContabilidad("cuenta.codigo"); } },
    { id: 'nombre', get cabecera() { return tContabilidad("cuenta.descripcion"); } },
    { id: 'codigoEpigrafe', get cabecera() { return tContabilidad("cuenta.epigrafe"); } },
    { id: 'ejercicioId', get cabecera() { return tContabilidad("cuenta.ejercicio"); } },
];

/** Filtro explícito: el metaFiltro por defecto usaría el `id` camelCase de la
 * columna como nombre de campo de API, y la API espera snake_case. */
export const metaFiltroCuenta: MetaFiltro = {
    ejercicioId: {
        id: "ejercicioId",
        campo: "ejercicio_id",
        get label() { return tContabilidad("cuenta.ejercicio"); },
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["ejercicio_id", "eq", valor as string];
        },
    },
    codigo: {
        id: "codigo",
        campo: "codigo",
        get label() { return tContabilidad("cuenta.codigo"); },
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["codigo", "~", valor as string];
        },
    },
    nombre: {
        id: "nombre",
        campo: "nombre",
        get label() { return tContabilidad("cuenta.descripcion"); },
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["nombre", "~", valor as string];
        },
    },
};

export const criteriaCuentasDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [["ejercicio_id", "eq", ejercicioActual()]],
    orden: ["codigo", "ASC"],
});
