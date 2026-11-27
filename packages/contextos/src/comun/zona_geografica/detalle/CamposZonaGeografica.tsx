import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { tComun } from "../../i18n/index.ts";

type UiProps = FormModelo["uiProps"];

/** Campos de Eneboo `zonasgeo.ui`. */
export const CamposZonaGeografica = ({ uiProps }: { uiProps: UiProps }) => (
    <QInput label={tComun("zonaGeografica.descripcion")} {...uiProps("descripcion")} />
);
