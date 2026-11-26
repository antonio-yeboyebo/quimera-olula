import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { useOpcionesGrupo } from "../crear/OpcionesGrupo.ts";
import { Amortizacion } from "../diseño.ts";
import {
    PERIODOS,
    planBloqueado,
    textoEstadoAmortizacion,
    textoMetodoAmortizacion,
} from "../dominio.ts";
import { useTContabilidad } from "../../i18n/index.ts";

const importe = (valor: number): string =>
    valor.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Pestaña «Datos generales» de `co_amortizaciones.ui`. Con dotaciones el
 * valor y el plan quedan de solo lectura, como en Eneboo. */
export const TabGeneral = ({
    form,
    amortizacion,
}: {
    form: FormModelo;
    amortizacion: Amortizacion;
}) => {
    const t = useTContabilidad();
    const grupos = useOpcionesGrupo();
    const bloqueado = planBloqueado(amortizacion);
    const { uiProps } = form;
    const plan = (campo: string) => ({ ...uiProps(campo), deshabilitado: bloqueado });

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label={t("amortizacion.codigo")} nombre="id" valor={amortizacion.id} soloLectura />
                <QInput label={t("amortizacion.estado")} nombre="estado" valor={textoEstadoAmortizacion(amortizacion.estado)} soloLectura />
                <QInput label={t("amortizacion.elementoDeInmovilizado")} {...uiProps("elemento")} />
                <QSelect label={t("amortizacion.grupoContable")} opciones={grupos} {...uiProps("grupoId")} />
                <QDate label={t("amortizacion.fechaDeAdquisicion")} {...uiProps("fecha")} />
                <QDate label={t("amortizacion.fechaDeInicio")} {...plan("fechaInicio")} />
                <QInput label={t("amortizacion.valorDeAdquisicion")} {...plan("valorAdquisicion")} />
                <QInput label={t("amortizacion.valorResidual")} {...plan("valorResidual")} />
                <QInput label={t("amortizacion.valorAmortizable")} nombre="valor_amortizable"
                    valor={importe(amortizacion.valorAmortizable)} soloLectura />
                <QInput label={t("amortizacion.metodo")} nombre="metodo" valor={textoMetodoAmortizacion(amortizacion.metodo)} soloLectura />
                <QSelect label={t("amortizacion.periodo")} opciones={PERIODOS} {...plan("periodo")} />
                <QInput label={t("amortizacion.anual")} {...plan("porcentajeAnual")} />
                <QInput label={t("amortizacion.periodo2")} {...plan("porcentajePeriodo")} />
                <QInput label={t("amortizacion.amortizacionDelPeriodo")} {...plan("amortizacionPeriodo")} />
                <QInput label={t("amortizacion.nDePeriodos")} {...plan("numPeriodos")} />
                <QInput label={t("amortizacion.amortizacionPrimerPeriodo")} nombre="primer_periodo"
                    valor={importe(amortizacion.amortizacionPrimerPeriodo)} soloLectura />
                <QInput label={t("amortizacion.amortizacionUltimoPeriodo")} nombre="ultimo_periodo"
                    valor={importe(amortizacion.amortizacionUltimoPeriodo)} soloLectura />
                <QInput label={t("amortizacion.totalAmortizado")} nombre="total_amortizado"
                    valor={importe(amortizacion.totalAmortizado)} soloLectura />
                <QInput label={t("amortizacion.pendiente")} nombre="pendiente"
                    valor={importe(amortizacion.pendiente)} soloLectura />
                <QCheckbox label={t("amortizacion.bloqueado")} {...uiProps("bloqueado")} />
                <QTextArea label={t("amortizacion.notas")} {...uiProps("notas")} />
            </quimera-formulario>
        </div>
    );
};
