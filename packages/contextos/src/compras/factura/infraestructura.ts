import { empresaActual } from "#/valores/empresaActual.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    ArticuloLineaCompraApi,
    articuloLineaApi,
    ProveedorCompraApi,
    proveedorCompraApi,
} from "../comun/infraestructura.ts";
import ApiUrls from "../comun/urls.ts";
import {
    BorrarLineasFactura,
    CambiosFactura,
    CambiosLineaFactura,
    DeleteFactura,
    Factura,
    FacturarAlbaranes,
    GetFactura,
    GetFacturas,
    GetLineaFactura,
    GetLineasFactura,
    GetRecibosFactura,
    GetReportFactura,
    LineaFactura,
    NuevaFactura,
    NuevaFacturaProveedorNoRegistrado,
    NuevaLineaFactura,
    PatchFactura,
    PatchLineaFactura,
    PatchRectificativa,
    PatchRegistrarFactura,
    PostFactura,
    PostLineasFactura,
    QueryNuevaLineaFactura,
    ReciboFactura,
} from "./diseño.ts";
import { estadoExpedicionDesdeApi } from "./dominio.ts";
import { getTraza } from "#/comun/componentes/traza/infraestructura.ts";
import {
    AlbaranCandidato,
    ExtraccionFactura,
    FacturaLeida,
    LineaFacturaLeida,
    LineaPropuesta,
    NuevoArticuloConProveedor,
    PropuestaImportacion,
    SubcuentaPropuesta,
} from "./vistas/validar_importacion/diseño.ts";

const baseUrl = new ApiUrls().FACTURA;

export interface FacturaApi {
    id: string;
    codigo: string;
    ejercicio_id: string;
    serie_id: string;
    numero: string;
    fecha: string;
    hora: string;
    numero_proveedor: string | null;
    proveedor_id: string | null;
    nombre_proveedor: string;
    id_fiscal: string;
    almacen_id: string | null;
    nombre_almacen: string | null;
    forma_pago_id: string | null;
    nombre_forma_pago: string | null;
    grupo_iva_negocio_id: string;
    divisa_id: string;
    tasa_conversion: number;
    neto: number;
    total_iva: number;
    total_recargo: number;
    total_irpf: number;
    total: number;
    total_divisa_empresa: number;
    recargo_financiero: number;
    rectificativa_id: string | null;
    codigo_rectificativa: string | null;
    de_abono: boolean;
    automatica: boolean;
    editable: boolean;
    servicios: boolean;
    no_generar_asiento: boolean;
    asiento_id: string | null;
    observaciones: string | null;
    // Sin tipar como EstadoExpedicion a propósito: lo que llega es texto y lo
    // valida `estadoExpedicionDesdeApi`, no el compilador.
    estado_expedicion: string;
}

export interface LineaFacturaApi {
    id: string;
    factura_id: string;
    albaran_id: string | null;
    codigo_albaran: string | null;
    referencia: string | null;
    descripcion: string;
    descripcion_articulo: string | null;
    cantidad: number;
    pvp_unitario: number;
    dto_porcentual: number;
    dto_lineal: number;
    pvp_sin_dto: number;
    pvp_total: number;
    grupo_iva_producto_id: string;
    tipo_iva: number;
    tipo_recargo: number;
    tipo_irpf: number;
}

interface NuevaLineaFacturaApi {
    articulo: ArticuloLineaCompraApi;
    cantidad: number;
    pvp_unitario?: number;
    dto_porcentual?: number;
    dto_lineal?: number;
    grupo_iva_producto_id?: string;
    tipo_irpf?: number;
}

interface QueryNuevaLineaFacturaApiReq extends NuevaLineaFacturaApi {
    iva_incluido?: boolean;
}

interface QueryNuevaLineaFacturaApiRes {
    id?: string;
    articulo_id: string | null;
    descripcion: string;
    cantidad: number;
    pvp_unitario: number;
    dto_porcentual: number;
    dto_lineal: number;
    pvp_total: number;
    grupo_iva_producto_id: string;
    tipo_iva: number;
    tipo_recargo: number;
    tipo_irpf: number;
    iva_incluido: boolean;
}

