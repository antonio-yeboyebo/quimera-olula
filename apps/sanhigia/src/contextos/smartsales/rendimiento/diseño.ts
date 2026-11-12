export type VentasPeriodo = {
    ventas: number;
    objetivo: number;
    ventasAñoAnterior: number;
};

export type VentasPeriodoAPI = {
    total: number;
    goal: number;
    previous_year_sold: number;
};

export type MesHistorico = {
    mes: string;
    ventas: number | null;
    objetivo: number;
    prevision: number | null;
};

export type HistoricoAPI = {
    meses: string[];
    ventas: (number | null)[];
    objetivo: number[];
    prevision: (number | null)[];
};

export type VentasSubfamilia = {
    codigo: string;
    descripcion: string;
    importe: number;
    importeAnterior: number;
};

export type VentasFamilia = VentasSubfamilia & {
    objetivo: number | null;
    subfamilias: VentasSubfamilia[];
};

type VentasSubfamiliaAPI = {
    codsubfamilia: string;
    descripcion: string;
    importe: number;
    importe_anterior: number;
};

export type VentasFamiliaAPI = {
    codfamilia: string;
    descripcion: string;
    importe: number;
    importe_anterior: number;
    objetivo: number | null;
    subfamilias: VentasSubfamiliaAPI[];
};
