import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { CamposDivisa } from "../detalle/CamposDivisa.tsx";
import { metaNuevoDivisa, nuevoDivisaVacio } from "../dominio.ts";
import { postDivisa } from "../infraestructura.ts";
import { useTComun } from "../../i18n/index.ts";

export const CrearDivisa = ({ publicar }: { publicar: EmitirEvento }) => {
    const t = useTComun();
    const inicial = useMemo(nuevoDivisaVacio, []);

    const { modelo, uiProps, valido } = useModelo(metaNuevoDivisa, inicial);

    const crear_ = useCallback(async () => {
        const id = await postDivisa(modelo);
        publicar("divisa_creado", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_de_divisa_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal abierto={true} nombre="crearDivisa" titulo={t("divisas.nuevaDivisa")} onCerrar={cancelar}>
            <div className="CrearDivisa">
                <quimera-formulario>
                    <QInput label={t("divisas.codigo")} {...uiProps("id")} ref={focus} />
                    <CamposDivisa uiProps={uiProps} />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("divisas.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
