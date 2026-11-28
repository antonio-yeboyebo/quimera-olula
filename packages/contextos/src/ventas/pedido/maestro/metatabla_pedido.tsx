import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { Pedido } from "../diseño.ts";
import { etiquetaEstadoPedido } from "./maestro.ts";
import { tVentas } from "../../i18n/index.ts";

/** Columnas del maestro de pedidos, con las cabeceras en el idioma activo. */
export const getMetaTablaPedido = () => metaTablaPedido();

const metaTablaPedido = (): MetaTabla<Pedido> => [
  {
    id: "estado",
    cabecera: tVentas("documento.maestro.estado"),
    render: (pedido: Pedido) => (
      <EtiquetaEstado {...etiquetaEstadoPedido(pedido)} />
    ),
  },
  {
    id: "codigo",
    estilo: "secundario",
    cabecera: tVentas("documento.maestro.codigo"),
    prioridad: "alta",
  },
  {
    id: "nombre_cliente",
    estilo: "destacado",
    cabecera: tVentas("documento.maestro.cliente"),
    prioridad: "alta",
    render: (p) => p.cliente.nombre_cliente,
  },
  {
    id: "fecha",
    cabecera: tVentas("documento.maestro.fecha"),
    tipo: "fecha",
    prioridad: "alta",
  },
  {
    id: "total",
    estilo: "destacado",
    cabecera: tVentas("documento.maestro.total"),
    tipo: "moneda",
    prioridad: "alta",
    divisa: (pedido) => pedido.divisa_id,
  },
  {
    id: "nombre_agente",
    cabecera: tVentas("documento.maestro.agente"),
    prioridad: "baja",
  },
  {
    id: "almacen_id",
    cabecera: tVentas("documento.maestro.almacen"),
    prioridad: "baja",
    render: (p) => p.nombre_almacen || p.almacen_id,
  },
  {
    id: "fecha_salida",
    cabecera: tVentas("pedido.maestro.fechaSalida"),
    tipo: "fecha",
    prioridad: "baja",
  },
];
