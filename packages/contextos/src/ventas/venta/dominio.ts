import { ConfigWidgets } from "@olula/componentes/index.js";
import { Direccion } from "@olula/lib/diseño.js";
import { formatearFechaDate, MetaCampo, MetaModelo, plugin } from "@olula/lib/dominio.ts";
import { CambioClienteVenta, ClienteVenta, ConTipoArticulo, LineaVenta, ModeloNuevaLinea, NuevaLineaVenta, NuevaVenta, NuevaVentaClienteNoRegistrado, TipoArticuloLinea, Venta } from "./diseño.ts";
import { tVentas } from "../i18n/index.ts";

export const direccionVacia = (): Direccion => ({
    nombre_via: "",
    tipo_via: "",
    numero: "",
    otros: "",
    cod_postal: "",
    ciudad: "",
    provincia_id: 0,
    provincia: "",
    pais_id: "",
    apartado: "",
    telefono: "",
});

export const clienteVentaVacio: ClienteVenta = {
    cliente_id: null,
    nombre_cliente: '',
    id_fiscal: '',
    direccion_id: null,
    direccion: direccionVacia(),
}

export const ventaVacia: Venta = {
    id: '',
    codigo: '',
    fecha: new Date(),
    agente_id: '',
    nombre_agente: '',
    divisa_id: '',
    tasa_conversion: 1,
    total: 0,
    total_divisa_empresa: 0,
    neto: 0,
    total_iva: 0,
    total_irpf: 0,
    total_recargo: 0,
    forma_pago_id: '',
    nombre_forma_pago: '',
    grupo_iva_negocio_id: '',
    serie_id: '',
    observaciones: '',
    dtoPorcentual: 0,
    netoSinDto: 0,
}

/**
 * Modelo vacío: los formularios de alta lo siembran con `conEmpresaActual()`, porque
 * `empresa_id` es requerido y sin él el botón Guardar nace deshabilitado.
 */
export const nuevaVentaVacia: NuevaVenta = {
    cliente_id: "",
    direccion_id: "",
    empresa_id: "",
}

export const nuevaVentaClienteNoRegistradaVacia: NuevaVentaClienteNoRegistrado = {
    empresa_id: "",
    nombre_cliente: "",
    id_fiscal: "",
    nombre_via: "",
    tipo_via: "",
    numero: "",
    otros: "",
    cod_postal: "",
    ciudad: "",
    provincia: "",
    pais_id: "",
    apartado: "",
    telefono: "",
}

export const cambioClienteVentaVacio: CambioClienteVenta = {
    cliente_id: "",
    nombre_cliente: "",
    direccion_id: "",
}
// export const nuevaLineaVentaVacia: NuevaLineaVenta = {
//     referencia: "",
//     cantidad: 1,
// };

export const puedeCambiarDivisa = (venta: { lineas?: unknown[] }) => (venta.lineas?.length ?? 0) === 0;

export const puedeCambiarAlmacen = (venta: { lineas?: unknown[] }) => (venta.lineas?.length ?? 0) === 0;

export const DIVISA_EMPRESA = "EUR";

export const enDivisaExtranjera = (venta: { divisa_id: string }): boolean => {
    const divisa = venta.divisa_id?.trim().toUpperCase() ?? "";
    return divisa !== "" && divisa !== DIVISA_EMPRESA;
};

export const mostrarImporte = (importe?: number | null): boolean => !!importe;

/**
 * En `legacy` el documento no lleva grupo de IVA de negocio: el servidor lo
 * devuelve siempre como GENERAL y descarta lo que se le mande.
 */
export const grupoIvaNegocioEnDocumento = (): boolean => plugin("iva_nav") !== "legacy";

export const tituloDocumentoVenta = (
    documento: { codigo: string; cliente: { nombre_cliente: string } },
    fallback: string
): string => {
    const codigo = documento.codigo || fallback;
    const nombreCliente = documento.cliente?.nombre_cliente?.trim() ?? "";
    return nombreCliente ? `${codigo} · ${nombreCliente}` : codigo;
};

export const formatearTasaConversion = (tasa: number): string =>
    `×${new Intl.NumberFormat("es-ES", {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
    }).format(tasa)}`;

export const metaVenta: MetaModelo<Venta> = {
    campos: {
        tasa_conversion: { tipo: "numero", requerido: false },
        total_divisa_empresa: { tipo: "numero", bloqueado: true },
        codigo: { bloqueado: true },
        /** La serie se fija al crear el documento (Eneboo la bloquea en edición). */
        serie_id: { bloqueado: true },
        divisa_id: { requerido: true },
    },
};

