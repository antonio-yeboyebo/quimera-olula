import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { CuentaBancaria } from "../diseño.js";
import { deleteCuentaBancaria } from "../infraestructura.js";
import { useTTesoreria } from "../../i18n/index.ts";

export const BorrarCuentaBancaria = ({
    publicar,
    cuenta,
}: {
    cuenta: CuentaBancaria;
    publicar: EmitirEvento;
}) => {
    const t = useTTesoreria();
    const borrar_ = useCallback(
        async () => {
            await deleteCuentaBancaria(cuenta.id);
            publicar("cuenta_borrada", cuenta);
        },
        [publicar, cuenta],
    );

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar],
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarCuentaBancaria"
            abierto={true}
            titulo={t("cuentas_bancarias.borrarCuentaBancaria")}
            mensaje={t("cuentas_bancarias.estaSeguroDeQueDeseaBorrar", { valor: cuenta.descripcion || cuenta.iban || cuenta.codigoCuenta })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
