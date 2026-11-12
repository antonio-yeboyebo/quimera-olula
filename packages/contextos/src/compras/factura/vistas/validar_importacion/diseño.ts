export type LineaFacturaLeida = {
    articuloId: string | null;
    descripcion: string | null;
    cantidad: string | null;
    precioUnitario: string | null;
    descuento: string | null;
    refProveedor: string | null;
    refArticulo: string | null;
    tipoIva: string | null;
    albaranLineaId: string | null;
};

export type FacturaLeida = {
    proveedorId: string | null;
    proveedorNombre: string | null;
    numeroProveedor: string | null;
    /** YYYY-MM-DD */
    fecha: string | null;
    total: string | null;
    lineas: LineaFacturaLeida[];
    /** undefined = que el servidor preseleccione; [] = el usuario no quiere ninguno. */
    albaranIds?: string[];
    camposFaltantes: string[];
    ficheroOrigen: string | null;
    aceptarTotalDiscordante?: boolean;
};

export type AlertaImportacion = "sin_proveedor" | "total_discordante" | "lineas_sin_albaran";

export type AlertaLineaImportacion =
    | "sin_articulo"
    | "sin_subcuenta"
    | "sin_coste_proveedor"
    | "precio_distinto"
    | "dto_distinto"
    | "sin_precio"
    | "sin_albaran";

export type OrigenSubcuenta = "articulo" | "grupo_contable" | "cuenta_especial";

export type SubcuentaPropuesta = {
    codigo: string;
    descripcion: string;
    origen: OrigenSubcuenta;
};

export type LineaPropuesta = {
    indice: number;
    articuloId: string | null;
    descripcion: string | null;
    grupoIvaProductoId: string | null;
    cantidad: number | null;
    precioLeido: number | null;
    dtoLeido: number | null;
    totalLeido: number | null;
    precioTeorico: number | null;
    dtoTeorico: number | null;
    totalTeorico: number | null;
    subcuenta: SubcuentaPropuesta | null;
    albaranLineaId: string | null;
    alertas: AlertaLineaImportacion[];
};

export type LineaAlbaranCandidato = {
    id: string;
    articuloId: string | null;
    descripcion: string;
    cantidad: number;
    precio: number | null;
    lineaFactura: number | null;
};

export type AlbaranCandidato = {
    id: string;
    codigo: string;
    fecha: string;
    total: number;
    lineas: LineaAlbaranCandidato[];
    cobertura: number;
    coincide: boolean;
    seleccionado: boolean;
};

export type ModoDatosContables = "subcuenta" | "grupo_contable";

export type OpcionDatoContable = { id: string; descripcion: string };

export type PropuestaImportacion = {
    facturaLeida: FacturaLeida;
    totalLeido: number | null;
    totalCalculado: number | null;
    totalTeorico: number | null;
    lineas: LineaPropuesta[];
    albaranes: AlbaranCandidato[];
    alertas: AlertaImportacion[];
    modoDatosContables: ModoDatosContables;
    opcionesDatosContables: OpcionDatoContable[];
    cuentaEspecialCompras: SubcuentaPropuesta | null;
};

export type ExtraccionFactura = {
    facturaLeida: FacturaLeida;
    propuesta: PropuestaImportacion;
};

export type NuevoArticuloConProveedor = {
    id: string;
    descripcion: string;
    grupoIvaProductoId: string;
    datoContable: string | null;
    proveedorId: string;
    refProveedor: string;
    coste: number;
    divisaId?: string;
};

export type EstadoValidarImportacion =
    | "CARGANDO_PROPUESTA"
    | "EDITANDO"
    | "CREANDO_ARTICULO"
    | "CONFIRMANDO";

export type ContextoValidarImportacion = {
    estado: EstadoValidarImportacion;
    facturaLeida: FacturaLeida;
    propuesta: PropuestaImportacion | null;
    /** Hay ediciones locales (precio, cantidad…) aún no enviadas a proponer-importacion. */
    sucia: boolean;
    /** Índice de la línea para la que se está creando artículo. */
    lineaArticulo: number | null;
};

export type ArticuloCreadoImportacion = {
    articuloId: string;
    descripcion: string;
};

/** Fichero original de la factura, para verlo junto a los datos leídos. */
export type TipoFicheroOriginal = "pdf" | "imagen";

export type FicheroOriginal = {
    url: string;
    tipo: TipoFicheroOriginal;
};
