import {
    CriterioOrdenInforme,
    SentidoOrdenInforme,
} from "#/contabilidad/comun/componentes/OpcionesLibroDiario.tsx";
import { FechaInforme } from "#/contabilidad/comun/componentes/FechaInforme.tsx";
import { FilaFormulario } from "#/contabilidad/comun/componentes/FilaFormulario.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { LibroDiario } from "../diseño.ts";
import { admiteOpcionesDeDetalle } from "../dominio.ts";
import { tContabilidad } from "../../i18n/index.ts";

type Informe = Pick<LibroDiario, "todosAsientos" | "todasSubcuentas" | "resumenMensual">;

/** Criterios del libro diario, iguales en el alta y en la ficha: cada rango
 * con su casilla en una fila y los tres niveles de orden en filas propias. */
export const CamposLibroDiario = ({
    uiProps,
    informe,
    refDescripcion,
}: {
    uiProps: FormModelo["uiProps"];
    informe: Informe;
    refDescripcion?: ReturnType<typeof useFocus>;
}) => {
    // `controlChecks` de Eneboo: con resumen mensual no hay ni datos de
    // I.V.A. ni agrupación por meses.
    const conDetalle = admiteOpcionesDeDetalle(informe);

    return (
        <>
            <QInput label={tContabilidad("libro_diario.descripcion")} {...uiProps("descripcion")} ref={refDescripcion} />
            <FilaFormulario>
                <QInput label={tContabilidad("libro_diario.ejercicio")} {...uiProps("ejercicioId")} />
                <FechaInforme label={tContabilidad("libro_diario.desdeFecha")} {...uiProps("fechaDesde")} />
                <FechaInforme label={tContabilidad("libro_diario.hastaFecha")} {...uiProps("fechaHasta")} />
            </FilaFormulario>
            <FilaFormulario>
                <QCheckbox label={tContabilidad("libro_diario.todosLosAsientos")} {...uiProps("todosAsientos")} />
                <QInput
                    label={tContabilidad("libro_diario.desdeAsientoN")}
                    {...uiProps("asientoDesde")}
                    soloLectura={informe.todosAsientos}
                    opcional
                />
                <QInput
                    label={tContabilidad("libro_diario.hastaAsientoN")}
                    {...uiProps("asientoHasta")}
                    soloLectura={informe.todosAsientos}
                    opcional
                />
            </FilaFormulario>
            <FilaFormulario>
                <QCheckbox label={tContabilidad("libro_diario.todasLasSubcuentas")} {...uiProps("todasSubcuentas")} />
                <QInput
                    label={tContabilidad("libro_diario.desdeSubcuentaN")}
                    {...uiProps("subcuentaDesde")}
                    soloLectura={informe.todasSubcuentas}
                    opcional
                />
                <QInput
                    label={tContabilidad("libro_diario.hastaSubcuentaN")}
                    {...uiProps("subcuentaHasta")}
                    soloLectura={informe.todasSubcuentas}
                    opcional
                />
            </FilaFormulario>
            <FilaFormulario>
                <QCheckbox label={tContabilidad("libro_diario.resumenMensual")} {...uiProps("resumenMensual")} />
                <QCheckbox
                    label={tContabilidad("libro_diario.datosDeIVA")}
                    {...uiProps("datosIva")}
                    soloLectura={!conDetalle}
                />
                <QCheckbox
                    label={tContabilidad("libro_diario.agruparPorMeses")}
                    {...uiProps("agruparMeses")}
                    soloLectura={!conDetalle}
                />
            </FilaFormulario>
            {([1, 2, 3] as const).map((n) => (
                <FilaFormulario key={n}>
                    <CriterioOrdenInforme label={tContabilidad("libro_diario.criterioN", { n })} {...uiProps(`orden${n}`)} />
                    <SentidoOrdenInforme label={tContabilidad("libro_diario.ordenN", { n })} {...uiProps(`tipoOrden${n}`)} />
                </FilaFormulario>
            ))}
        </>
    );
};