const metaDtoPorcentual: MetaCampo<LineaVenta> = {
    tipo: "decimal",
    requerido: false,
    decimales: 2,
    positivo: true,
    maximo: 100
};

const metaDtoLineal: MetaCampo<LineaVenta> = {
    tipo: "decimal",
    requerido: false,
    decimales: 2,
    positivo: true,
};

const metaPorcentajeLinea: MetaCampo<LineaVenta> = {
    tipo: "decimal",
    requerido: false,
    decimales: 2,
    positivo: true,
    maximo: 100,
};

export const metaLineaVenta: MetaModelo<LineaVenta> = {
    campos: {
        cantidad: { tipo: "decimal", requerido: true, decimales: 2 },
        iva_incluido: { tipo: "checkbox", requerido: true },
        pvp_unitario: { tipo: "moneda", requerido: true },
        pvp_total: { tipo: "moneda", bloqueado: true },
        dto_porcentual: metaDtoPorcentual,
        dto_lineal: metaDtoLineal,
        tipo_irpf: metaPorcentajeLinea,
        por_comision: metaPorcentajeLinea,
        tipo_recargo: { ...metaPorcentajeLinea, bloqueado: true },
        // Lo calcula el servidor a partir del grupo de IVA: se muestra y nunca se envía.
        tipo_iva: { ...metaPorcentajeLinea, bloqueado: true },
        importe_comision: { tipo: "moneda", requerido: false, bloqueado: true },
        // Las líneas sin artículo de catálogo no tienen referencia: su identidad
        // es la descripción, que sí es obligatoria.
        referencia: { requerido: false },
        descripcion: { requerido: true, tipo: "texto" },
    }
};

export const metaNuevaVenta: MetaModelo<NuevaVenta> = {
    campos: {
        cliente_id: { requerido: true },
        direccion_id: { requerido: true },
        empresa_id: { requerido: true },
    }
};

/**
 * Cliente de paso: no hay ids que validar, lo mínimo es el nombre y la vía.
 * El `tipo: "texto"` es lo que hace que un valor vacío invalide el campo.
 */
export const metaNuevaVentaClienteNoRegistrado: MetaModelo<NuevaVentaClienteNoRegistrado> = {
    campos: {
        nombre_cliente: { requerido: true, tipo: "texto" },
        nombre_via: { requerido: true, tipo: "texto" },
        empresa_id: { requerido: true },
    }
};

export const metaCambioClienteVenta: MetaModelo<CambioClienteVenta> = {
    campos: {
        cliente_id: { requerido: true },
        direccion_id: { requerido: true },
    }
};

export const metaNuevaLineaVenta: MetaModelo<NuevaLineaVenta> = {
    campos: {
        cantidad: { requerido: true, tipo: "decimal", decimales: 2 },
        referencia: { requerido: true, tipo: "texto" },
    }
};

// export const nuevaLineaLibreVentaVacia: NuevaLineaLibreVenta = {
//     descripcion: "",
//     cantidad: 1,
//     pvp_unitario: 0,
// };

// export const metaNuevaLineaLibreVenta: MetaModelo<NuevaLineaLibreVenta> = {
//     campos: {
//         descripcion: { requerido: true, tipo: "texto" },
//         cantidad: { requerido: true, tipo: "decimal", decimales: 2 },
//         pvp_unitario: { requerido: true, tipo: "moneda" },
//     }
// };

/**
 * El bloque `articulo` del PATCH de línea es excluyente: o el id del catálogo,
 * o la descripción, que es lo que convierte (o mantiene) la línea sin referencia.
 */
// export const articuloDeLinea = (
//     linea: Pick<LineaVenta, 'referencia' | 'descripcion'>
// ) => linea.referencia
//         ? { articulo_id: linea.referencia }
//         : { descripcion: linea.descripcion };



export const getTipoArticulo = (linea: LineaVenta): TipoArticuloLinea => {
    return linea.referencia
        ? linea.descripcion != linea.descripcionArticulo
            ? "generico"
            : "registrado"
        : "libre"
}
/**
 * Discrimina las dos formas de alta de línea que acepta el servidor.
 */
// export const esLineaConArticulo = (
//     linea: NuevaLineaVenta | NuevaLineaLibreVenta
// ): linea is NuevaLineaVenta => 'referencia' in linea && !!linea.referencia;

