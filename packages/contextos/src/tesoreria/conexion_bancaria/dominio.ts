import { MetaModelo } from "@olula/lib/dominio.ts";
import {
    ConexionBancaria,
    CuentaConexionBancaria,
    EstadoConexionBancaria,
    SubcuentasPrestamo,
    TipoProductoBancario,
} from "./diseño.ts";
import { tTesoreria } from "../i18n/index.ts";

export const conexionBancariaVacia: ConexionBancaria = {
    id: "",
    proveedor: "",
    institucionId: null,
    institucionNombre: null,
    estado: "activa",
    tiposProducto: ["accounts"],
    ultimaSincronizacion: null,
    ultimoError: null,
    creadoEn: new Date(0),
    cuentas: [],
};

export const ETIQUETA_ESTADO_CONEXION_BANCARIA: Record<EstadoConexionBancaria, string> = {
    get activa() { return tTesoreria("conexion_bancaria.activa"); },
    get requiere_reautenticacion() { return tTesoreria("conexion_bancaria.requiereReautenticacion"); },
};

export const etiquetaEstadoConexionBancaria = (estado: EstadoConexionBancaria): string =>
    ETIQUETA_ESTADO_CONEXION_BANCARIA[estado];

export const requiereReautenticacion = (conexion: ConexionBancaria): boolean =>
    conexion.estado === "requiere_reautenticacion";

/**
 * Etiqueta legible de la institución — el proveedor no siempre devuelve el
 * nombre (p.ej. justo tras el alta, antes de que se resuelva del todo).
 */
export const nombreInstitucion = (conexion: ConexionBancaria): string =>
    conexion.institucionNombre ?? conexion.institucionId ?? tTesoreria("conexion_bancaria.bancoSinIdentificar");

export const TIPOS_PRODUCTO_BANCARIO: TipoProductoBancario[] = ["accounts", "loans"];

const ETIQUETA_TIPO_PRODUCTO: Record<TipoProductoBancario, string> = {
    get accounts() { return tTesoreria("conexion_bancaria.cuentas"); },
    get loans() { return tTesoreria("conexion_bancaria.prestamos"); },
};

export const etiquetaTipoProducto = (tipo: TipoProductoBancario): string => ETIQUETA_TIPO_PRODUCTO[tipo];

/** Un producto préstamo no recibe movimientos: no se asocia a una cuenta bancaria de la empresa. */
export const esPrestamo = (cuenta: CuentaConexionBancaria): boolean => cuenta.tipo === "loans";

/** Tipos de producto pedidos que todavía no ha devuelto el banco: llegan al volver a leerlo. */
export const tiposProductoSinLeer = (conexion: ConexionBancaria): TipoProductoBancario[] =>
    conexion.tiposProducto.filter((tipo) =>
        tipo === "loans" && !conexion.cuentas.some((cuenta) => cuenta.tipo === tipo));

export const conTipoProducto = (
    tipos: TipoProductoBancario[],
    tipo: TipoProductoBancario,
    incluido: boolean,
): TipoProductoBancario[] =>
    TIPOS_PRODUCTO_BANCARIO.filter((t) => (t === tipo ? incluido : tipos.includes(t)));

/** Constante estable (no función): useModelo la usa como dependencia por referencia. */
export const metaSubcuentasPrestamo: MetaModelo<SubcuentasPrestamo> = {
    campos: {
        codigoSubcuentaCapital: { requerido: true },
        codigoSubcuentaIntereses: { requerido: true },
    },
};
