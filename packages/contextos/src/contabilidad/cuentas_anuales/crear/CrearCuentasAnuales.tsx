import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { CamposCuentasAnuales } from "../detalle/CamposCuentasAnuales.tsx";
import { postCuentasAnuales } from "../infraestructura.ts";
import { metaNuevaCuentasAnuales, nuevaCuentasAnualesInicial } from "./crear.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const CrearCuentasAnuales = ({
    publicar,
    ejercicioId,
}: {
    publicar: EmitirEvento;
    ejercicioId: string;
}) => {
    // Memoizado: useModelo reinicia el formulario cada vez que cambia la
    // identidad del inicial, así que pasarlo en línea entra en bucle.
    const t = useTContabilidad();
    const inicial = useMemo(
        () => nuevaCuentasAnualesInicial(ejercicioId),
        [ejercicioId]
    );

    const { modelo: informe, uiProps, valido } = useModelo(
        metaNuevaCuentasAnuales,
        inicial
    );

    const crear_ = useCallback(async () => {
        const id = await postCuentasAnuales(informe);
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
            nombre="crearCuentasAnuales"
            titulo={t("cuentas_anuales.nuevoInformeDeCuentasAnuales")}
            onCerrar={cancelar}
        >
            <div className="CrearCuentasAnuales">
                <quimera-formulario>
                    <CamposCuentasAnuales
                        uiProps={uiProps}
                        informe={informe}
                        refDescripcion={focus}
                    />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("cuentas_anuales.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
