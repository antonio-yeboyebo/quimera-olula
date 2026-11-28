import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { OrdenAlmacen } from "../../diseño.ts";
import { terminarOrden } from "../../infraestructura.ts";
import { useTAlmacen } from "../../../i18n/index.ts";

export const TerminarOrden = ({
    publicar,
    orden,
}: {
    publicar: EmitirEvento;
    orden: OrdenAlmacen;
}) => {
    const t = useTAlmacen();
    const terminar_ = useCallback(
        async () => {
            await terminarOrden(orden.id);
            publicar("orden_terminada", orden);
        },
        [publicar, orden]
    );

    const cancelar_ = useCallback(
        () => publicar("terminado_cancelado"),
        [publicar]
    );

    const [terminar, cancelar] = useForm(terminar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="confirmarTerminarOrden"
            abierto={true}
            titulo={t("orden.confirmarTerminarOrden")}
            mensaje={t("orden.estaSeguroDeQueDeseaTerminar", { descripcion: orden.descripcion })}
            onCerrar={cancelar}
            onAceptar={terminar}
        />
    );
};