interface NuevaFacturaApi {
    proveedor: ProveedorCompraApi;
    fecha: string;
    empresa_id: string;
    numero_proveedor?: string | null;
    almacen_id?: string | null;
    observaciones?: string | null;
    de_abono?: boolean;
}

interface CambiosFacturaApi {
    proveedor?: ProveedorCompraApi;
    fecha?: string;
    hora?: string;
    numero_proveedor?: string | null;
    divisa?: { id: string; tasa_conversion?: number };
    grupo_iva_negocio_id?: string;
    forma_pago_id?: string;
    almacen_id?: string | null;
    observaciones?: string | null;
    de_abono?: boolean;
    servicios?: boolean;
    no_generar_asiento?: boolean;
}

interface CambiosLineaFacturaApi {
    articulo?: ArticuloLineaCompraApi;
    cantidad?: number;
    pvp_unitario?: number;
    dto_porcentual?: number;
    dto_lineal?: number;
    grupo_iva_producto_id?: string;
    tipo_irpf?: number;
}

const fechaAApi = (fecha: Date): string => fecha.toISOString().slice(0, 10);

const horaDesdeApi = (hora: string | null): string => (hora ?? "").slice(0, 8);

const horaAApi = (hora: string): string =>
    hora.length === 5 ? `${hora}:00` : hora.slice(0, 8);

export const facturaDesdeApi = (api: FacturaApi): Factura => ({
    id: api.id,
    codigo: api.codigo,
    ejercicioId: api.ejercicio_id,
    serieId: api.serie_id,
    numero: api.numero,
    fecha: new Date(Date.parse(api.fecha)),
    hora: horaDesdeApi(api.hora),
    numeroProveedor: api.numero_proveedor,
    proveedorId: api.proveedor_id,
    nombreProveedor: api.nombre_proveedor,
    idFiscal: api.id_fiscal,
    almacenId: api.almacen_id,
    nombreAlmacen: api.nombre_almacen,
    formaPagoId: api.forma_pago_id,
    nombreFormaPago: api.nombre_forma_pago,
    grupoIvaNegocioId: api.grupo_iva_negocio_id,
    divisaId: api.divisa_id,
    tasaConversion: api.tasa_conversion,
    neto: api.neto,
    totalIva: api.total_iva,
    totalRecargo: api.total_recargo,
    totalIrpf: api.total_irpf,
    total: api.total,
    totalDivisaEmpresa: api.total_divisa_empresa,
    recargoFinanciero: api.recargo_financiero,
    rectificativaId: api.rectificativa_id,
    codigoRectificativa: api.codigo_rectificativa,
    deAbono: api.de_abono,
    automatica: api.automatica,
    editable: api.editable,
    servicios: api.servicios,
    noGenerarAsiento: api.no_generar_asiento,
    asientoId: api.asiento_id,
    observaciones: api.observaciones,
    estadoExpedicion: estadoExpedicionDesdeApi(api.estado_expedicion),
});

export const lineaFacturaDesdeApi = (api: LineaFacturaApi): LineaFactura => ({
    id: api.id,
    facturaId: api.factura_id,
    albaranId: api.albaran_id,
    codigoAlbaran: api.codigo_albaran,
    referencia: api.referencia,
    descripcion: api.descripcion,
    descripcionArticulo: api.descripcion_articulo,
    cantidad: api.cantidad,
    pvpUnitario: api.pvp_unitario,
    dtoPorcentual: api.dto_porcentual,
    dtoLineal: api.dto_lineal,
    pvpSinDto: api.pvp_sin_dto,
    pvpTotal: api.pvp_total,
    grupoIvaProductoId: api.grupo_iva_producto_id,
    tipoIva: api.tipo_iva,
    tipoRecargo: api.tipo_recargo,
    tipoIrpf: api.tipo_irpf,
});

const esProveedorNoRegistrado = (
    factura: NuevaFactura | NuevaFacturaProveedorNoRegistrado
): factura is NuevaFacturaProveedorNoRegistrado =>
    (factura as NuevaFacturaProveedorNoRegistrado).nombre !== undefined;

