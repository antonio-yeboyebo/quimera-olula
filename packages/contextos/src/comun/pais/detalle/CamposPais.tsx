import { ZonaGeograficaSelect } from "#/comun/zona_geografica/componentes/ZonaGeograficaSelect.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { tComun } from "../../i18n/index.ts";

type UiProps = FormModelo["uiProps"];

/** Campos de Eneboo `paises.ui` (pestaña Principal y «Validar CIF/NIF»). */
export const CamposPais = ({ uiProps }: { uiProps: UiProps }) => (
    <>
        <QInput label={tComun("paises.nombre")} {...uiProps("nombre")} />
        <QInput label={tComun("paises.codigoISO")} {...uiProps("codiso")} />
        <QInput label={tComun("paises.codigoISOAlpha2")} {...uiProps("codigoIsoAlpha2")} />
        <QInput label={tComun("paises.codigoISOAlpha3")} {...uiProps("codigoIsoAlpha3")} />
        <ZonaGeograficaSelect label={tComun("paises.zonaGeografica")} {...uiProps("zonaId")} />
        <QCheckbox label={tComun("paises.exigirValidacionDeProvincias")} {...uiProps("validarProvincias")} />
        <QCheckbox label={tComun("paises.perteneceAZonaSepa")} {...uiProps("zonaSepa")} />
        <QCheckbox label={tComun("paises.perteneceAUE")} {...uiProps("enUe")} />
        <QCheckbox label={tComun("paises.exigirValidacionDelCifNif")} {...uiProps("exigirValidacion")} />
        <QTextArea label={tComun("paises.funcionDeValidacion")} {...uiProps("funcionValidacion")} />
    </>
);
