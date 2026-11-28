import { DetalleLineaExpandido } from "#/ventas/comun/componentes/DetalleLineaExpandido.tsx";
import { MetaTabla2 } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { LineaVenta } from "../diseño.ts";
import { tVentas } from "../../i18n/index.ts";

const porcentaje = (valor: number | null | undefined) =>
  valor ? `${valor}%` : "";

/** Las líneas sin artículo de catálogo no tienen referencia: solo descripción. */
const etiquetaLinea = (linea: LineaVenta) =>
  linea.referencia ? `${linea.referencia}: ${linea.descripcion}` : linea.descripcion;

export const metaTablaLineaVenta = <L extends LineaVenta>(
  { divisa }: { divisa?: string } = {}
): MetaTabla2<L> => ({
  cols: [
    "linea",
    "cantidad",
    "pvp_unitario",
    "grupo_iva_producto_id",
    "dto_porcentual",
    "dto_lineal",
    "tipo_irpf",
    "tipo_recargo",
    "por_comision",
    "importe_comision",
    "pvp_total",
  ],
  metaCols: {
    linea: {
      id: "linea",
      cabecera: tVentas("documento.lineas.linea"),
      prioridad: "alta",
      render: etiquetaLinea,
    },
    cantidad: {
      id: "cantidad",
      cabecera: tVentas("documento.lineas.cantidad"),
      prioridad: "alta",
      tipo: "numero",
    },
    pvp_unitario: {
      id: "pvp_unitario",
      cabecera: tVentas("documento.lineas.precio"),
      prioridad: "alta",
      tipo: "moneda",
      divisa,
    },
    grupo_iva_producto_id: {
      id: "grupo_iva_producto_id",
      cabecera: tVentas("documento.lineas.iva"),
      prioridad: "media",
      render: (linea: L) => linea.grupo_iva_producto_id ?? "",
    },
    dto_porcentual: {
      id: "dto_porcentual",
      cabecera: tVentas("documento.lineas.dtoPorcentual"),
      prioridad: "media",
      render: (linea: L) => porcentaje(linea.dto_porcentual),
    },
    dto_lineal: {
      id: "dto_lineal",
      cabecera: tVentas("documento.lineas.dtoLineal"),
      prioridad: "baja",
      tipo: "moneda",
      divisa,
    },
    tipo_irpf: {
      id: "tipo_irpf",
      cabecera: tVentas("documento.lineas.irpf"),
      prioridad: "baja",
      render: (linea: L) => porcentaje(linea.tipo_irpf),
    },
    tipo_recargo: {
      id: "tipo_recargo",
      cabecera: tVentas("documento.lineas.recargo"),
      prioridad: "baja",
      render: (linea: L) => porcentaje(linea.tipo_recargo),
    },
    por_comision: {
      id: "por_comision",
      cabecera: tVentas("documento.lineas.porComision"),
      prioridad: "baja",
      render: (linea: L) => porcentaje(linea.por_comision),
    },
    importe_comision: {
      id: "importe_comision",
      cabecera: tVentas("documento.lineas.comision"),
      prioridad: "baja",
      tipo: "moneda",
      divisa,
    },
    pvp_total: {
      id: "pvp_total",
      cabecera: tVentas("documento.lineas.total"),
      prioridad: "alta",
      tipo: "moneda",
      divisa,
    },
  },
});

export const metaTablaLineaVentaResumida = <L extends LineaVenta>(
  opciones: { divisa?: string } = {}
): MetaTabla2<L> => {
  const meta = metaTablaLineaVenta<L>(opciones);
  return {
    cols: meta.cols.filter((id) => meta.metaCols[id]?.prioridad !== "baja"),
    metaCols: meta.metaCols,
    expansion: ({ entidad }) => (
      <DetalleLineaExpandido linea={entidad} divisa={opciones.divisa} />
    ),
  };
};