const proveedorAApi = (
    factura: NuevaFactura | NuevaFacturaProveedorNoRegistrado
): ProveedorCompraApi =>
    esProveedorNoRegistrado(factura)
        ? { nombre: factura.nombre, id_fiscal: factura.idFiscal }
        : { proveedor_id: factura.proveedorId };

const nuevaFacturaAApi = (
    factura: NuevaFactura | NuevaFacturaProveedorNoRegistrado
): NuevaFacturaApi => ({
    proveedor: proveedorAApi(factura),
    fecha: fechaAApi(factura.fecha),
    empresa_id: empresaActual(),
    ...(factura.numeroProveedor ? { numero_proveedor: factura.numeroProveedor } : {}),
    ...(factura.almacenId ? { almacen_id: factura.almacenId } : {}),
    ...(factura.observaciones ? { observaciones: factura.observaciones } : {}),
    ...(factura.deAbono ? { de_abono: true } : {}),
});

const cambiosFacturaAApi = (f: CambiosFactura): CambiosFacturaApi => {
    const cambios: CambiosFacturaApi = {};
    if (f.proveedorId !== undefined || f.nombreProveedor !== undefined) {
        cambios.proveedor = proveedorCompraApi(f);
    }
    if (f.fecha !== undefined) cambios.fecha = fechaAApi(f.fecha);
    if (f.hora !== undefined) cambios.hora = horaAApi(f.hora);
    if (f.numeroProveedor !== undefined) cambios.numero_proveedor = f.numeroProveedor;
    if (f.divisaId) {
        cambios.divisa = {
            id: f.divisaId,
            ...(f.tasaConversion !== undefined ? { tasa_conversion: f.tasaConversion } : {}),
        };
    }
    if (f.grupoIvaNegocioId !== undefined) cambios.grupo_iva_negocio_id = f.grupoIvaNegocioId;
    if (f.formaPagoId) cambios.forma_pago_id = f.formaPagoId;
    if (f.almacenId !== undefined) cambios.almacen_id = f.almacenId;
    if (f.observaciones !== undefined) cambios.observaciones = f.observaciones;
    if (f.deAbono !== undefined) cambios.de_abono = f.deAbono;
    if (f.servicios !== undefined) cambios.servicios = f.servicios;
    if (f.noGenerarAsiento !== undefined) cambios.no_generar_asiento = f.noGenerarAsiento;
    return cambios;
};

/**
 * Los importes a cero se omiten: el servidor distingue «ausente» (toma la
 * condición del proveedor) de «presente con 0» (la pisa), así que mandarlos
 * siempre borraría el descuento de `articulosprov`.
 */
const nuevaLineaAApi = (linea: NuevaLineaFactura): NuevaLineaFacturaApi => ({
    articulo: articuloLineaApi(linea),
    cantidad: linea.cantidad,
    ...(linea.pvpUnitario === null ? {} : { pvp_unitario: linea.pvpUnitario }),
    ...(linea.dtoPorcentual ? { dto_porcentual: linea.dtoPorcentual } : {}),
    ...(linea.dtoLineal ? { dto_lineal: linea.dtoLineal } : {}),
    ...(linea.grupoIvaProductoId === null
        ? {}
        : { grupo_iva_producto_id: linea.grupoIvaProductoId }),
    ...(linea.tipoIrpf ? { tipo_irpf: linea.tipoIrpf } : {}),
});

const queryNuevaLineaAApi = (
    linea: NuevaLineaFactura
): QueryNuevaLineaFacturaApiReq => ({
    ...nuevaLineaAApi(linea),
    iva_incluido: linea.ivaIncluido,
});

