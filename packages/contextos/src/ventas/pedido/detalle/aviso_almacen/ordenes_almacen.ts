import { plugin } from "@olula/lib/dominio.js";
import { useEffect, useState } from "react";
import { getOrdenesAlmacenDePedido, OrdenAlmacenDePedido } from "../../infraestructura.ts";
import { tVentas } from "../../../i18n/index.ts";

export const textoCambiosEnPreparacion = (): string => tVentas("pedido.almacen.cambiosEnPreparacion");

/**
 * Hook: órdenes de almacén activas del pedido (solo con el plugin SGA activo).
 * `recarga` vuelve a consultar cuando cambia (p. ej. el pedido tras editar líneas).
 */
export const useOrdenesAlmacenDePedido = (pedidoId: string, recarga?: unknown): OrdenAlmacenDePedido[] => {
    const [ordenes, setOrdenes] = useState<OrdenAlmacenDePedido[]>([]);
    const sgaActivo = plugin("sga") === "activo";

    useEffect(() => {
        if (!sgaActivo || !pedidoId) return;
        let vigente = true;
        getOrdenesAlmacenDePedido(pedidoId)
            .then((o) => vigente && setOrdenes(o))
            .catch(() => vigente && setOrdenes([]));
        return () => { vigente = false; };
    }, [sgaActivo, pedidoId, recarga]);

    return ordenes;
};
