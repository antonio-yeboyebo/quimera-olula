import { FechaInforme } from "#/contabilidad/comun/componentes/FechaInforme.tsx";
import { FilaFormulario } from "#/contabilidad/comun/componentes/FilaFormulario.tsx";
import {
    FormatoCuentasAnuales,
    NivelDesgloseCuentasAnuales,
    TipoCuentasAnuales,
} from "#/contabilidad/comun/componentes/OpcionesCuentasAnuales.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { CuentasAnuales } from "../diseño.ts";
import { admiteDesglose, admiteOmitirEpigrafes } from "../dominio.ts";
import { tContabilidad } from "../../i18n/index.ts";

/** Criterios de las cuentas anuales, iguales en el alta y en la ficha (la
 * casilla de omitir epígrafes sin saldo solo está en la ficha). */
export const CamposCuentasAnuales = ({
    uiProps,
    informe,
    conOmitirEpigrafes = false,
    refDescripcion,
}: {
    uiProps: FormModelo["uiProps"];
    informe: Pick<CuentasAnuales, "tipo" | "formato">;
    conOmitirEpigrafes?: boolean;
    refDescripcion?: ReturnType<typeof useFocus>;
}) => (
    <>
        <QInput label={tContabilidad("cuentas_anuales.descripcion")} {...uiProps("descripcion")} ref={refDescripcion} />
        <FilaFormulario>
            <TipoCuentasAnuales {...uiProps("tipo")} />
            <FormatoCuentasAnuales {...uiProps("formato")} />
            <NivelDesgloseCuentasAnuales
                {...uiProps("nivelDesglose")}
                soloLectura={!admiteDesglose(informe.formato)}
            />
        </FilaFormulario>
        {conOmitirEpigrafes && (
            <QCheckbox
                label={tContabilidad("cuentas_anuales.omitirEpigrafesSinSaldo")}
                {...uiProps("omitirEpigrafesSinSaldo")}
                soloLectura={!admiteOmitirEpigrafes(informe.tipo)}
            />
        )}
        <FilaFormulario>
            <QInput label={tContabilidad("cuentas_anuales.ejercicio")} {...uiProps("ejercicioId")} />
            <FechaInforme label={tContabilidad("cuentas_anuales.fechaDesde")} {...uiProps("fechaDesde")} />
            <FechaInforme label={tContabilidad("cuentas_anuales.fechaHasta")} {...uiProps("fechaHasta")} />
        </FilaFormulario>
        <FilaFormulario>
            <QInput label={tContabilidad("cuentas_anuales.ejercicioAnterior")} {...uiProps("ejercicioAnteriorId")} opcional />
            <FechaInforme label={tContabilidad("cuentas_anuales.fechaDesdeAnterior")} {...uiProps("fechaDesdeAnterior")} />
            <FechaInforme label={tContabilidad("cuentas_anuales.fechaHastaAnterior")} {...uiProps("fechaHastaAnterior")} />
        </FilaFormulario>
    </>
);