const queryNuevaLineaDesdeApi = (
    anterior: NuevaLineaFactura,
    api: QueryNuevaLineaFacturaApiRes
): NuevaLineaFactura => ({
    ...anterior,
    ...(anterior.tipoArticulo === "generico" ? {} : { descripcion: api.descripcion }),
    cantidad: api.cantidad,
    pvpUnitario: api.pvp_unitario,
    dtoPorcentual: api.dto_porcentual,
    dtoLineal: api.dto_lineal,
    pvpTotal: api.pvp_total,
    grupoIvaProductoId: api.grupo_iva_producto_id,
    ivaIncluido: api.iva_incluido,
    tipoIva: api.tipo_iva,
    tipoRecargo: api.tipo_recargo,
    tipoIrpf: api.tipo_irpf,
});

const cambiosLineaAApi = (linea: CambiosLineaFactura): CambiosLineaFacturaApi => {
    const cambios: CambiosLineaFacturaApi = {};
    if (linea.tipoArticulo !== undefined) {
        cambios.articulo = articuloLineaApi({
            tipoArticulo: linea.tipoArticulo,
            referencia: linea.referencia ?? null,
            descripcion: linea.descripcion ?? "",
            descripcionArticulo: linea.descripcionArticulo ?? null,
        });
    }
    if (linea.cantidad !== undefined) cambios.cantidad = linea.cantidad;
    if (linea.pvpUnitario !== undefined) cambios.pvp_unitario = linea.pvpUnitario;
    if (linea.dtoPorcentual !== undefined) cambios.dto_porcentual = linea.dtoPorcentual;
    if (linea.dtoLineal !== undefined) cambios.dto_lineal = linea.dtoLineal;
    if (linea.grupoIvaProductoId !== undefined) {
        cambios.grupo_iva_producto_id = linea.grupoIvaProductoId;
    }
    if (linea.tipoIrpf !== undefined) cambios.tipo_irpf = linea.tipoIrpf;
    return cambios;
};

export const getFactura: GetFactura = async (id) =>
    await RestAPI.getItem<Factura, FacturaApi>(
        `${baseUrl}/${id}`,
        facturaDesdeApi,
        "Error al obtener la factura"
    );

export const getFacturas: GetFacturas = async (criteria) =>
    await RestAPI.getQuery<Factura, FacturaApi>(
        baseUrl,
        criteria,
        facturaDesdeApi,
        "Error al obtener las facturas"
    );

export const postFactura: PostFactura = async (nuevaFactura) => {
    const respuesta = await RestAPI.post<NuevaFacturaApi>(
        baseUrl,
        nuevaFacturaAApi(nuevaFactura),
        "Error al crear la factura"
    );
    return respuesta.id;
};

export const facturarAlbaranes: FacturarAlbaranes = async (albaranIds) => {
    const respuesta = await RestAPI.post(
        `${baseUrl}/desde-albaranes`,
        { albaran_ids: albaranIds },
        "Error al facturar los albaranes"
    );
    const { factura_id, codigo } = respuesta as unknown as {
        factura_id: string;
        codigo: string;
    };
    return { id: factura_id, codigo };
};

export const patchFactura: PatchFactura = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        { cambios: cambiosFacturaAApi(cambios) },
        "Error al guardar la factura"
    );
};

export const patchRectificativa: PatchRectificativa = async (id, rectificativaId) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/rectificativa`,
        { rectificativa_id: rectificativaId },
        "Error al marcar la factura rectificativa"
    );
};

export const patchRegistrarFactura: PatchRegistrarFactura = async (id) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/registrar`,
        {},
        "Error al registrar la factura"
    );
};

export const deleteFactura: DeleteFactura = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, "Error al borrar la factura");
};

export const getReportFactura: GetReportFactura = async (id) =>
    await RestAPI.blob(`${baseUrl}/${id}/report`, "Error al obtener el report de la factura");

export const getLineasFactura: GetLineasFactura = async (id) =>
    await RestAPI.getLista<LineaFactura, LineaFacturaApi>(
        `${baseUrl}/${id}/linea`,
        lineaFacturaDesdeApi,
        "Error al obtener las líneas de la factura"
    );

export const getLineaFactura: GetLineaFactura = async (id, lineaId) =>
    await RestAPI.getItem<LineaFactura, LineaFacturaApi>(
        `${baseUrl}/${id}/linea/${lineaId}`,
        lineaFacturaDesdeApi,
        "Error al obtener la línea"
    );

