import {
    EstadoTratoFiltro,
    FamiliaTrato,
    FiltrosTratos,
    FormularioTrato,
    NuevoTratoAPI,
    OrigenTrato,
    TratoListaAPI,
} from "./diseño.ts";

export const CUENTA_CAMPANIAS_COMERCIAL = "comercial";

export const origenTrato = (trato: TratoListaAPI, tipoTratoFarma: string | null): OrigenTrato => {
    if (tipoTratoFarma && String(trato.idtipotrato) === tipoTratoFarma) return "farma";
    if (!trato.idcampania) return null;
    return trato.cuentamarketing === CUENTA_CAMPANIAS_COMERCIAL ? "campaña" : "mkt";
};

const clausulaEstado: Record<EstadoTratoFiltro, unknown[] | null> = {
    abiertos: ["estado", "eq", "-"],
    ganados: ["estado", "eq", "Ganado"],
    perdidos: ["estado", "eq", "Perdido"],
    todos: null,
};

export const filtroTratos = (filtros: FiltrosTratos, conEstado = true) => {
    const clausulas: unknown[] = [];
    if (filtros.agente) {
        clausulas.push({ or: [["codagente", "eq", filtros.agente], ["codagenteobservador", "eq", filtros.agente]] });
    }
    if (conEstado && clausulaEstado[filtros.estado]) clausulas.push(clausulaEstado[filtros.estado]);
    if (filtros.titulo) clausulas.push(["titulo", "like", filtros.titulo]);
    if (filtros.contacto) clausulas.push(["nombrecontacto", "like", filtros.contacto]);
    if (filtros.codCliente) clausulas.push(["codcliente", "eq", filtros.codCliente]);
    if (filtros.cifNif) clausulas.push(["cifnif", "like", filtros.cifNif]);
    if (filtros.desde) clausulas.push(["fecha", "gte", filtros.desde]);
    if (filtros.hasta) clausulas.push(["fecha", "lte", filtros.hasta]);
    return clausulas.length ? { and: clausulas } : undefined;
};

export const totalesDesdeAPI = ({ total, ganados, perdidos }: { total: number; ganados: number; perdidos: number }) => ({
    abiertos: Math.max(Number(total) - Number(ganados) - Number(perdidos), 0),
    ganados: Number(ganados),
    perdidos: Number(perdidos),
});

export const erroresTrato = (formulario: FormularioTrato): string[] =>
    [
        !formulario.titulo.trim() && "Indica el título",
        !formulario.cliente && "Elige un cliente",
        !formulario.idTipoTrato && "Elige el tipo de trato",
        formulario.valor < 0 && "El valor no puede ser negativo",
    ].filter((e): e is string => !!e);

export const familiasATexto = (familias: FamiliaTrato[]) => familias.map((familia) => JSON.stringify(familia)).join(";");

export const familiasDesdeTexto = (texto: string | null): FamiliaTrato[] =>
    (texto ?? "")
        .split(";")
        .filter(Boolean)
        .flatMap((familia) => {
            try {
                return [JSON.parse(familia) as FamiliaTrato];
            } catch {
                return [];
            }
        });

export const tratoParaAPI = (formulario: FormularioTrato): NuevoTratoAPI => {
    const producto = formulario.producto;
    return {
        titulo: formulario.titulo.trim().slice(0, 100),
        codcliente: formulario.cliente!.codigo,
        idtipotrato: formulario.idTipoTrato ? Number(formulario.idTipoTrato) : null,
        valor: formulario.valor,
        familias: familiasATexto(formulario.familias),
        referencia: producto?.tipo === "articulo" ? producto.codigo : null,
        codfamilia: producto?.tipo === "familia" ? producto.codigo : null,
        codsubfamilia: producto?.tipo === "subfamilia" ? producto.codigo : null,
    };
};
