import { Zona } from "#/almacen/comun/componentes/Zona.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { generarSalidaVentaDesdePedidos } from "../../infraestructura.ts";
import { generarSalidaVacia, metaGenerarSalida } from "./generar_salida.ts";
import { useTAlmacen } from "../../../i18n/index.ts";

export const GenerarSalidaPedidoVenta = ({
    publicar,
    pedidoIds,
}: {
    publicar: EmitirEvento;
    pedidoIds: string[];
}) => {
    const t = useTAlmacen();
    const { modelo, uiProps, valido } = useModelo(metaGenerarSalida, generarSalidaVacia);

    const generar_ = useCallback(async () => {
        const ids = pedidoIds.map((id) => parseInt(id, 10));
        const zonaId = parseInt(modelo.zonaId as string, 10);
        const idOrden = await generarSalidaVentaDesdePedidos(ids, [zonaId]);
        publicar("salida_generada", idOrden);
    }, [modelo.zonaId, pedidoIds, publicar]);

    const cancelar_ = useCallback(() => publicar("salida_cancelada"), [publicar]);

    const [generar, cancelar] = useForm(generar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="generarSalidaPedidoVenta"
            titulo={t("pedido_venta.generarSalidaLengthPedidoValor", { length: pedidoIds.length, valor: pedidoIds.length !== 1 ? "s" : "" })}
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <Zona label={t("pedido_venta.zonaDePreparacion")} {...uiProps("zonaId")} />
            </quimera-formulario>

            <div className="botones maestro-botones">
                <QBoton onClick={generar} deshabilitado={!valido}>
                    {t("pedido_venta.generarSalida")}
                </QBoton>
            </div>
        </QModal>
    );
};