export const postLineasFactura: PostLineasFactura = async (id, lineas) => {
    const respuesta = await RestAPI.post<{ lineas: NuevaLineaFacturaApi[] }>(
        `${baseUrl}/${id}/linea`,
        { lineas: lineas.map(nuevaLineaAApi) },
        "Error al crear las líneas de la factura"
    );
    const { lineas: ids } = respuesta as unknown as { lineas: string[] };
    return ids;
};

export const postLineaFactura = async (
    id: string,
    linea: NuevaLineaFactura
): Promise<string> => {
    const [lineaId] = await postLineasFactura(id, [linea]);
    return lineaId;
};

export const queryNuevaLineaFactura: QueryNuevaLineaFactura = async (id, linea) => {
    const respuesta = await RestAPI.query<
        QueryNuevaLineaFacturaApiReq,
        QueryNuevaLineaFacturaApiRes
    >(
        `${baseUrl}/${id}/nueva_linea`,
        queryNuevaLineaAApi(linea),
        "Error al calcular la nueva línea de la factura"
    );
    return queryNuevaLineaDesdeApi(linea, respuesta);
};

export const patchLineaFactura: PatchLineaFactura = async (id, lineaId, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/linea/${lineaId}`,
        { cambios: cambiosLineaAApi(cambios) },
        "Error al actualizar la línea"
    );
};

export const borrarLineasFactura: BorrarLineasFactura = async (id, lineas) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/linea/borrar`,
        { lineas },
        "Error al borrar las líneas de la factura"
    );
};

interface ReciboFacturaApi {
    id: string;
    factura_id: string | null;
    codigo: string;
    fecha_emision: string;
    fecha_vencimiento: string;
    estado: string;
    importe: number;
    proveedor_id: string | null;
    nombre_proveedor: string;
    id_fiscal: string;
}

export const getRecibosFactura: GetRecibosFactura = async (facturaId) => {
    return RestAPI.get<{ datos: ReciboFacturaApi[] }>(
        `/tesoreria/recibo_pago/por_factura/${facturaId}`
    ).then((respuesta) => respuesta.datos.map((r): ReciboFactura => ({
        id: r.id,
        codigo: r.codigo,
        fecha_emision: r.fecha_emision,
        fecha_vencimiento: r.fecha_vencimiento,
        estado: r.estado,
        importe: r.importe,
    })));
};

export const getTrazaFactura = (id: string): Promise<unknown> => getTraza(`${baseUrl}/${id}`);

// ─── Importación de facturas desde fichero ───────────────────────────────────

export interface LineaFacturaLeidaApi {
    articulo_id: string | null;
    descripcion: string | null;
    cantidad: string | null;
    precio_unitario: string | null;
    descuento: string | null;
    ref_proveedor: string | null;
    ref_articulo: string | null;
    tipo_iva?: string | null;
    albaran_linea_id: string | null;
}

export interface FacturaLeidaApi {
    proveedor_id: string | null;
    proveedor_nombre: string | null;
    numero_proveedor: string | null;
    fecha: string | null;
    total: string | null;
    lineas: LineaFacturaLeidaApi[];
    albaran_ids?: string[];
    campos_faltantes: string[];
    fichero_origen: string | null;
    aceptar_total_discordante?: boolean;
}

interface SubcuentaPropuestaApi {
    codigo: string;
    descripcion: string;
    origen: SubcuentaPropuesta["origen"];
}

interface LineaPropuestaApi {
    indice: number;
    articulo_id: string | null;
    descripcion: string | null;
    grupo_iva_producto_id: string | null;
    cantidad: number | null;
    precio_leido: number | null;
    dto_leido: number | null;
    total_leido: number | null;
    precio_teorico: number | null;
    dto_teorico: number | null;
    total_teorico: number | null;
    subcuenta: SubcuentaPropuestaApi | null;
    albaran_linea_id: string | null;
    alertas: LineaPropuesta["alertas"];
}

