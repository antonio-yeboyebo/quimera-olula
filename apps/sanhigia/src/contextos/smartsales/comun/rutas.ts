import { TipoProducto } from "../nueva_tarea/diseño.ts";

const conParametros = (ruta: string, parametros: Record<string, string | null | undefined>) => {
    const query = new URLSearchParams(
        Object.entries(parametros).filter((par): par is [string, string] => !!par[1])
    ).toString();
    return query ? `${ruta}?${query}` : ruta;
};

export const rutasSmartsales = {
    hoy: "/ss/dashboard",
    tareasAtrasadas: "/ss/dashboard/atrasadas",
    agenda: "/ss/mi-agenda",
    clientes: "/ss/mis-clientes",
    fichaCliente: (codCliente: string) => `/ss/mis-clientes/${codCliente}`,
    campanias: "/ss/mis-campanias",
    nuevaCampania: "/ss/mis-campanias/nueva",
    campania: (id: string) => `/ss/mis-campanias/${id}`,
    tratos: "/ss/mis-tratos",
    nuevoTrato: "/ss/mi-trato/nuevo",
    nuevoTratoDesde: (codCliente: string, producto?: { tipo: TipoProducto; codigo: string }) =>
        conParametros("/ss/mi-trato/nuevo", { cliente: codCliente, [producto?.tipo ?? "producto"]: producto?.codigo }),
    nuevaTarea: "/ss/mi-tarea/nueva",
    nuevaTareaPara: (codCliente: string, idTrato?: string | null) =>
        conParametros("/ss/mi-tarea/nueva", { cliente: codCliente, trato: idTrato }),
    nuevoContacto: "/ss/mi-contacto/nuevo",
    contacto: (codContacto: string) => `/ss/mi-contacto/${codContacto}`,
    contactosCursos: "/ss/contactos/cursos/",
    contactosActivos: "/ss/contactos/activos/",
    pedidosOtrosAgentes: "/ss/ventas/pedidos/otrosagentes",
    trato: (id: string) => `/ss/mi-trato/${id}`,
    tratoLegacy: (id: string) => `/ss/trato/${id}`,
    nuevaTareaTratoLegacy: (id: string) => `/ss/trato/${id}/tarea/nueva`,
    presupuesto: (id: string) => `/ventas/presupuestos/${id}`,
    pedido: (id: string) => `/ventas/pedidos/${id}`,
    tarea: (id: string) => `/ss/mi-tarea/${id}`,
    rendimiento: "/ss/mi-rendimiento",
    objetivos: "/ss/mi-objetivo",
    mapa: "/ss/mapa",
    prospeccion: "/ss/prospeccion",
};
