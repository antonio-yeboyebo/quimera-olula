import { tCompras } from "#/compras/i18n/index.ts";
import { RestAPI } from "@olula/lib/api/rest_api.js";
import ApiUrls from "#/compras/comun/urls.ts";
import { calcularRecibiendo } from "./dominio.ts";
import { AlbaranCreado, AlbaranarPedido } from "./diseño.ts";

const baseUrl = new ApiUrls().PEDIDO;

export const patchAlbaranarPedido = async (
    modelo: AlbaranarPedido
): Promise<AlbaranCreado> => {
    const lineasFiltradas = modelo.lineas.filter((l) => calcularRecibiendo(l) > 0);

    const payload = {
        lineas: lineasFiltradas.map((l) => ({
            id: l.idLinea,
            cantidad: calcularRecibiendo(l),
            lotes: l.lotes.map((lt) => ({
                lote_id: lt.idLote,
                cantidad: lt.cantidad,
            })),
        })),
    };

    const respuesta = (await RestAPI.patch(
        `${baseUrl}/${modelo.id}/albaranar`,
        payload,
        tCompras("albaranarPedido.errores.albaranar")
    )) as unknown as
        | { datos: { albaran_id: string; codigo?: string } }
        | { albaran_id: string; codigo?: string };

    const datos = "datos" in respuesta ? respuesta.datos : respuesta;
    const albaranId = String(datos.albaran_id ?? "");
    return { id: albaranId, codigo: String(datos.codigo ?? albaranId) };
};
