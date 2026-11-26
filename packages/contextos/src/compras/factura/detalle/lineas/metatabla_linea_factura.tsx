import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { LineaFactura } from "../../diseño.ts";
import { etiquetaLinea } from "../../dominio.ts";
import { tCompras } from "#/compras/i18n/index.ts";

const porcentaje = (valor: number | null | undefined) => (valor ? `${valor}%` : "");

export const metaTablaLineaFactura = (divisa?: string, t = tCompras): MetaTabla<LineaFactura> => [
    {
        id: "codigoAlbaran",
        cabecera: t("comun.lineas.albaran"),
        prioridad: "media",
        render: (linea: LineaFactura) => linea.codigoAlbaran ?? "",
    },
    {
        id: "descripcion",
        cabecera: t("comun.lineas.linea"),
        prioridad: "alta",
        render: etiquetaLinea,
    },
    { id: "cantidad", cabecera: t("comun.lineas.cantidad"), tipo: "numero", prioridad: "alta" },
    {
        id: "pvpUnitario",
        cabecera: t("comun.lineas.coste"),
        tipo: "moneda",
        divisa,
        prioridad: "alta",
    },
    {
        id: "dtoPorcentual",
        cabecera: t("comun.lineas.dto"),
        prioridad: "media",
        render: (linea: LineaFactura) => porcentaje(linea.dtoPorcentual),
    },
    {
        id: "dtoLineal",
        cabecera: t("comun.lineas.dtoLineal"),
        tipo: "moneda",
        divisa,
        prioridad: "baja",
    },
    { id: "grupoIvaProductoId", cabecera: t("comun.lineas.iva"), prioridad: "media" },
    {
        id: "tipoIrpf",
        cabecera: t("comun.lineas.irpf"),
        prioridad: "baja",
        render: (linea: LineaFactura) => porcentaje(linea.tipoIrpf),
    },
    {
        id: "pvpTotal",
        cabecera: t("comun.campos.total"),
        tipo: "moneda",
        divisa,
        prioridad: "alta",
    },
];
