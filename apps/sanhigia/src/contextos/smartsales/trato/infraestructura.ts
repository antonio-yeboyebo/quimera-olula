import { LegacyAPI, legacyUrl } from "@olula/lib/api/legacy_api.ts";
import { fechaIso } from "../comun/dominio.ts";
import { CambiosTratoAPI, Nota, Opcion, TratoDetalle, TratoDetalleAPI } from "./diseño.ts";
import { tratoDesdeAPI } from "./dominio.ts";

const camposTrato = [
    "idtrato",
    "titulo",
    "valor",
    "estado",
    "idtipotrato",
    "tipotrato",
    "fecha",
    "horaalta",
    "codcliente",
    "nombrecliente",
    "codcontacto",
    "nombrecontacto",
    "codagente",
    "idcampania",
    "descripcionperdida",
    "idpresupuesto",
    "codpresupuesto",
    "idpedido",
    "codpedido",
    "exigirgenerarpedido",
    "idlicencia",
    "familias",
];

export const getTrato = async (id: string): Promise<TratoDetalle> => {
    const respuesta = await LegacyAPI.get<{ data: TratoDetalleAPI[] }>(legacyUrl("ss_tratos", { id, params: { fields: camposTrato } }));
    const trato = respuesta.data[0];
    if (!trato) throw { nombre: "Trato no encontrado", descripcion: `No existe el trato ${id} o no tienes acceso` };
    return tratoDesdeAPI(trato);
};

export const actualizarTrato = (id: string, cambios: CambiosTratoAPI) =>
    LegacyAPI.patch<CambiosTratoAPI>(legacyUrl("ss_tratos", { id }), cambios);

export const borrarTrato = (id: string) => LegacyAPI.delete(legacyUrl("ss_tratos", { id }));

export const getNotas = async (idTrato: string): Promise<Nota[]> => {
    const respuesta = await LegacyAPI.get<{ data: { idnota: number; texto: string; fecha: string }[] }>(
        legacyUrl("ss_tratos", {
            action: "get_notas",
            staticAction: true,
            params: {
                filter: { and: [["idtrato", "eq", Number(idTrato)]] },
                order: { field: "fecha", direction: "DESC" },
                page: { limit: 100 },
            },
        })
    );
    return respuesta.data.map((n) => ({ id: String(n.idnota), texto: n.texto, fecha: n.fecha.slice(0, 10) }));
};

export const añadirNota = (idTrato: string, texto: string) =>
    LegacyAPI.post(legacyUrl("ss_tratos", { action: "add_nota", staticAction: true }), {
        idtrato: Number(idTrato),
        texto,
        fecha: fechaIso(new Date()),
    });

export const getCausasPerdida = async (idTipoTrato: string | null): Promise<Opcion[]> => {
    const respuesta = await LegacyAPI.get<{ data: { idperdida: number; descripcion: string }[] }>(
        legacyUrl("ss_causasperdidatrato", {
            params: {
                filter: idTipoTrato ? { and: [["idtipotrato", "eq", Number(idTipoTrato)]] } : undefined,
                fields: ["idperdida", "descripcion"],
                order: { field: "idperdida", direction: "ASC" },
                page: { limit: 100 },
            },
        })
    );
    return respuesta.data.map((c) => ({ valor: String(c.idperdida), descripcion: c.descripcion }));
};

export const tieneDireccionAutomatica = async (codCliente: string): Promise<boolean> => {
    const respuesta = await LegacyAPI.get<{ data: { dir_auto: boolean } }>(
        legacyUrl("ss_tratos", { action: "data_direcciones_cliente", staticAction: true, params: { extra: { codcliente: codCliente } } })
    );
    return !!respuesta.data.dir_auto;
};

export const getDireccionesEnvio = async (codCliente: string): Promise<Opcion[]> => {
    const respuesta = await LegacyAPI.get<{
        data: { id: number; direccion: string | null; codpostal: string | null; ciudad: string | null }[];
    }>(
        legacyUrl("dirclientes", {
            params: {
                filter: { and: [["domenvio", "eq", true], ["codcliente", "eq", codCliente]] },
                fields: ["id", "direccion", "codpostal", "ciudad"],
                page: { limit: 50 },
            },
        })
    );
    return respuesta.data.map((d) => ({
        valor: String(d.id),
        descripcion: [d.direccion, d.codpostal, d.ciudad].filter(Boolean).join(", "),
    }));
};

