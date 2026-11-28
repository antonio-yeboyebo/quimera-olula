import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { FormaPago } from "../diseño.ts";
import { etiquetaFormaPago } from "../dominio.ts";
import { deleteFormaPago } from "../infraestructura.ts";
import { useTTesoreria } from "../../i18n/index.ts";

export const BorrarFormaPago = ({
    publicar,
    formaPago,
}: {
    formaPago: FormaPago;
    publicar: EmitirEvento;
}) => {
    const t = useTTesoreria();
    const borrar_ = useCallback(async () => {
        await deleteFormaPago(formaPago.id);
        publicar("forma_pago_borrada", formaPago);
    }, [publicar, formaPago]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarFormaPago"
            abierto={true}
            titulo={t("forma_pago.borrarFormaDePago")}
            mensaje={t("forma_pago.confirmaBorrarFormapagoYSusPlazos", { formaPago: etiquetaFormaPago(formaPago) })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