/**
 * Convierte los tipos planos de UI (NuevaLineaVenta / NuevaLineaLibreVenta)
 * al tipo unificado NuevaLineaVenta que acepta peticionNuevaLineaApi.
 */
// export const altaLineaDesdeNuevaLinea = (linea: NuevaLineaVenta): NuevaLineaVenta => ({
//     articulo: { articuloId: linea.referencia },
//     cantidad: linea.cantidad,
// });

// export const altaLineaDesdeNuevaLineaLibre = (linea: NuevaLineaLibreVenta): NuevaLineaVenta => ({
//     articulo: { descripcion: linea.descripcion, pvpUnitario: linea.pvp_unitario },
//     cantidad: linea.cantidad,
// });






/** Modelo de alta de línea vacío, compartido por todos los documentos de venta. */
export const nuevaLineaInicial: ModeloNuevaLinea = {
    tipoArticulo: "registrado",
    idArticulo: null,
    descripcionArticulo: null,
    descripcion: null,
    cantidad: 1,
    pvpUnitario: 0,
    pvpTotal: 0,
    dtoPorcentual: 0,
    dtoLineal: 0,
    idGrupoIvaProducto: null,
    ivaIncluido: false,
    tipoIva: 0,
    tipoRecargo: 0,
    tipoIrpf: 0,
    porLotes: false,
};

export const metaNuevaLinea: MetaModelo<ModeloNuevaLinea> = {
    campos: {
        descripcion: { tipo: "texto", requerido: (linea) => !linea.idArticulo },
        cantidad: { tipo: "decimal", requerido: true, decimales: 2 },
        pvpUnitario: { requerido: (linea) => !linea.idArticulo, tipo: "moneda" },
        pvpTotal: { tipo: "moneda", requerido: false, bloqueado: true },
        dtoPorcentual: { tipo: "decimal", requerido: false, decimales: 2, positivo: true, maximo: 100 },
        dtoLineal: { tipo: "decimal", requerido: false, decimales: 2, positivo: true },
        tipoIrpf: { tipo: "decimal", requerido: false, decimales: 2, positivo: true, maximo: 100 },
        tipoIva: { tipo: "decimal", requerido: false, decimales: 2, bloqueado: true },
        tipoRecargo: { tipo: "decimal", requerido: false, decimales: 2, bloqueado: true },
        idGrupoIvaProducto: { requerido: false },
        ivaIncluido: { tipo: "checkbox", requerido: false },
        porLotes: { tipo: "checkbox" },
    },
    validacion: (linea) => !!(linea.idArticulo || linea.descripcion),
    // onChange: (modelo, campo, valor) => {
    //     console.log("onChange", campo, valor);
    //     if (campo === "porLotes" && (valor === true)) {
    //         return {
    //             ...modelo,
    //             cantidad: 0
    //         };
    //     }
    //     return modelo;
    // },
};

/**
 * Convierte el modelo de UI de nueva línea al tipo unificado NuevaLineaVenta
 * que acepta peticionNuevaLineaApi. Común a todos los documentos de venta.
 */
/** Extrae los campos de NuevaLineaVenta desde el modelo de UI, descartando tipoArticulo y descripcionArticulo. */
export const altaLineaDesdeModelo = ({ idArticulo, descripcion, pvpUnitario, cantidad, pvpTotal, dtoPorcentual, dtoLineal, idGrupoIvaProducto, ivaIncluido, tipoIva, tipoRecargo, tipoIrpf }: ModeloNuevaLinea): NuevaLineaVenta => ({
    idArticulo, descripcion, pvpUnitario, cantidad, pvpTotal, dtoPorcentual, dtoLineal, idGrupoIvaProducto, ivaIncluido, tipoIva, tipoRecargo, tipoIrpf,
});

/**
 * Inicializa el modelo de edición de línea a partir de la línea recibida de la API,
 * infiriendo el tipoArticulo. Genérico para todos los documentos de venta.
 */
export const getModeloInicial = <T extends LineaVenta>(linea: T): ConTipoArticulo<T> => ({
    ...linea,
    tipoArticulo: getTipoArticulo(linea),
});

/**
 * Bloque `cliente` que espera el servidor al cambiar el cliente de un documento
 * o al crearlo: o el par de ids del maestro, o el cliente de paso con su
 * dirección anidada. `provincia_id` viaja siempre a null, porque la dirección de
 * un cliente no registrado no referencia el maestro de provincias.
 */