export const esDireccionCanarias = async (idDireccion: string): Promise<boolean> => {
    const respuesta = await LegacyAPI.get<{ esCanarias: boolean }>(
        legacyUrl("dirclientes", { id: idDireccion, action: "check_dir_canarias" })
    );
    return !!respuesta.esCanarias;
};

export const buscarEventos = async (texto: string): Promise<Opcion[]> => {
    const haceDosMeses = new Date();
    haceDosMeses.setMonth(haceDosMeses.getMonth() - 2);
    const respuesta = await LegacyAPI.get<{ data: { codevento: string; nombre: string }[] }>(
        legacyUrl("eventos", {
            params: {
                filter: {
                    and: [
                        ["fechaalta", "gte", fechaIso(haceDosMeses)],
                        ["tipoevento", "eq", "Curso"],
                        { or: [["codevento", "like", texto], ["nombre", "like", texto]] },
                    ],
                },
                fields: ["codevento", "nombre"],
                page: { limit: 50 },
            },
        })
    );
    return respuesta.data.map((e) => ({ valor: e.codevento, descripcion: e.nombre }));
};

export const crearPresupuestoTrato = (datos: object) =>
    LegacyAPI.post<object, number>(legacyUrl("ss_tratos", { action: "crear_presupuesto_trato", staticAction: true }), datos);

export const crearPedidoTrato = (datos: object) =>
    LegacyAPI.post<object, number>(legacyUrl("ss_tratos", { action: "crear_pedido_trato", staticAction: true }), datos);

export const aprobarPresupuesto = async (trato: TratoDetalle) => {
    const respuesta = await LegacyAPI.patch<object, { idpedido: number } | null>(
        legacyUrl("ss_tratos", { action: "aprobar_presupuesto", staticAction: true }),
        { idpresupuesto: Number(trato.idPresupuesto), idpedido: trato.idPedido ? Number(trato.idPedido) : null, idtrato: Number(trato.id) }
    );
    const idPedido = respuesta?.idpedido;
    if (!idPedido) return;
    await LegacyAPI.patch(legacyUrl("ss_tratos", { action: "actualiza_estado_pago_borrador", staticAction: true }), {
        idpedido: idPedido,
    });
    await LegacyAPI.patch(legacyUrl("pedidoscli", { id: String(idPedido), action: "enviar_pda" }), {});
};

export const crearLicencia = (licencia: object) => LegacyAPI.post(legacyUrl("licenciascli"), licencia);

export const borrarLicencia = (idLicencia: string) => LegacyAPI.delete(legacyUrl("licenciascli", { id: idLicencia }));

export const buscarPedidosCliente = async (codCliente: string | null, texto: string): Promise<Opcion[]> => {
    const respuesta = await LegacyAPI.get<{ data: { idpedido: number; codigo: string; nombrecliente: string; fecha: string }[] }>(
        legacyUrl("pedidoscli", {
            params: {
                filter: {
                    and: [
                        ...(codCliente ? [["codcliente", "eq", codCliente]] : []),
                        { or: [["codigo", "like", texto], ["nombrecliente", "like", texto]] },
                    ],
                },
                fields: ["idpedido", "codigo", "nombrecliente", "fecha"],
                order: { field: "fecha", direction: "DESC" },
                page: { limit: 50 },
            },
        })
    );
    return respuesta.data.map((p) => ({
        valor: String(p.idpedido),
        descripcion: `${p.codigo} · ${p.nombrecliente} · ${p.fecha.slice(0, 10)}`,
    }));
};

export const asociarPedido = (idPedido: string, idTrato: string) =>
    LegacyAPI.patch<{ idtrato: number }, { pk: number; codcliente: string }>(legacyUrl("pedidoscli", { id: idPedido }), {
        idtrato: Number(idTrato),
    });
