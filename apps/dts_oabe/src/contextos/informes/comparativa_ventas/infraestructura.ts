import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { FiltroInformeComparativaVentas, GetInformeComparativaVentas } from "./diseño.ts";

const baseUrl = "/ventas/comparativa_ventas/informe";

export const getInformeComparativaVentas: GetInformeComparativaVentas = async (
    filtro: FiltroInformeComparativaVentas
) => {
    const params = new URLSearchParams();
    params.set("anio_hasta", filtro.anioHasta);
    params.set("tipo_agente", filtro.tipoAgente);
    params.set("mostrar_objetivo", String(filtro.mostrarObjetivo));
    if (filtro.fechaDesde) params.set("fecha_desde", filtro.fechaDesde);
    if (filtro.fechaHasta) params.set("fecha_hasta", filtro.fechaHasta);
    if (filtro.agenteId) params.set("agente_id", filtro.agenteId);
    if (filtro.clienteId) params.set("cliente_id", filtro.clienteId);
    if (filtro.provinciaId) params.set("provincia_id", filtro.provinciaId);

    return RestAPI.blob(`${baseUrl}?${params.toString()}`, "Error al generar el informe de comparativa de ventas");
};