export const payloadCambioCliente = (cambio: CambioClienteVenta) =>
    'cliente_id' in cambio
        ? {
            cliente_id: cambio.cliente_id,
            direccion_id: cambio.direccion_id,
        }
        : {
            nombre: cambio.nombre_cliente || "",
            id_fiscal: cambio.id_fiscal,
            direccion: {
                nombre_via: cambio.nombre_via,
                tipo_via: cambio.tipo_via || null,
                numero: cambio.numero || null,
                otros: cambio.otros || null,
                cod_postal: cambio.cod_postal || null,
                ciudad: cambio.ciudad || null,
                provincia_id: null,
                provincia: cambio.provincia || null,
                pais_id: cambio.pais_id || null,
                apartado: cambio.apartado || null,
                telefono: cambio.telefono || null,
            },
        };

/** Documento de venta tal y como lo necesita la franja de datos clave. */
export type DocumentoDatosClave = {
    fecha: Date;
    cliente?: { nombre_cliente?: string; id_fiscal?: string };
    grupo_iva_negocio_id?: string;
    serie_id?: string;
};

/**
 * Franja de datos clave del detalle de un documento de venta (presupuesto, pedido,
 * albarán y factura): Fecha · Cliente · CIF/NIF · Grupo IVA negocio · Serie.
 *
 * Nombre y CIF/NIF son los del documento (también para clientes no registrados).
 * El grupo de IVA se muestra con su descripción si `descripcionGrupoIvaNegocio` la
 * conoce (si no, con el código) y no sale en `iva_nav=legacy`, donde el documento
 * no lleva grupo (igual que en la pestaña Datos).
 */
export const datosClaveDocumentoVenta = (
    documento: DocumentoDatosClave,
    descripcionGrupoIvaNegocio: (id: string) => string | undefined = () => undefined,
) => {
    const grupo = documento.grupo_iva_negocio_id ?? "";

    return [
        { etiqueta: tVentas("documento.datosClave.fecha"), valor: documento.fecha ? formatearFechaDate(new Date(documento.fecha)) : "—" },
        { etiqueta: tVentas("documento.datosClave.cliente"), valor: documento.cliente?.nombre_cliente?.trim() || "—" },
        { etiqueta: tVentas("documento.datosClave.idFiscal"), valor: documento.cliente?.id_fiscal?.trim() || "—" },
        ...(grupoIvaNegocioEnDocumento()
            ? [{ etiqueta: tVentas("documento.datosClave.grupoIvaNegocio"), valor: (grupo && descripcionGrupoIvaNegocio(grupo)) || grupo || "—" }]
            : []),
        { etiqueta: tVentas("documento.datosClave.serie"), valor: documento.serie_id || "—" },
    ];
};

/** Medidas de un documento de venta que se ofrecen al personalizar widgets. */
const camposWidgetsVenta = (): ConfigWidgets["campos"] => [
    { id: "total", etiqueta: tVentas("documento.widgets.total"), formato: "moneda" },
    { id: "neto", etiqueta: tVentas("documento.widgets.baseImponible"), formato: "moneda" },
    { id: "total_iva", etiqueta: tVentas("documento.widgets.iva"), formato: "moneda" },
    { id: "total_irpf", etiqueta: tVentas("documento.widgets.irpf"), formato: "moneda" },
    { id: "total_recargo", etiqueta: tVentas("documento.widgets.recargo"), formato: "moneda" },
];

/**
 * Widgets por defecto de un maestro de documentos de venta, con los textos en el
 * idioma activo: se llama al pintar el maestro (`useMemo(() => widgetsX(), [t])`).
 * Los widgets que guarda el usuario se guardan con sus títulos y no se traducen.
 */
export const widgetsDocumentoVenta = (
    recurso: string,
    textos: { plural: string; total: string; medio: string }
): ConfigWidgets => ({
    recurso,
    titulo: textos.plural,
    campos: camposWidgetsVenta(),
    widgets: [
        { id: "documentos", titulo: textos.plural, operacion: "conteo", formato: "numero", pie: tVentas("documento.widgets.recuento") },
        { id: "total", titulo: textos.total, operacion: "suma", campo: "total", formato: "moneda", pie: tVentas("documento.widgets.sumaTotal") },
        { id: "neto", titulo: tVentas("documento.widgets.baseImponible"), operacion: "suma", campo: "neto", formato: "moneda", pie: tVentas("documento.widgets.sumaBase") },
        { id: "medio", titulo: textos.medio, operacion: "promedio", campo: "total", formato: "moneda", pie: tVentas("documento.widgets.mediaTotal") },
    ],
});
