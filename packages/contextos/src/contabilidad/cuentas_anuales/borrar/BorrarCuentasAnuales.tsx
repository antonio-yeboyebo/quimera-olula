import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { CuentasAnuales } from "../diseño.ts";
import { etiquetaCuentasAnuales } from "../dominio.ts";
import { deleteCuentasAnuales } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const BorrarCuentasAnuales = ({
    publicar,
    informe,
}: {
    informe: CuentasAnuales;
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const borrar_ = useCallback(async () => {
        await deleteCuentasAnuales(informe.id);
        publicar("informe_borrado", informe);
    }, [publicar, informe]);

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarCuentasAnuales"
            abierto={true}
            titulo={t("cuentas_anuales.borrarInforme")}
            mensaje={t("cuentas_anuales.confirmaBorrarInformeSoloSeBorra", { informe: etiquetaCuentasAnuales(informe) })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
