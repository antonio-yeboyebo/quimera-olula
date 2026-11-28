import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { Conciliacion } from "../diseño.js";
import { mensajeDesconciliarMovimientoBancario } from "../dominio.js";
import { useTTesoreria } from "../../i18n/index.ts";

export const DesconciliarMovimientoBancario = ({
    conciliacion,
    publicar,
}: {
    /** Conciliación aplicada al movimiento; null si aún no se ha cargado. */
    conciliacion: Conciliacion | null;
    publicar: EmitirEvento;
}) => {
    const t = useTTesoreria();
    const desconciliar_ = useCallback(async () => publicar("desconciliacion_confirmada"), [publicar]);
    const cancelar_ = useCallback(() => publicar("desconciliacion_cancelada"), [publicar]);

    const [desconciliar, cancelar] = useForm(desconciliar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="desconciliarMovimientoBancario"
            abierto={true}
            titulo={t("conciliacion.desconciliarMovimiento")}
            mensaje={mensajeDesconciliarMovimientoBancario(conciliacion)}
            onCerrar={cancelar}
            onAceptar={desconciliar}
            labelAceptar={t("conciliacion.desconciliar")}
        />
    );
};
