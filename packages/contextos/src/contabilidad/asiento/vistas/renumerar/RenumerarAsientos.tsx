import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { mensajeConfirmacionRenumerarAsientos } from "../../dominio.ts";
import { patchRenumerarAsientos } from "../../infraestructura.ts";
import { useTContabilidad } from "../../../i18n/index.ts";

export const RenumerarAsientos = ({
    ejercicioId,
    publicar,
}: {
    ejercicioId: string;
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const renumerar_ = useCallback(async () => {
        const resultado = await patchRenumerarAsientos({ ejercicioId });
        publicar("asientos_renumerados", resultado);
    }, [ejercicioId, publicar]);

    const cancelar_ = useCallback(() => publicar("renumeracion_cancelada"), [publicar]);

    const [renumerar, cancelar] = useForm(renumerar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="renumerarAsientos"
            abierto={true}
            titulo={t("asiento.renumerarAsientos")}
            mensaje={mensajeConfirmacionRenumerarAsientos(ejercicioId)}
            labelAceptar={t("asiento.renumerar")}
            onCerrar={cancelar}
            onAceptar={renumerar}
        />
    );
};
