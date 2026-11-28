import { SentidoOrdenInforme } from "#/contabilidad/comun/componentes/OpcionesLibroDiario.tsx";
import { CriterioOrdenMayor } from "#/contabilidad/comun/componentes/OpcionesLibroMayor.tsx";
import { FechaInforme } from "#/contabilidad/comun/componentes/FechaInforme.tsx";
import { FilaFormulario } from "#/contabilidad/comun/componentes/FilaFormulario.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { LibroMayor } from "../diseño.ts";
import { tContabilidad } from "../../i18n/index.ts";

/** Criterios del libro mayor, iguales en el alta y en la ficha. */
export const CamposLibroMayor = ({
    uiProps,
    informe,
    refDescripcion,
}: {
    uiProps: FormModelo["uiProps"];
    informe: Pick<LibroMayor, "todasSubcuentas">;
    refDescripcion?: ReturnType<typeof useFocus>;
}) => (
    <>
        <QInput label={tContabilidad("libro_mayor.descripcion")} {...uiProps("descripcion")} ref={refDescripcion} />
        <FilaFormulario>
            <QInput label={tContabilidad("libro_mayor.ejercicio")} {...uiProps("ejercicioId")} />
            <FechaInforme label={tContabilidad("libro_mayor.desdeFecha")} {...uiProps("fechaDesde")} />
            <FechaInforme label={tContabilidad("libro_mayor.hastaFecha")} {...uiProps("fechaHasta")} />
        </FilaFormulario>
        <FilaFormulario>
            <QCheckbox label={tContabilidad("libro_mayor.todasLasSubcuentas")} {...uiProps("todasSubcuentas")} />
            <QInput
                label={tContabilidad("libro_mayor.desdeSubcuentaN")}
                {...uiProps("subcuentaDesde")}
                soloLectura={informe.todasSubcuentas}
                opcional
            />
            <QInput
                label={tContabilidad("libro_mayor.hastaSubcuentaN")}
                {...uiProps("subcuentaHasta")}
                soloLectura={informe.todasSubcuentas}
                opcional
            />
        </FilaFormulario>
        <FilaFormulario>
            <QCheckbox label={tContabilidad("libro_mayor.calcularSaldoInicial")} {...uiProps("saldoInicial")} />
            <QCheckbox label={tContabilidad("libro_mayor.excluirPartidasACero")} {...uiProps("excluirPartidasCero")} />
        </FilaFormulario>
        <FilaFormulario>
            <CriterioOrdenMayor label={tContabilidad("libro_mayor.criterio")} {...uiProps("orden")} />
            <SentidoOrdenInforme label={tContabilidad("libro_mayor.orden")} {...uiProps("tipoOrden")} />
        </FilaFormulario>
    </>
);
