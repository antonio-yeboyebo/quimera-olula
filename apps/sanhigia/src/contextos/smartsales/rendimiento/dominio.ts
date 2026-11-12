import { Periodo } from "../comun/diseño.ts";
import { HistoricoAPI, MesHistorico, VentasFamilia, VentasFamiliaAPI } from "./diseño.ts";

export const parametrosPeriodo = (periodo: Periodo, agente: string | null): Record<string, string | boolean | number> => {
    const codAgente = agente ?? "TODOS";
    if (periodo.tipo === "fechas") {
        return { codAgente, customDates: true, dateFrom: periodo.desde, dateTo: periodo.hasta };
    }
    const numeros = periodo.trimestres.map((t) => t.numero);
    return {
        codAgente,
        customDates: false,
        anio: periodo.trimestres[0]?.año ?? new Date().getFullYear(),
        ...Object.fromEntries([1, 2, 3, 4].map((n) => [`T${n}`, numeros.includes(n as 1 | 2 | 3 | 4)])),
    };
};

export const periodoCompleto = (periodo: Periodo) =>
    periodo.tipo === "fechas" ? !!periodo.desde && !!periodo.hasta && periodo.desde <= periodo.hasta : periodo.trimestres.length > 0;

export const añoDelPeriodo = (periodo: Periodo, hoy: Date = new Date()) =>
    periodo.tipo === "trimestres"
        ? (periodo.trimestres[0]?.año ?? hoy.getFullYear())
        : Number(periodo.desde.slice(0, 4)) || hoy.getFullYear();

export const variacion = (actual: number, anterior: number): number | null =>
    anterior > 0 ? (actual * 100) / anterior - 100 : null;

export const textoVariacion = (valor: number | null) =>
    valor === null ? "—" : `${valor > 0 ? "+" : ""}${valor.toFixed(1)} %`;

export const historicoDesdeAPI = (historico: HistoricoAPI): MesHistorico[] =>
    historico.meses.map((mes, i) => ({
        mes,
        ventas: historico.ventas[i] ?? null,
        objetivo: Number(historico.objetivo[i]) || 0,
        prevision: historico.prevision[i] ?? null,
    }));

export const maximoHistorico = (meses: MesHistorico[]) =>
    Math.max(0, ...meses.flatMap((m) => [m.ventas ?? 0, m.objetivo, m.prevision ?? 0]));

export const familiaDesdeAPI = (familia: VentasFamiliaAPI): VentasFamilia => ({
    codigo: familia.codfamilia,
    descripcion: familia.descripcion,
    importe: Number(familia.importe) || 0,
    importeAnterior: Number(familia.importe_anterior) || 0,
    objetivo: familia.objetivo ? Number(familia.objetivo) : null,
    subfamilias: familia.subfamilias.map((s) => ({
        codigo: s.codsubfamilia,
        descripcion: s.descripcion,
        importe: Number(s.importe) || 0,
        importeAnterior: Number(s.importe_anterior) || 0,
    })),
});
