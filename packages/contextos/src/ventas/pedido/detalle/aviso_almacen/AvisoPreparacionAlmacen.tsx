import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { Pedido } from "../../diseño.ts";
import { textoCambiosEnPreparacion, useOrdenesAlmacenDePedido } from "./ordenes_almacen.ts";
import { useTVentas } from "../../../i18n/index.ts";

const ESTADOS = ["PENDIENTE", "EN_CURSO", "PREPARADA"] as const;
type EstadoOrden = (typeof ESTADOS)[number];
const esEstadoConocido = (estado: string): estado is EstadoOrden =>
    (ESTADOS as readonly string[]).includes(estado);

/** Aviso de que el pedido ya se está preparando en almacén. */
export const AvisoPreparacionAlmacen = ({ pedido }: { pedido: Pedido }) => {
    const t = useTVentas();
    const ordenes = useOrdenesAlmacenDePedido(pedido.id, pedido);
    if (ordenes.length === 0) return null;

    const estado = (e: string) => (esEstadoConocido(e) ? t(`pedido.almacen.estados.${e}`) : e);
    const lista = ordenes.map((o) => `${o.id} (${estado(o.estado)})`).join(", ");
    return (
        <QAviso variante="advertencia">
            {t("pedido.almacen.aviso", { lista, cambios: textoCambiosEnPreparacion() })}
        </QAviso>
    );
};
