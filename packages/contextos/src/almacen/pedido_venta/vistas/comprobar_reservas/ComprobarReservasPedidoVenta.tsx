import { Zona } from "#/almacen/comun/componentes/Zona.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { comprobarReservas } from "../../infraestructura.ts";
import { comprobarReservasVacio, metaComprobarReservas } from "./comprobar_reservas.ts";
import { useTAlmacen } from "../../../i18n/index.ts";

export const ComprobarReservasPedidoVenta = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const { modelo, uiProps, valido } = useModelo(metaComprobarReservas, comprobarReservasVacio);

    const comprobar_ = useCallback(async () => {
        const zonas = [parseInt(modelo.zonaId as string, 10)];
        const resultados = await comprobarReservas(zonas);
        publicar("reservas_comprobadas", { zonas, resultados });
    }, [modelo.zonaId, publicar]);

    const cancelar_ = useCallback(() => publicar("comprobar_reservas_cancelado"), [publicar]);

    const [comprobar, cancelar] = useForm(comprobar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="comprobarReservasPedidoVenta"
            titulo={t("pedido_venta.comprobarDisponibilidad")}
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <Zona label={t("pedido_venta.zonaDeAlmacen")} {...uiProps("zonaId")} />
            </quimera-formulario>

            <div className="botones maestro-botones">
                <QBoton onClick={comprobar} deshabilitado={!valido}>
                    {t("pedido_venta.comprobar")}
                </QBoton>
            </div>
        </QModal>
    );
};
