export type TipoAgente = "factura" | "cliente";

export type FiltroInformeComparativaVentas = {
    anioHasta: string;
    fechaDesde: string;
    fechaHasta: string;
    agenteId: string;
    tipoAgente: TipoAgente;
    clienteId: string;
    provinciaId: string;
    mostrarObjetivo: boolean;
};

export type GetInformeComparativaVentas = (filtro: FiltroInformeComparativaVentas) => Promise<Blob>;
