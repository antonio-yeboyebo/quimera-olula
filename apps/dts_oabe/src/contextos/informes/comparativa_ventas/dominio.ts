import { rangoDesdeAtajo } from "@olula/lib/infraestructura.ts";
import { FiltroInformeComparativaVentas, TipoAgente } from "./diseño.ts";

const NUMERO_ANIOS = 3;

export const opcionesTipoAgente: { valor: TipoAgente; descripcion: string }[] = [
    { valor: "factura", descripcion: "Agente en factura" },
    { valor: "cliente", descripcion: "Agente en ficha de cliente" },
];

export const filtroInformeComparativaVentasVacio = (): FiltroInformeComparativaVentas => ({
    anioHasta: String(new Date().getFullYear()),
    fechaDesde: "",
    fechaHasta: "",
    agenteId: "",
    tipoAgente: "factura",
    clienteId: "",
    provinciaId: "",
    mostrarObjetivo: false,
});

const esAnioValido = (anio: string): boolean => /^\d{4}$/.test(anio);

export const anioDesde = (anioHasta: string): string =>
    esAnioValido(anioHasta) ? String(Number(anioHasta) - NUMERO_ANIOS + 1) : "";

export const validarFiltro = (filtro: FiltroInformeComparativaVentas): string | null => {
    if (!esAnioValido(filtro.anioHasta)) return "Indica un año hasta de 4 cifras";

    if (!filtro.mostrarObjetivo && filtro.fechaDesde && filtro.fechaHasta) {
        // Solo cuentan día y mes: el mismo tramo se aplica a cada año
        if (filtro.fechaDesde.slice(5) > filtro.fechaHasta.slice(5)) {
            return "El día y mes de la fecha desde deben ser anteriores a los de la fecha hasta";
        }
    }

    return null;
};

const aFechaLocal = (fecha: Date): string => {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, "0");
    const d = String(fecha.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

export const rangoFechaDesdeAtajo = (atajo: string): { fechaDesde: string; fechaHasta: string } | null => {
    const calcularRango = rangoDesdeAtajo[atajo];
    if (!calcularRango) return null;

    const [desde, hasta] = calcularRango();
    return { fechaDesde: aFechaLocal(desde), fechaHasta: aFechaLocal(hasta) };
};

export const nombreFicheroInformeComparativaVentas = (anioHasta: string): string =>
    `comparativa_ventas_${anioDesde(anioHasta)}-${anioHasta}.pdf`;
