import { PedidoCompra } from "#/almacen/comun/componentes/PedidoCompra.tsx";
import { Ubicacion } from "#/almacen/comun/componentes/Ubicacion.tsx";
import { postEntradaDesdePedido } from "../../infraestructura.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import {
    entradaDesdePedidoVacia,
    metaEntradaDesdePedido,
} from "./crear_entrada_desde_pedido.ts";
import { useTAlmacen } from "../../../i18n/index.ts";

export const CrearEntradaDesdePedido = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const { modelo, uiProps, valido } = useModelo(
        metaEntradaDesdePedido,
        entradaDesdePedidoVacia
    );

    const crear_ = useCallback(
        async () => {
            const id = await postEntradaDesdePedido(modelo);
            publicar("entrada_desde_pedido_creada", id);
        },
        [modelo, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("entrada_desde_pedido_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="crearEntradaDesdePedido"
            titulo={t("orden.crearEntradaDesdePedidoDeCompra")}
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <PedidoCompra label={t("orden.pedidoDeCompra")} {...uiProps("pedidoCompraId")} />
                <Ubicacion label={t("orden.ubicacionDeEntrada")} {...uiProps("ubicacionId")} />
            </quimera-formulario>

            <div className="botones maestro-botones">
                <QBoton onClick={crear} deshabilitado={!valido}>
                    {t("orden.crear")}
                </QBoton>
            </div>
        </QModal>
    );
};
