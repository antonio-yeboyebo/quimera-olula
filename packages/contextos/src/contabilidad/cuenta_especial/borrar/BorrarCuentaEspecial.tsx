import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { CuentaEspecial } from "../diseño.ts";
import { etiquetaCuentaEspecial } from "../dominio.ts";
import { deleteCuentaEspecial } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const BorrarCuentaEspecial = ({
    publicar,
    cuentaEspecial,
}: {
    cuentaEspecial: CuentaEspecial;
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const borrar_ = useCallback(async () => {
        await deleteCuentaEspecial(cuentaEspecial.id);
        publicar("cuenta_especial_borrada", cuentaEspecial);
    }, [publicar, cuentaEspecial]);

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarCuentaEspecial"
            abierto={true}
            titulo={t("cuenta_especial.borrarCuentaEspecial")}
            mensaje={t("cuenta_especial.confirmaBorrarCuentaespecialLasCuentasY", { cuentaEspecial: etiquetaCuentaEspecial(cuentaEspecial) })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
