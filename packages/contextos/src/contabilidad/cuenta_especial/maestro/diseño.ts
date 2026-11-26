import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { CuentaEspecial } from "../diseño.ts";
import { tContabilidad } from "../../i18n/index.ts";

export type EstadoMaestroCuentaEspecial = 'INICIAL' | 'CREANDO';

export type ContextoMaestroCuentaEspecial = {
    estado: EstadoMaestroCuentaEspecial;
    cuentasEspeciales: ListaActivaEntidades<CuentaEspecial>;
};

export const metaTablaCuentaEspecial: MetaTabla<CuentaEspecial> = [
    { id: 'id', get cabecera() { return tContabilidad("cuenta_especial.codigo"); } },
    { id: 'descripcion', get cabecera() { return tContabilidad("cuenta_especial.descripcion"); } },
    { id: 'codigoCuenta', get cabecera() { return tContabilidad("cuenta_especial.cuenta"); } },
    { id: 'codigoSubcuenta', get cabecera() { return tContabilidad("cuenta_especial.subcuenta"); } },
];

/** Filtro explícito: el metaFiltro por defecto usaría el `id` camelCase de la
 * columna como nombre de campo de API, y la API espera snake_case. */
export const metaFiltroCuentaEspecial: MetaFiltro = {
    id: {
        id: "id",
        campo: "id",
        get label() { return tContabilidad("cuenta_especial.codigo"); },
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["id", "~", valor as string];
        },
    },
    descripcion: {
        id: "descripcion",
        campo: "descripcion",
        get label() { return tContabilidad("cuenta_especial.descripcion"); },
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["descripcion", "~", valor as string];
        },
    },
};

export const criteriaCuentasEspecialesDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["id", "ASC"],
});
