import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { tComun } from "../../i18n/index.ts";

type UiProps = FormModelo["uiProps"];

/** Campos de Eneboo `divisas.ui`. */
export const CamposDivisa = ({ uiProps }: { uiProps: UiProps }) => (
    <>
        <QInput label={tComun("divisas.descripcion")} {...uiProps("descripcion")} />
        <QInput label={tComun("divisas.simbolo")} {...uiProps("simbolo")} />
        <QInput label={tComun("divisas.codigoIso")} {...uiProps("codigoIso")} />
        <QInput label={tComun("divisas.cifrasDecimales")} {...uiProps("cifrasDecimales")} />
        <QInput label={tComun("divisas.tasaDeConversion")} {...uiProps("tasaConversion")} />
        <QDate label={tComun("divisas.fechaDeActualizacion")} {...uiProps("fecha")} />
        <QTextArea
            label={tComun("divisas.monedasYBilletesPEjM0")}
            {...uiProps("monedasBilletes")}
        />
    </>
);
