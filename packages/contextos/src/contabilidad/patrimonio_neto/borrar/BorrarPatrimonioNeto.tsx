import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { PatrimonioNeto } from "../diseño.ts";
import { etiquetaPatrimonioNeto } from "../dominio.ts";
import { deletePatrimonioNeto } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const BorrarPatrimonioNeto = ({
    publicar,
    informe,
}: {
    informe: PatrimonioNeto;
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const borrar_ = useCallback(async () => {
        await deletePatrimonioNeto(informe.id);
        publicar("informe_borrado", informe);
    }, [publicar, informe]);

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarPatrimonioNeto"
            abierto={true}
            titulo={t("patrimonio_neto.borrarInforme")}
            mensaje={t("patrimonio_neto.confirmaBorrarInformeSoloSeBorra", { informe: etiquetaPatrimonioNeto(informe) })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
