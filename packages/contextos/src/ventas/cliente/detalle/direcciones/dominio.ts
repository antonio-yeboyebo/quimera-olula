import { ProcesarContexto } from "@olula/lib/diseño.js";
import { boolAString, ejecutarListaProcesos, formatearDireccionUnaLinea } from "@olula/lib/dominio.js";
import { accionesListaEntidades, ProcesarListaEntidades } from "@olula/lib/ListaEntidades.js";
import { tVentas } from "../../../i18n/index.ts";
import { DirCliente } from "../../diseño.ts";
import { getDirecciones, setDirEnvio, setDirFacturacion } from "../../infraestructura.ts";
import { ContextoDirecciones, EstadoDirecciones } from "./diseño.ts";

/** Columnas de las direcciones, en el idioma activo (se piden al pintar). */
export const metaTablaDirecciones = () => [
    {
        id: "direccion",
        cabecera: tVentas("cliente.direccion.direccion"),
        render: (direccion: DirCliente) => formatearDireccionUnaLinea(direccion),
    },
    { id: "cod_postal", cabecera: tVentas("cliente.direccion.codPostal") },
    { id: "provincia", cabecera: tVentas("cliente.direccion.provincia") },
    { id: "pais_id", cabecera: tVentas("cliente.direccion.pais") },
    { id: "telefono", cabecera: tVentas("cliente.direccion.telefono") },
    {
        id: "dir_facturacion",
        cabecera: tVentas("cliente.direccion.facturacion"),
        render: (direccion: DirCliente) => boolAString(direccion.dir_facturacion),
    },
    {
        id: "dir_envio",
        cabecera: tVentas("cliente.direccion.envio"),
        render: (direccion: DirCliente) => boolAString(direccion.dir_envio),
    },
];

export { metaNuevaDireccion, nuevaDireccionVacia } from "../../crear_direccion/dominio.ts";
export { metaDireccion } from "../../cambiar_direccion/dominio.ts";

type ProcesarDirecciones = ProcesarContexto<EstadoDirecciones, ContextoDirecciones>;

const pipeDirecciones = ejecutarListaProcesos<EstadoDirecciones, ContextoDirecciones>;

const conDirecciones = (fn: ProcesarListaEntidades<DirCliente>) => (ctx: ContextoDirecciones) => ({ ...ctx, direcciones: fn(ctx.direcciones) });

export const Direcciones = accionesListaEntidades(conDirecciones);

export const cargarDirecciones: ProcesarDirecciones = async (contexto, payload) => {
    const clienteId = (payload as string) || contexto.clienteId;
    const resultado = await getDirecciones(clienteId);
    const contextoActualizado = await Direcciones.recargar(contexto, { datos: resultado, total: resultado.length });
    return {
        ...contextoActualizado,
        clienteId,
        cargando: false,
    }
}

export const activarDireccion: ProcesarDirecciones = async (contexto, payload) => {
    const direccionActiva = payload as DirCliente;
    return Direcciones.activar(contexto, direccionActiva);
}

export const cancelarAlta: ProcesarDirecciones = async (contexto) => {
    return {
        ...contexto,
        direccionActiva: null,
        estado: "lista"
    }
}

export const cancelarEdicion: ProcesarDirecciones = async (contexto) => {
    return {
        ...contexto,
        direccionActiva: null,
        estado: "lista"
    }
}

export const cancelarConfirmacion: ProcesarDirecciones = async (contexto) => {
    return {
        ...contexto,
        estado: "lista"
    }
}

export const direccionCreada: ProcesarDirecciones = async (contexto) => {
    return pipeDirecciones(contexto, [
        cargarDirecciones,
        "lista"
    ]);
}

export const direccionActualizada: ProcesarDirecciones = async (contexto) => {
    return pipeDirecciones(contexto, [
        cargarDirecciones,
        "lista"
    ]);
}

export const borrarDireccion: ProcesarDirecciones = async (contexto) => {
    return pipeDirecciones(contexto, [
        cargarDirecciones,
        "lista"
    ]);
}

export const puedoMarcarDireccionFacturacion = (direccion: DirCliente) => {
    return !direccion.dir_facturacion;
}

export const marcarDireccionFacturacion: ProcesarDirecciones = async (contexto) => {
    if (!contexto.direcciones.activo?.id) return contexto;

    await setDirFacturacion(contexto.clienteId, contexto.direcciones.activo.id);

    return pipeDirecciones(contexto, [
        cargarDirecciones,
    ]);
}

export const puedoMarcarDireccionEnvio = (direccion: DirCliente) => {
    return !direccion.dir_envio;
}

export const marcarDireccionEnvio: ProcesarDirecciones = async (contexto) => {
    if (!contexto.direcciones.activo?.id) return contexto;

    await setDirEnvio(contexto.clienteId, contexto.direcciones.activo.id);

    return pipeDirecciones(contexto, [
        cargarDirecciones,
    ]);
}
