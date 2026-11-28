import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { UiProps } from "@olula/lib/useModelo.ts";
import { CamposPartidaPlantilla } from "../diseño.ts";
import {
    OPCIONES_DEBE_HABER,
    OPCIONES_TIPO_BASE_IMPONIBLE,
    OPCIONES_TIPO_CONCEPTO,
    OPCIONES_TIPO_DOCUMENTO,
    OPCIONES_TIPO_DOCUMENTO_ORIGEN,
    OPCIONES_TIPO_FACTURA,
    OPCIONES_TIPO_IMPORTE,
    OPCIONES_TIPO_SUBCUENTA,
} from "../dominio.ts";
import "./FormPartidaPlantilla.css";
import { tContabilidad } from "../../i18n/index.ts";


/**
 * Formulario de una partida predefinida (Eneboo `co_planpartidas.ui`).
 * Como el formulario de Eneboo, cada campo solo se ofrece cuando su tipo lo
 * usa: el código con Establecer/Pedir, la variable con Definida, la fórmula
 * con Calcular...
 */
export const FormPartidaPlantilla = ({
    modelo,
    uiProps,
}: {
    modelo: CamposPartidaPlantilla;
    uiProps: (campo: string) => UiProps;
}) => (
    <div className="FormPartidaPlantilla">
        <quimera-formulario>
            <QInput label={tContabilidad("plantilla_asiento.nDeOrden")} {...uiProps("numeroOrden")} />
            <QSelect label={tContabilidad("plantilla_asiento.debeHaber")} {...uiProps("debeHaber")} opciones={OPCIONES_DEBE_HABER} />
            <QCheckbox label={tContabilidad("plantilla_asiento.saltarSiEsCero")} {...uiProps("saltarSiCero")} />
        </quimera-formulario>

        <h4>{tContabilidad("plantilla_asiento.subcuenta")}</h4>
        <quimera-formulario>
            <QSelect label={tContabilidad("plantilla_asiento.subcuenta")} {...uiProps("tipoSubcuenta")} opciones={OPCIONES_TIPO_SUBCUENTA} />
            {modelo.tipoSubcuenta !== "Definida" && (
                <QInput label={tContabilidad("plantilla_asiento.codigo")} {...uiProps("codigoSubcuenta")} />
            )}
            <QInput label={tContabilidad("plantilla_asiento.variable")} {...uiProps("variableSubcuenta")} />
        </quimera-formulario>

        <h4>{tContabilidad("plantilla_asiento.importe")}</h4>
        <quimera-formulario>
            <QSelect label={tContabilidad("plantilla_asiento.importe")} {...uiProps("tipoImporte")} opciones={OPCIONES_TIPO_IMPORTE} />
            {modelo.tipoImporte === "Calcular" && (
                <QInput label={tContabilidad("plantilla_asiento.formulaPEjBase21100")} {...uiProps("importe")} />
            )}
            {modelo.tipoImporte !== "Cuadrar" && (
                <QInput label={tContabilidad("plantilla_asiento.variable")} {...uiProps("variableImporte")} />
            )}
        </quimera-formulario>

        <h4>{tContabilidad("plantilla_asiento.concepto")}</h4>
        <quimera-formulario>
            <QSelect label={tContabilidad("plantilla_asiento.concepto")} {...uiProps("tipoConcepto")} opciones={OPCIONES_TIPO_CONCEPTO} />
            {(modelo.tipoConcepto === "Establecer" || modelo.tipoConcepto === "Pedir") && (
                <QInput label={tContabilidad("plantilla_asiento.texto")} {...uiProps("concepto")} />
            )}
            {modelo.tipoConcepto !== "Último" && (
                <QInput label={tContabilidad("plantilla_asiento.variable")} {...uiProps("variableConcepto")} />
            )}
        </quimera-formulario>

        <h4>{tContabilidad("plantilla_asiento.documento")}</h4>
        <quimera-formulario>
            <QSelect label={tContabilidad("plantilla_asiento.documento")} {...uiProps("tipoDocumento")} opciones={OPCIONES_TIPO_DOCUMENTO} />
            {modelo.tipoDocumento !== "Último" && (
                <>
                    <QInput label={tContabilidad("plantilla_asiento.documentoNfacNFactura")} {...uiProps("documento")} />
                    <QSelect
                        label={tContabilidad("plantilla_asiento.tipoDeDocumento")}
                        {...uiProps("tipoDocumentoOrigen")}
                        opciones={OPCIONES_TIPO_DOCUMENTO_ORIGEN}
                    />
                </>
            )}
        </quimera-formulario>

        <h4>{tContabilidad("plantilla_asiento.ivaSoloSiLaSubcuentaEs")}</h4>
        <quimera-formulario>
            <QSelect label={tContabilidad("plantilla_asiento.baseImponible")} {...uiProps("tipoBaseImponible")} opciones={OPCIONES_TIPO_BASE_IMPONIBLE} />
            {modelo.tipoBaseImponible === "Calcular" && (
                <QInput label={tContabilidad("plantilla_asiento.formulaDeLaBase")} {...uiProps("baseImponible")} />
            )}
            <QInput label={tContabilidad("plantilla_asiento.variable")} {...uiProps("variableBaseImponible")} />
            <QSelect label={tContabilidad("plantilla_asiento.nDeFactura")} {...uiProps("tipoFactura")} opciones={OPCIONES_TIPO_FACTURA} />
            <QInput label={tContabilidad("plantilla_asiento.serie")} {...uiProps("serieId")} />
        </quimera-formulario>

        <h4>{tContabilidad("plantilla_asiento.contrapartida")}</h4>
        <quimera-formulario>
            <QSelect label={tContabilidad("plantilla_asiento.contrapartida")} {...uiProps("tipoContrapartida")} opciones={OPCIONES_TIPO_SUBCUENTA} />
            {modelo.tipoContrapartida !== "Definida" && (
                <QInput label={tContabilidad("plantilla_asiento.codigo")} {...uiProps("codigoContrapartida")} />
            )}
            <QInput label={tContabilidad("plantilla_asiento.variable")} {...uiProps("variableContrapartida")} />
        </quimera-formulario>
    </div>
);
