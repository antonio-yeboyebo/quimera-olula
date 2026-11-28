import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { FormaPago } from "../diseño.ts";
import { tTesoreria } from "../../i18n/index.ts";

export type EstadoMaestroFormaPago = "INICIAL" | "CREANDO";

export type ContextoMaestroFormaPago = {
    estado: EstadoMaestroFormaPago;
    formasPago: ListaActivaEntidades<FormaPago>;
};

export const metaTablaFormaPago: MetaTabla<FormaPago> = [
    { id: "id", get cabecera() { return tTesoreria("forma_pago.codigo"); } },
    { id: "descripcion", get cabecera() { return tTesoreria("forma_pago.descripcion"); } },
    { id: "generaRecibos", get cabecera() { return tTesoreria("forma_pago.generarRecibosComo"); } },
    { id: "cuentaId", get cabecera() { return tTesoreria("forma_pago.cuenta"); } },
    { id: "domiciliado", get cabecera() { return tTesoreria("forma_pago.domiciliado"); }, tipo: "booleano" },
];

const filtroTexto = (campo: string, label: string) => ({
    id: campo,
    campo,
    label,
    filtro: (valor: unknown) => {
        if (!valor || valor === "") return null;
        return [campo, "~", valor as string] as [string, string, string];
    },
});

export const metaFiltroFormaPago: MetaFiltro = {
    get id() { return filtroTexto("id", tTesoreria("forma_pago.codigo")); },
    get descripcion() { return filtroTexto("descripcion", tTesoreria("forma_pago.descripcion")); },
};

export const criteriaFormasPagoDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["id", "ASC"],
});
