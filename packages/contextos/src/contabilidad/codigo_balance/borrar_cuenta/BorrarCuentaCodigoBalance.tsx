import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { CuentaCodigoBalance } from "../diseño.ts";
import { etiquetaCuentaCodigoBalance } from "../dominio.ts";
import { deleteCuentaCodigoBalance } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const BorrarCuentaCodigoBalance = ({
    cuenta,
    publicar,
}: {
    cuenta: CuentaCodigoBalance;
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const borrar_ = useCallback(async () => {
        await deleteCuentaCodigoBalance(cuenta.formato, cuenta.id);
        publicar("cuenta_borrada", cuenta.id);
    }, [cuenta, publicar]);

    const cancelar_ = useCallback(() => publicar("borrado_de_cuenta_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarCuentaCodigoBalance"
            abierto={true}
            titulo={t("codigo_balance.quitarCuentaDelCodigoDeBalance")}
            mensaje={t("codigo_balance.confirmaQuitarLaCuentaCuentaDel", { cuenta: etiquetaCuentaCodigoBalance(cuenta), codigoBalanceId: cuenta.codigoBalanceId })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