interface AlbaranCandidatoApi {
    id: string;
    codigo: string;
    fecha: string;
    total: number;
    lineas: {
        id: string;
        articulo_id: string | null;
        descripcion: string;
        cantidad: number;
        precio: number | null;
        linea_factura: number | null;
    }[];
    cobertura: number;
    coincide: boolean;
    seleccionado: boolean;
}

interface PropuestaImportacionApi {
    factura_leida: FacturaLeidaApi;
    total_leido: number | null;
    total_calculado: number | null;
    total_teorico: number | null;
    lineas: LineaPropuestaApi[];
    albaranes: AlbaranCandidatoApi[];
    alertas: PropuestaImportacion["alertas"];
    modo_datos_contables: PropuestaImportacion["modoDatosContables"];
    opciones_datos_contables: { id: string; descripcion: string }[];
    cuenta_especial_compras: SubcuentaPropuestaApi | null;
}

const lineaFacturaLeidaDesdeApi = (l: LineaFacturaLeidaApi): LineaFacturaLeida => ({
    articuloId: l.articulo_id ?? null,
    descripcion: l.descripcion ?? null,
    cantidad: l.cantidad ?? null,
    precioUnitario: l.precio_unitario ?? null,
    descuento: l.descuento ?? null,
    refProveedor: l.ref_proveedor ?? null,
    refArticulo: l.ref_articulo ?? null,
    tipoIva: l.tipo_iva ?? null,
    albaranLineaId: l.albaran_linea_id ?? null,
});

export const facturaLeidaDesdeApi = (f: FacturaLeidaApi): FacturaLeida => ({
    proveedorId: f.proveedor_id ?? null,
    proveedorNombre: f.proveedor_nombre ?? null,
    numeroProveedor: f.numero_proveedor ?? null,
    fecha: f.fecha ?? null,
    total: f.total ?? null,
    lineas: (f.lineas ?? []).map(lineaFacturaLeidaDesdeApi),
    ...(f.albaran_ids !== undefined && f.albaran_ids !== null
        ? { albaranIds: f.albaran_ids }
        : {}),
    camposFaltantes: f.campos_faltantes ?? [],
    ficheroOrigen: f.fichero_origen ?? null,
    ...(f.aceptar_total_discordante !== undefined
        ? { aceptarTotalDiscordante: f.aceptar_total_discordante }
        : {}),
});

export const facturaLeidaAApi = (f: FacturaLeida): FacturaLeidaApi => ({
    proveedor_id: f.proveedorId,
    proveedor_nombre: f.proveedorNombre,
    numero_proveedor: f.numeroProveedor,
    fecha: f.fecha,
    total: f.total,
    lineas: f.lineas.map((l) => ({
        articulo_id: l.articuloId,
        descripcion: l.descripcion,
        cantidad: l.cantidad,
        precio_unitario: l.precioUnitario,
        descuento: l.descuento,
        ref_proveedor: l.refProveedor,
        ref_articulo: l.refArticulo,
        tipo_iva: l.tipoIva,
        albaran_linea_id: l.albaranLineaId,
    })),
    ...(f.albaranIds !== undefined ? { albaran_ids: f.albaranIds } : {}),
    campos_faltantes: f.camposFaltantes,
    fichero_origen: f.ficheroOrigen,
    ...(f.aceptarTotalDiscordante !== undefined
        ? { aceptar_total_discordante: f.aceptarTotalDiscordante }
        : {}),
});

const subcuentaDesdeApi = (s: SubcuentaPropuestaApi | null): SubcuentaPropuesta | null =>
    s ? { codigo: s.codigo, descripcion: s.descripcion, origen: s.origen } : null;

const lineaPropuestaDesdeApi = (l: LineaPropuestaApi): LineaPropuesta => ({
    indice: l.indice,
    articuloId: l.articulo_id,
    descripcion: l.descripcion,
    grupoIvaProductoId: l.grupo_iva_producto_id,
    cantidad: l.cantidad,
    precioLeido: l.precio_leido,
    dtoLeido: l.dto_leido,
    totalLeido: l.total_leido,
    precioTeorico: l.precio_teorico,
    dtoTeorico: l.dto_teorico,
    totalTeorico: l.total_teorico,
    subcuenta: subcuentaDesdeApi(l.subcuenta),
    albaranLineaId: l.albaran_linea_id,
    alertas: l.alertas ?? [],
});

