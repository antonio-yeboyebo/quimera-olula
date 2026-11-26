import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { CodigoBalance, FormatoBalance } from "../diseño.ts";
import {
    cuentaCodigoBalanceVacia,
    ETIQUETA_FORMATO,
    metaCuentaCodigoBalance,
    SIGNOS,
} from "../dominio.ts";
import { postCuentaCodigoBalance } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const CrearCuentaCodigoBalance = ({
    formato,
    codigoBalance,
    publicar,
}: {
    formato: FormatoBalance;
    codigoBalance: CodigoBalance;
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const inicial = useMemo(cuentaCodigoBalanceVacia, []);

    const { modelo, uiProps, valido } = useModelo(metaCuentaCodigoBalance, inicial);

    const crear_ = useCallback(async () => {
        const id = await postCuentaCodigoBalance(formato, codigoBalance.id, modelo);
        publicar("cuenta_creada", id);
    }, [formato, codigoBalance.id, modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_de_cuenta_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearCuentaCodigoBalance"
            titulo={t("codigo_balance.valorNuevaCuentaEnId", { valor: ETIQUETA_FORMATO[formato], id: codigoBalance.id })}
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <QInput label={t("codigo_balance.cuentaPrefijo")} {...uiProps("codigoCuenta")} ref={focus} />
                <QInput label={t("codigo_balance.descripcion")} {...uiProps("descripcionCuenta")} />
                <QSelect label={t("codigo_balance.signo")} opciones={SIGNOS} {...uiProps("signo")} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={crear} deshabilitado={!valido}>{t("codigo_balance.crear")}</QBoton>
            </div>
        </QModal>
    );
};
