import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Cuenta } from "../diseño.ts";
import { etiquetaCuenta } from "../dominio.ts";
import { deleteCuenta } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const BorrarCuenta = ({
    publicar,
    cuenta,
}: {
    cuenta: Cuenta;
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const borrar_ = useCallback(async () => {
        await deleteCuenta(cuenta.id);
        publicar("cuenta_borrada", cuenta);
    }, [publicar, cuenta]);

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarCuenta"
            abierto={true}
            titulo={t("cuenta.borrarCuenta")}
            mensaje={t("cuenta.confirmaBorrarCuentaSoloEsPosible", { cuenta: etiquetaCuenta(cuenta) })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
