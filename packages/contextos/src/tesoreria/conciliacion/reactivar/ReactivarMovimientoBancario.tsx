import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { MovimientoBancario } from "../diseño.js";
import { useTTesoreria } from "../../i18n/index.ts";

export const ReactivarMovimientoBancario = ({
    movimiento,
    publicar,
}: {
    movimiento: MovimientoBancario;
    publicar: EmitirEvento;
}) => {
    const t = useTTesoreria();
    const reactivar_ = useCallback(async () => publicar("reactivacion_confirmada"), [publicar]);
    const cancelar_ = useCallback(() => publicar("reactivacion_cancelada"), [publicar]);

    const [reactivar, cancelar] = useForm(reactivar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="reactivarMovimientoBancario"
            abierto={true}
            titulo={t("conciliacion.reactivarMovimiento")}
            mensaje={t("conciliacion.elMovimientoConceptoVolveraAEstado", { concepto: movimiento.concepto })}
            onCerrar={cancelar}
            onAceptar={reactivar}
            labelAceptar={t("conciliacion.reactivar")}
        />
    );
};
