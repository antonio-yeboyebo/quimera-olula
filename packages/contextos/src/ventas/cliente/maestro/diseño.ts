import { MetaTabla } from "@olula/componentes/index.js";
import {
    filtroBooleanos,
    filtroTextos,
    MetaFiltro,
} from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { filtroAgente } from "../../comun/filtros.tsx";
import { tVentas } from "../../i18n/index.ts";
import { Cliente } from "../diseño.ts";

export type EstadoMaestroCliente = "INICIAL" | "CREANDO_CLIENTE";

export type ContextoMaestroCliente = {
    estado: EstadoMaestroCliente;
    clientes: ListaActivaEntidades<Cliente>;
};

/** Columnas del maestro, con las cabeceras en el idioma activo (se piden al pintar, con el `t` de useTVentas). */
export const metaTablaCliente = (t = tVentas): MetaTabla<Cliente> => [
    { id: "id", cabecera: t("cliente.campos.id") },
    { id: "nombre", cabecera: t("cliente.campos.nombre") },
    { id: "email", cabecera: t("cliente.campos.email") },
    { id: "telefono1", cabecera: t("cliente.campos.telefono"), tipo: "texto" },
    {
        id: "id_fiscal",
        cabecera: t("cliente.campos.idFiscal"),
        render: (entidad: Cliente) =>
            `${entidad.tipo_id_fiscal}: ${entidad.id_fiscal}`,
    },
];

/** Filtros del maestro, con las etiquetas en el idioma activo. */
export const metaFiltroCliente = (t = tVentas): MetaFiltro => ({
    nombre: {
        id: "nombre",
        label: t("cliente.campos.nombre"),
        tipo: "texto",
        filtro: (v) => (v ? filtroTextos("nombre", v) : null),
    },
    id_fiscal: {
        id: "id_fiscal",
        label: t("cliente.campos.idFiscal"),
        tipo: "texto",
        filtro: (v) => (v ? filtroTextos("id_fiscal", v) : null),
    },
    email: {
        id: "email",
        label: t("cliente.campos.email"),
        tipo: "texto",
        filtro: (v) => (v ? filtroTextos("email", v) : null),
    },
    telefono1: {
        id: "telefono1",
        label: t("cliente.campos.telefono"),
        tipo: "texto",
        filtro: (v) => (v ? filtroTextos("telefono1", v) : null),
    },
    agente_id: { ...filtroAgente, label: t("cliente.campos.agente") },
    de_baja: {
        id: "de_baja",
        label: t("cliente.campos.deBaja"),
        tipo: "checkbox",
        filtro: (v) => (v ? filtroBooleanos("de_baja", v) : null),
    },
});
