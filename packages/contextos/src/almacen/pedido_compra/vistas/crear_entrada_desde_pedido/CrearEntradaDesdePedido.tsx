import { Ubicacion } from "#/almacen/comun/componentes/Ubicacion.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { postEntradaDesdePedido } from "../../infraestructura.ts";
import {
    formEntradaVacia,
    metaFormEntrada,
} from "./crear_entrada_desde_pedido.ts";
import { useTAlmacen } from "../../../i18n/index.ts";

export const CrearEntradaDesdePedido = ({
    publicar,
    pedidoCompraId,
}: {
    publicar: EmitirEvento;
    pedidoCompraId: string;
}) => {
    const t = useTAlmacen();
    const { modelo, uiProps, valido } = useModelo(
        metaFormEntrada,
        formEntradaVacia
    );

    const crear_ = useCallback(
        async () => {
            const id = await postEntradaDesdePedido({
                pedidoCompraId,
                ubicacionId: modelo.ubicacionId,
            });
            publicar("entrada_creada", id);
        },
        [modelo.ubicacionId, pedidoCompraId, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("crear_entrada_cancelado"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="crearEntradaDesdePedido"
            titulo={t("pedido_compra.crearEntradaDesdePedidoDeCompra")}
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <Ubicacion label={t("pedido_compra.ubicacionDeEntrada")} {...uiProps("ubicacionId")} />
            </quimera-formulario>

            <div className="botones maestro-botones">
                <QBoton onClick={crear} deshabilitado={!valido}>
                    {t("pedido_compra.crearEntrada")}
                </QBoton>
            </div>
        </QModal>
    );
};
