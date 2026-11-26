import { EstadoEtiqueta } from "#/comun/diseño.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { MetaModelo, modeloEsEditable } from "@olula/lib/dominio.ts";
import {
    clienteVentaVacio,
    metaLineaVenta,
    metaNuevaVenta,
    metaVenta,
    nuevaVentaVacia,
    puedeCambiarAlmacen,
    tituloDocumentoVenta,
    ventaVacia,
    widgetsDocumentoVenta,
} from "../venta/dominio.ts";
import {
    Albaran,
    CambioClienteAlbaran,
    LineaAlbaran,
    NuevoAlbaran,
} from "./diseño.ts";
import { tVentas } from "../i18n/index.ts";

// La columna de estado la añade delante MaestroConDetalleAlbaran.
export const metaTablaAlbaran = (): MetaTabla<Albaran> => [
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
        render: (a) => a.cliente.nombre_cliente,
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
        divisa: (albaran) => albaran.divisa_id,
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
        render: (a) => a.nombre_almacen || a.almacen_id,
    },
    {
        id: "de_abono",
        cabecera: tVentas("albaran.maestro.abono"),
        tipo: "booleano",
        prioridad: "baja",
        render: (a) => (a.de_abono ? tVentas("albaran.si") : ""),
    },
];

export const albaranVacio = (): Albaran => ({
    ...ventaVacia,
    cliente: clienteVentaVacio,
    facturado: false,
    por_comision: 0,
    hora: '',
    almacen_id: '',
    nombre_almacen: '',
    de_abono: false,
    lineas: [],
})

export const tituloAlbaran = (albaran: Albaran): string => {
    const titulo = tituloDocumentoVenta(albaran, tVentas("albaran.maestro.nuevo"));
    return albaran.de_abono ? tVentas("albaran.tituloAbono", { titulo }) : titulo;
}

export const nuevoAlbaranVacio: NuevoAlbaran = nuevaVentaVacia;

export const metaNuevoAlbaran: MetaModelo<NuevoAlbaran> = metaNuevaVenta;

export const metaAlbaran: MetaModelo<Albaran> = {
    campos: {
        ...metaVenta.campos,
        fecha: { tipo: "fecha", requerido: false },
        hora: { tipo: "hora", requerido: false },
        almacen_id: { requerido: true },
        nombre_almacen: { bloqueado: true },
        de_abono: { tipo: "checkbox", requerido: false },
        divisa_id: { requerido: true, bloqueado: true },
        tasa_conversion: { tipo: "numero", requerido: true, bloqueado: true },
        agente_id: { bloqueado: true },
        por_comision: { tipo: "decimal", requerido: false, decimales: 2, positivo: true, maximo: 100, bloqueado: true },
    },
    editable: (albaran: Albaran, campo?: string) => {
        if (albaran.facturado) return false;
        return campo === 'almacen_id' ? puedeCambiarAlmacen(albaran) : true;
    },
};

export const editable = modeloEsEditable<Albaran>(metaAlbaran);

export const metaLineaAlbaran: MetaModelo<LineaAlbaran> = metaLineaVenta as unknown as MetaModelo<LineaAlbaran>;

const albaranVacioObjeto: Albaran = albaranVacio();

export const albaranVacioContexto = (): Albaran => ({ ...albaranVacioObjeto });

export const cambioClienteVacio = (): CambioClienteAlbaran => ({
    cliente_id: "",
    direccion_id: "",
});

export const cambioCliente = (albaran: Albaran): CambioClienteAlbaran => ({
    cliente_id: albaran.cliente.cliente_id ?? "",
    direccion_id: albaran.cliente.direccion_id ?? "",
});

export const etiquetaEstadoAlbaran = (albaran: Pick<Albaran, "facturado">): EstadoEtiqueta =>
    albaran.facturado
        ? { texto: tVentas("albaran.estado.facturado"), tono: "completado" }
        : { texto: tVentas("albaran.estado.pendiente"), tono: "pendiente" };

/** Widgets por defecto del maestro de albaranes (totales según el filtro activo). */
export const widgetsAlbaran = () => widgetsDocumentoVenta("ventas.albaran", {
    plural: tVentas("albaran.widgets.plural"),
    total: tVentas("albaran.widgets.total"),
    medio: tVentas("albaran.widgets.medio"),
});
