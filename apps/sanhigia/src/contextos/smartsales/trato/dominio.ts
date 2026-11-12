import { familiasATexto, familiasDesdeTexto } from "../tratos/dominio.ts";
import {
    AccionGanar,
    CambiosTratoAPI,
    DatosDocumento,
    EstadoTrato,
    FechasLicencia,
    FormularioEdicion,
    TipoDocumentoTrato,
    TratoDetalle,
    TratoDetalleAPI,
} from "./diseño.ts";

export const EVENTO_VENTA_REGULAR = { valor: "ventaregular", descripcion: "Venta regular" };

export const ORIGENES_MERCANCIA = [
    { valor: "Exportaciones", descripcion: "Península" },
    { valor: "IGIC", descripcion: "Canarias" },
];

const texto = (valor: number | null) => (valor ? String(valor) : null);

const estadoDesdeAPI = (estado: string | null): EstadoTrato => (estado === "Ganado" || estado === "Perdido" ? estado : "-");

export const tratoDesdeAPI = (trato: TratoDetalleAPI): TratoDetalle => ({
    id: String(trato.idtrato),
    titulo: trato.titulo,
    valor: Number(trato.valor) || 0,
    estado: estadoDesdeAPI(trato.estado),
    idTipoTrato: texto(trato.idtipotrato),
    tipoTrato: trato.tipotrato,
    fecha: trato.fecha?.slice(0, 10) ?? null,
    hora: trato.horaalta?.slice(0, 5) ?? null,
    codCliente: trato.codcliente,
    nombreCliente: trato.nombrecliente,
    codContacto: trato.codcontacto,
    nombreContacto: trato.nombrecontacto,
    codAgente: trato.codagente,
    idCampania: trato.idcampania,
    causaPerdida: trato.descripcionperdida,
    idPresupuesto: texto(trato.idpresupuesto),
    codPresupuesto: trato.codpresupuesto,
    idPedido: texto(trato.idpedido),
    codPedido: trato.codpedido,
    exigirPedido: !!trato.exigirgenerarpedido,
    idLicencia: texto(trato.idlicencia),
    familias: familiasDesdeTexto(trato.familias),
});

export const esTratoFarma = (trato: TratoDetalle, tipoTratoFarma: string | null) =>
    !!tipoTratoFarma && trato.idTipoTrato === tipoTratoFarma;

export const accionGanar = (trato: TratoDetalle, tipoTratoFarma: string | null): AccionGanar => {
    if (esTratoFarma(trato, tipoTratoFarma)) return "licencia";
    if (!trato.exigirPedido) return "ganar";
    return trato.idPresupuesto ? "aprobar_presupuesto" : "crear_pedido";
};

export const textoBotonGanar = (trato: TratoDetalle, tipoTratoFarma: string | null) => {
    if (trato.estado === "Ganado") return "Ganado";
    const textos: Record<AccionGanar, string> = {
        ganar: "Ganado",
        licencia: "Ganado",
        aprobar_presupuesto: "Aprobar presupuesto",
        crear_pedido: "Crear pedido",
    };
    return textos[accionGanar(trato, tipoTratoFarma)];
};

export const puedePerder = (trato: TratoDetalle) => !trato.idPedido && !trato.idLicencia;

export const puedeCrearPresupuesto = (trato: TratoDetalle) =>
    !trato.idPresupuesto && !trato.idPedido && trato.estado !== "Perdido";

export const puedeAsociarPedido = (trato: TratoDetalle) => trato.exigirPedido && !trato.idPedido && !trato.idPresupuesto;

export const puedeBorrar = (
    trato: TratoDetalle,
    agente: string | null,
    tipoTratoFarma: string | null,
    puedeBorrarAjenos: boolean
) => {
    if (trato.estado === "Ganado") return false;
    const esMio = !!agente && trato.codAgente === agente;
    return esTratoFarma(trato, tipoTratoFarma) ? esMio : esMio || puedeBorrarAjenos;
};

export const textoConfirmarBorrado = (tieneTareas: boolean, tienePresupuesto: boolean) => {
    if (tieneTareas && tienePresupuesto) return "El trato se eliminará definitivamente, así como las tareas y el presupuesto.";
    if (tieneTareas) return "El trato se eliminará definitivamente, así como las tareas.";
    if (tienePresupuesto) return "El trato se eliminará definitivamente, así como el presupuesto.";
    return "El trato se eliminará definitivamente.";
};

export const cambioEstado = (estado: EstadoTrato, idCausa: string | null = null): CambiosTratoAPI => ({
    estado,
    idperdida: estado === "Perdido" && idCausa ? Number(idCausa) : null,
});

export const formularioEdicion = (trato: TratoDetalle): FormularioEdicion => ({
    titulo: trato.titulo,
    valor: trato.valor,
    idTipoTrato: trato.idTipoTrato,
    codContacto: trato.codContacto,
    familias: trato.familias,
});

export const erroresEdicion = (formulario: FormularioEdicion) =>
    [
        !formulario.titulo.trim() && "Indica el título",
        !formulario.idTipoTrato && "Elige el tipo de trato",
        formulario.valor < 0 && "El valor no puede ser negativo",
    ].filter((e): e is string => !!e);

export const edicionParaAPI = (formulario: FormularioEdicion): CambiosTratoAPI => ({
    titulo: formulario.titulo.trim().slice(0, 100),
    valor: formulario.valor,
    idtipotrato: formulario.idTipoTrato ? Number(formulario.idTipoTrato) : null,
    codcontacto: formulario.codContacto,
    familias: familiasATexto(formulario.familias),
});

export const erroresDocumento = (datos: DatosDocumento, conDireccion: boolean) =>
    [
        conDireccion && !datos.codDireccion && "Elige la dirección de envío",
        !datos.codEvento && "Elige el evento o venta regular",
    ].filter((e): e is string => !!e);

export const documentoParaAPI = (
    documento: TipoDocumentoTrato,
    trato: TratoDetalle,
    datos: DatosDocumento,
    hoy: string
) => {
    const comunes = {
        idtrato: Number(trato.id),
        idcampania: trato.idCampania,
        codcliente: trato.codCliente,
        codagente: trato.codAgente,
        coddir: datos.codDireccion,
        regimeniva: datos.regimenIva,
    };
    return documento === "presupuesto"
        ? { ...comunes, sh_codevento: datos.codEvento }
        : { ...comunes, codevento: datos.codEvento, fechasalida: hoy, sh_ctrlestadoborr: true };
};

export const erroresLicencia = (fechas: FechasLicencia) =>
    [
        !fechas.fin && "Indica la fecha de finalización del proceso",
        !fechas.caducidad && "Indica la fecha de caducidad de la licencia",
    ].filter((e): e is string => !!e);

export const licenciaParaAPI = (trato: TratoDetalle, fechas: FechasLicencia) => ({
    idtrato: Number(trato.id),
    codcliente: trato.codCliente,
    fechacaducidad: fechas.caducidad,
    fechafin: fechas.fin,
    fechainicio: trato.fecha,
    tipo: "Tratamiento de regeneración ósea",
    estado: "Presentada",
    codagente: trato.codAgente,
});
