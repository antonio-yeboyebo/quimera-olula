import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { CamposCodigoBalance } from "../detalle/CamposCodigoBalance.tsx";
import { postCodigoBalance } from "../infraestructura.ts";
import { metaNuevoCodigoBalance, nuevoCodigoBalanceInicial } from "./crear.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const CrearCodigoBalance = ({ publicar }: { publicar: EmitirEvento }) => {
    const t = useTContabilidad();
    const inicial = useMemo(nuevoCodigoBalanceInicial, []);

    const { modelo, uiProps, valido } = useModelo(metaNuevoCodigoBalance, inicial);

    const crear_ = useCallback(async () => {
        const id = await postCodigoBalance(modelo);
        publicar("codigo_balance_creado", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_codigo_balance_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearCodigoBalance"
            titulo={t("codigo_balance.nuevoCodigoDeBalance2008")}
            onCerrar={cancelar}
        >
            <div className="CrearCodigoBalance">
                <quimera-formulario>
                    <QInput label={t("codigo_balance.codigo")} {...uiProps("id")} ref={focus} />
                    <CamposCodigoBalance uiProps={uiProps} />
                    <QInput label={t("codigo_balance.descripcionBalanceAbreviado")} {...uiProps("descripcion4ba")} />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("codigo_balance.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
