import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { LineaPedido } from "../../diseño.ts";
import { etiquetaLinea } from "../../dominio.ts";
import { tCompras } from "#/compras/i18n/index.ts";

const porcentaje = (valor: number | null | undefined) => (valor ? `${valor}%` : "");

export const metaTablaLineaPedido = (divisa?: string, t = tCompras): MetaTabla<LineaPedido> => [
    {
        id: "cerrada",
        cabecera: "",
        render: (linea: LineaPedido) =>
            linea.cerrada ? (
                <span title={t("comun.lineas.lineaCerrada")}>
                    <QIcono nombre="candado" tamaño="sm" />
                </span>
            ) : (
                ""
            ),
    },
    {
        id: "descripcion",
        cabecera: t("comun.lineas.linea"),
        prioridad: "alta",
        render: etiquetaLinea,
    },
    { id: "cantidad", cabecera: t("comun.lineas.cantidad"), tipo: "numero", prioridad: "alta" },
    {
        id: "cantidadRecibida",
        cabecera: t("comun.lineas.recibida"),
        tipo: "numero",
        prioridad: "media",
    },
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
        render: (linea: LineaPedido) => porcentaje(linea.dtoPorcentual),
    },
    {
        id: "dtoLineal",
        cabecera: t("comun.lineas.dtoLineal"),
        tipo: "moneda",
        divisa,
        prioridad: "baja",
    },
    {
        id: "grupoIvaProductoId",
        cabecera: t("comun.lineas.iva"),
        prioridad: "media",
    },
    {
        id: "tipoIrpf",
        cabecera: t("comun.lineas.irpf"),
        prioridad: "baja",
        render: (linea: LineaPedido) => porcentaje(linea.tipoIrpf),
    },
    {
        id: "pvpTotal",
        cabecera: t("comun.campos.total"),
        tipo: "moneda",
        divisa,
        prioridad: "alta",
    },
];
