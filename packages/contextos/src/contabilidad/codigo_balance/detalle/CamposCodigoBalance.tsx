import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { NATURALEZAS } from "../dominio.ts";
import { tContabilidad } from "../../i18n/index.ts";

type UiProps = FormModelo["uiProps"];

/** Campos del formulario de Eneboo `co_codbalances08.ui` (pestaña «Cuentas
 * normales»: naturaleza y los cuatro niveles con su descripción). */
export const CamposCodigoBalance = ({ uiProps }: { uiProps: UiProps }) => (
    <>
        <QSelect label={tContabilidad("codigo_balance.naturaleza")} opciones={NATURALEZAS} {...uiProps("naturaleza")} />
        <QInput label={tContabilidad("codigo_balance.codigoNivel1")} {...uiProps("nivel1")} />
        <QInput label={tContabilidad("codigo_balance.descripcionNivel1")} {...uiProps("descripcion1")} />
        <QInput label={tContabilidad("codigo_balance.codigoNivel2")} {...uiProps("nivel2")} />
        <QInput label={tContabilidad("codigo_balance.descripcionNivel2")} {...uiProps("descripcion2")} />
        <QInput label={tContabilidad("codigo_balance.codigoNivel3")} {...uiProps("nivel3")} />
        <QInput label={tContabilidad("codigo_balance.descripcionNivel3")} {...uiProps("descripcion3")} />
        <QInput label={tContabilidad("codigo_balance.codigoNivel4")} {...uiProps("nivel4")} />
        <QInput label={tContabilidad("codigo_balance.descripcionNivel4")} {...uiProps("descripcion4")} />
    </>
);
