import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { Asiento } from "../../diseño.ts";
import { etiquetaAsiento } from "../../dominio.ts";
import { deleteAsientoManual } from "../../infraestructura.ts";
import { useTContabilidad } from "../../../i18n/index.ts";

export const BorrarAsientoManual = ({
    publicar,
    asiento,
}: {
    asiento: Asiento;
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const borrar_ = useCallback(async () => {
        await deleteAsientoManual(asiento.id);
        publicar("asiento_borrado", asiento.id);
    }, [asiento.id, publicar]);

    const cancelar_ = useCallback(() => publicar("borrado_de_asiento_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarAsientoManual"
            abierto={true}
            titulo={t("asiento.borrarAsientoManual")}
            mensaje={t("asiento.confirmaBorrarAsiento", { asiento: etiquetaAsiento(asiento) })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
