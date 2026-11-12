import { Trimestre } from "../comun/diseño.ts";
import { BloqueKpi, BloqueKpiAPI } from "../hoy/diseño.ts";
import { ClienteRecomendado, ClienteRecomendadoAPI, LineaClientesNuevos, LineaClientesNuevosAPI } from "./diseño.ts";

export const textoKpiTrimestres = (trimestres: Trimestre[]) => trimestres.map((t) => `${t.año}-T${t.numero}`).join(",");

export const totalesKpi = (bloque: BloqueKpi) =>
    bloque.lineas.reduce(
        (total, linea) => ({ objetivo: total.objetivo + linea.objetivo, alcanzada: total.alcanzada + linea.alcanzada }),
        { objetivo: 0, alcanzada: 0 }
    );

export const productosDelObjetivo = (bloque: BloqueKpiAPI | undefined) => {
    const lineas = bloque?.detalle ?? [];
    return {
        familias: [...new Set(lineas.filter((l) => l.codfamilia && !l.codsubfamilia).map((l) => l.codfamilia!))],
        subfamilias: [...new Set(lineas.filter((l) => l.codsubfamilia).map((l) => l.codsubfamilia!))],
    };
};

export const lineaClientesNuevosDesdeAPI = (linea: LineaClientesNuevosAPI): LineaClientesNuevos => ({
    clave: `${linea.codfamilia}|${linea.codsubfamilia}`,
    descripcion: linea.descripcion ?? (linea.codsubfamilia || linea.codfamilia),
    clientes: linea.clientes.map((c) => ({ codCliente: c.codcliente, nombre: c.nombre, importe: Number(c.importe) || 0 })),
});

export const clienteRecomendadoDesdeAPI = (cliente: ClienteRecomendadoAPI): ClienteRecomendado => ({
    codCliente: cliente.codcliente,
    coddir: cliente.coddir,
    nombre: cliente.nombre,
    ciudad: cliente.ciudad,
    score: Number(cliente.score) || 0,
});

export const sinRepetir = (clientes: ClienteRecomendado[]) => {
    const vistos = new Set<number>();
    return clientes.filter((c) => !vistos.has(c.coddir) && vistos.add(c.coddir));
};
