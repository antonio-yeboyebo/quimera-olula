import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { metaNuevaAmortizacion, nuevaAmortizacionVacia, PERIODOS } from "../dominio.ts";
import { postAmortizacion } from "../infraestructura.ts";
import { useOpcionesGrupo } from "./OpcionesGrupo.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const CrearAmortizacion = ({ publicar }: { publicar: EmitirEvento }) => {
    const t = useTContabilidad();
    const inicial = useMemo(nuevaAmortizacionVacia, []);
    const { modelo, uiProps, valido } = useModelo(metaNuevaAmortizacion, inicial);
    const grupos = useOpcionesGrupo();

    const crear_ = useCallback(async () => {
        const id = await postAmortizacion(modelo);
        publicar("amortizacion_creada", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_de_amortizacion_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal abierto={true} nombre="crearAmortizacion" titulo={t("amortizacion.nuevaAmortizacion")}
            onCerrar={cancelar}>
            <div className="CrearAmortizacion">
                <quimera-formulario>
                    <QInput label={t("amortizacion.codigoVacioAutomatico")} {...uiProps("id")} />
                    <QInput label={t("amortizacion.elementoDeInmovilizado")} {...uiProps("elemento")} ref={focus} />
                    <QSelect label={t("amortizacion.grupoContable")} opciones={grupos} {...uiProps("grupoId")} />
                    <QDate label={t("amortizacion.fechaDeAdquisicion")} {...uiProps("fecha")} />
                    <QDate label={t("amortizacion.fechaDeInicio")} {...uiProps("fechaInicio")} />
                    <QInput label={t("amortizacion.valorDeAdquisicion")} {...uiProps("valorAdquisicion")} />
                    <QInput label={t("amortizacion.valorResidual")} {...uiProps("valorResidual")} />
                    <QSelect label={t("amortizacion.periodo")} opciones={PERIODOS} {...uiProps("periodo")} />
                    <QInput label={t("amortizacion.anual")} {...uiProps("porcentajeAnual")} />
                    <QCheckbox label={t("amortizacion.bloqueado")} {...uiProps("bloqueado")} />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>{t("amortizacion.crear")}</QBoton>
                </div>
            </div>
        </QModal>
    );
};
