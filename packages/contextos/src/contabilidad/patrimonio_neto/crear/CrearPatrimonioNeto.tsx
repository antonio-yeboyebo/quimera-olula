import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { postPatrimonioNeto } from "../infraestructura.ts";
import { metaNuevoPatrimonioNeto, nuevoPatrimonioNetoInicial } from "./crear.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const CrearPatrimonioNeto = ({
    publicar,
    ejercicioId,
}: {
    publicar: EmitirEvento;
    ejercicioId: string;
}) => {
    // Memoizado: useModelo reinicia el formulario si cambia la identidad.
    const t = useTContabilidad();
    const inicial = useMemo(
        () => nuevoPatrimonioNetoInicial(ejercicioId),
        [ejercicioId]
    );

    const { modelo: informe, uiProps, valido } = useModelo(
        metaNuevoPatrimonioNeto,
        inicial
    );

    const crear_ = useCallback(async () => {
        const id = await postPatrimonioNeto(informe);
        publicar("informe_creado", id);
    }, [informe, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_informe_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearPatrimonioNeto"
            titulo={t("patrimonio_neto.nuevoEstadoDeCambiosEnEl")}
            onCerrar={cancelar}
        >
            <div className="CrearPatrimonioNeto">
                <quimera-formulario>
                    <QInput label={t("patrimonio_neto.descripcion")} {...uiProps("descripcion")} ref={focus} />
                    <QInput label={t("patrimonio_neto.ejercicioActual")} {...uiProps("ejercicioId")} />
                    <QInput
                        label={t("patrimonio_neto.ejercicioX1")}
                        {...uiProps("ejercicioAnteriorId")}
                        opcional
                    />
                    <QInput
                        label={t("patrimonio_neto.ejercicioX2")}
                        {...uiProps("ejercicioAnteriorAnteriorId")}
                        opcional
                    />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("patrimonio_neto.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
