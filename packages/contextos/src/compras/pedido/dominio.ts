import { EstadoEtiqueta } from "#/comun/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { tCompras } from "#/compras/i18n/index.ts";
import { articuloDeLineaValido, getTipoArticulo } from "../comun/dominio.ts";
import {
    LineaPedido,
    ModeloLineaPedido,
    NuevaLineaPedido,
    Pedido,
} from "./diseño.ts";

export const pedidoPendiente = (pedido: Pedido): boolean =>
    pedido.recibido === null || pedido.recibido === "No";

export const descripcionRecibido = (pedido: Pedido): string =>
    pedido.recibido ?? "No";

export const pedidoAlbaranable = (pedido: Pedido): boolean => pedido.recibido !== "Sí";

export const etiquetaLinea = (linea: LineaPedido): string =>
    linea.referencia ? `${linea.referencia}: ${linea.descripcion}` : linea.descripcion;

export const modeloLineaPedido = (linea: LineaPedido): ModeloLineaPedido => ({
    ...linea,
    tipoArticulo: getTipoArticulo(linea),
});

export const articuloLineaBloqueado = (linea: LineaPedido): boolean =>
    linea.cerrada || linea.cantidadRecibida > 0;

export const metaLineaPedido: MetaModelo<ModeloLineaPedido> = {
    campos: {
        descripcion: { requerido: true },
        cantidad: { requerido: true, tipo: "decimal", decimales: 2 },
        pvpUnitario: { requerido: true, tipo: "moneda", decimales: 2 },
        dtoPorcentual: { tipo: "decimal", decimales: 2 },
        dtoLineal: { tipo: "moneda", decimales: 2 },
        tipoIrpf: { tipo: "decimal", decimales: 2 },
        pvpSinDto: { tipo: "moneda", bloqueado: true },
        pvpTotal: { tipo: "moneda", bloqueado: true },
        tipoIva: { tipo: "decimal", bloqueado: true },
        tipoRecargo: { tipo: "decimal", bloqueado: true },
        cantidadRecibida: { tipo: "decimal", bloqueado: true },
    },
    validacion: articuloDeLineaValido,
};

export const metaNuevaLineaPedido: MetaModelo<NuevaLineaPedido> = {
    campos: {
        referencia: { tipo: "texto" },
        descripcion: { tipo: "texto" },
        cantidad: { requerido: true, tipo: "decimal", decimales: 2 },
        pvpUnitario: { tipo: "moneda", decimales: 2 },
        dtoPorcentual: { tipo: "decimal", decimales: 2, positivo: true, maximo: 100 },
        dtoLineal: { tipo: "moneda", decimales: 2, positivo: true },
        tipoIrpf: { tipo: "decimal", decimales: 2, positivo: true, maximo: 100 },
        pvpTotal: { tipo: "moneda", bloqueado: true },
        tipoIva: { tipo: "decimal", decimales: 2, bloqueado: true },
        tipoRecargo: { tipo: "decimal", decimales: 2, bloqueado: true },
    },
    validacion: articuloDeLineaValido,
};

export const nuevaLineaPedidoVacia = (): NuevaLineaPedido => ({
    tipoArticulo: "registrado",
    referencia: null,
    descripcion: "",
    descripcionArticulo: null,
    cantidad: 1,
    pvpUnitario: null,
    dtoPorcentual: 0,
    dtoLineal: 0,
    pvpTotal: 0,
    grupoIvaProductoId: null,
    ivaIncluido: false,
    tipoIva: 0,
    tipoRecargo: 0,
    tipoIrpf: 0,
});

export const camposConCambiosServidor = [
    'referencia',
    'cantidad',
    'pvpUnitario',
    'dtoPorcentual',
    'dtoLineal',
    'tipoIrpf',
    'grupoIvaProductoId',
] as const satisfies readonly (keyof NuevaLineaPedido)[];

export const etiquetaEstadoPedido = (pedido: Pedido): EstadoEtiqueta => {
    if (pedido.recibido === "Sí") return { texto: tCompras("comun.documento.estados.recibido"), tono: "completado" };
    if (pedido.recibido === "Parcial") return { texto: tCompras("comun.documento.estados.parcial"), tono: "parcial" };
    return { texto: tCompras("comun.documento.estados.pendiente"), tono: "pendiente" };
};
