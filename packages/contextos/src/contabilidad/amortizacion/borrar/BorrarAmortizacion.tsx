import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Amortizacion } from "../diseño.ts";
import { etiquetaAmortizacion } from "../dominio.ts";
import { deleteAmortizacion } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const BorrarAmortizacion = ({
    publicar,
    amortizacion,
}: {
    amortizacion: Amortizacion;
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const borrar_ = useCallback(async () => {
        await deleteAmortizacion(amortizacion.id);
        publicar("amortizacion_borrada", amortizacion);
    }, [publicar, amortizacion]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarAmortizacion"
            abierto={true}
            titulo={t("amortizacion.borrarAmortizacion")}
            mensaje={t("amortizacion.confirmaBorrarAmortizacionNoSePuede", { amortizacion: etiquetaAmortizacion(amortizacion) })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