const albaranCandidatoDesdeApi = (a: AlbaranCandidatoApi): AlbaranCandidato => ({
    id: a.id,
    codigo: a.codigo,
    fecha: a.fecha,
    total: a.total,
    lineas: a.lineas.map((l) => ({
        id: l.id,
        articuloId: l.articulo_id,
        descripcion: l.descripcion,
        cantidad: l.cantidad,
        precio: l.precio,
        lineaFactura: l.linea_factura,
    })),
    cobertura: a.cobertura,
    coincide: a.coincide,
    seleccionado: a.seleccionado,
});

export const propuestaImportacionDesdeApi = (p: PropuestaImportacionApi): PropuestaImportacion => ({
    facturaLeida: facturaLeidaDesdeApi(p.factura_leida),
    totalLeido: p.total_leido,
    totalCalculado: p.total_calculado,
    totalTeorico: p.total_teorico,
    lineas: (p.lineas ?? []).map(lineaPropuestaDesdeApi),
    albaranes: (p.albaranes ?? []).map(albaranCandidatoDesdeApi),
    alertas: p.alertas ?? [],
    modoDatosContables: p.modo_datos_contables,
    opcionesDatosContables: p.opciones_datos_contables ?? [],
    cuentaEspecialCompras: subcuentaDesdeApi(p.cuenta_especial_compras),
});

export const extraerFicheroFactura = async (fichero: File): Promise<ExtraccionFactura> => {
    const formData = new FormData();
    formData.append("fichero", fichero);
    const respuesta = await RestAPI.query<
        FormData,
        { factura_leida: FacturaLeidaApi; propuesta: PropuestaImportacionApi }
    >(
        `${baseUrl}/extraer-fichero`,
        formData,
        "Error al leer el fichero de factura"
    );
    return {
        facturaLeida: facturaLeidaDesdeApi(respuesta.factura_leida),
        propuesta: propuestaImportacionDesdeApi(respuesta.propuesta),
    };
};

export const proponerImportacion = async (
    facturaLeida: FacturaLeida
): Promise<PropuestaImportacion> => {
    const respuesta = await RestAPI.query<
        { factura_leida: FacturaLeidaApi },
        PropuestaImportacionApi
    >(
        `${baseUrl}/proponer-importacion`,
        { factura_leida: facturaLeidaAApi(facturaLeida) },
        "Error al calcular la propuesta de importación"
    );
    return propuestaImportacionDesdeApi(respuesta);
};

export const importarFacturaLeida = async (facturaLeida: FacturaLeida): Promise<string> => {
    const respuesta = await RestAPI.post(
        `${baseUrl}/importar`,
        { factura_leida: facturaLeidaAApi(facturaLeida) },
        "Error al importar la factura"
    );
    return respuesta.id;
};

export const importarDeHitl = async (
    tareaId: string,
    facturaLeida: FacturaLeida
): Promise<string> => {
    const respuesta = await RestAPI.post(
        `${baseUrl}/importar-de-hitl/${tareaId}`,
        { factura_leida: facturaLeidaAApi(facturaLeida) },
        "Error al importar la factura desde HITL"
    );
    return respuesta.id;
};

export const crearArticuloConProveedor = async (
    articulo: NuevoArticuloConProveedor
): Promise<string> => {
    const respuesta = await RestAPI.post(
        `${new ApiUrls().ARTICULO}/con-proveedor`,
        {
            id: articulo.id,
            descripcion: articulo.descripcion,
            grupo_iva_producto_id: articulo.grupoIvaProductoId,
            dato_contable: articulo.datoContable,
            proveedor_id: articulo.proveedorId,
            ref_proveedor: articulo.refProveedor,
            coste: articulo.coste,
            ...(articulo.divisaId ? { divisa_id: articulo.divisaId } : {}),
        },
        "Error al crear el artículo"
    );
    return respuesta.id;
};
