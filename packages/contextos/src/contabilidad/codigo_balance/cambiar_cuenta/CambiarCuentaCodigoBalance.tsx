import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { CuentaCodigoBalance, NuevaCuentaCodigoBalance } from "../diseño.ts";
import { ETIQUETA_FORMATO, metaCuentaCodigoBalance, SIGNOS } from "../dominio.ts";
import { patchCuentaCodigoBalance } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const CambiarCuentaCodigoBalance = ({
    cuenta,
    publicar,
}: {
    cuenta: CuentaCodigoBalance;
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const inicial = useMemo<NuevaCuentaCodigoBalance>(() => ({
        codigoCuenta: cuenta.codigoCuenta,
        descripcionCuenta: cuenta.descripcionCuenta,
        signo: cuenta.signo,
    }), [cuenta]);

    const { modelo, uiProps, valido } = useModelo(metaCuentaCodigoBalance, inicial);

    const cambiar_ = useCallback(async () => {
        await patchCuentaCodigoBalance(cuenta.formato, cuenta.id, modelo);
        publicar("cuenta_cambiada", cuenta.id);
    }, [cuenta, modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("cambio_de_cuenta_cancelado"), [publicar]);

    const [cambiar, cancelar] = useForm(cambiar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="cambiarCuentaCodigoBalance"
            titulo={t("codigo_balance.valorCuentaCodigocuenta", { valor: ETIQUETA_FORMATO[cuenta.formato], codigoCuenta: cuenta.codigoCuenta })}
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <QInput label={t("codigo_balance.cuentaPrefijo")} {...uiProps("codigoCuenta")} />
                <QInput label={t("codigo_balance.descripcion")} {...uiProps("descripcionCuenta")} />
                <QSelect label={t("codigo_balance.signo")} opciones={SIGNOS} {...uiProps("signo")} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={cambiar} deshabilitado={!valido}>{t("codigo_balance.guardar")}</QBoton>
            </div>
        </QModal>
    );
};
