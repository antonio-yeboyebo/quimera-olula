import { FechaInforme } from "#/contabilidad/comun/componentes/FechaInforme.tsx";
import { FilaFormulario } from "#/contabilidad/comun/componentes/FilaFormulario.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { tContabilidad } from "../../i18n/index.ts";

/**
 * Criterios de los libros de facturas emitidas y recibidas, iguales en el
 * alta y en la ficha. Las recibidas llevan además la serie, delante de la
 * casilla de todos los tipos de I.V.A. Cada módulo decide con su dominio si
 * el % de I.V.A. y el número inicial se pueden editar.
 */
export const CamposLibroIva = ({
    uiProps,
    porcentajeEditable,
    numeroDesdeEditable,
    conSerie = false,
    refDescripcion,
}: {
    uiProps: FormModelo["uiProps"];
    porcentajeEditable: boolean;
    numeroDesdeEditable: boolean;
    conSerie?: boolean;
    refDescripcion?: ReturnType<typeof useFocus>;
}) => (
    <>
        <QInput label={tContabilidad("comun.descripcion")} {...uiProps("descripcion")} ref={refDescripcion} />
        <FilaFormulario>
            <QInput label={tContabilidad("comun.ejercicio")} {...uiProps("ejercicioId")} />
            <FechaInforme label={tContabilidad("comun.desdeFecha")} {...uiProps("fechaDesde")} />
            <FechaInforme label={tContabilidad("comun.hastaFecha")} {...uiProps("fechaHasta")} />
        </FilaFormulario>
        <FilaFormulario>
            {conSerie && <QInput label={tContabilidad("comun.serie")} {...uiProps("codigoSerie")} opcional />}
            <QCheckbox label={tContabilidad("comun.todosLosTiposDeIV")} {...uiProps("todos")} />
            <QInput
                label={tContabilidad("comun.deIVA")}
                {...uiProps("porcentaje")}
                soloLectura={!porcentajeEditable}
            />
        </FilaFormulario>
        <FilaFormulario>
            <QCheckbox label={tContabilidad("comun.soloConIVA")} {...uiProps("conIva")} />
            <QCheckbox label={tContabilidad("comun.mostrarTotalFactura")} {...uiProps("mostrarTotalFactura")} />
            <QCheckbox label={tContabilidad("comun.mostrarNif")} {...uiProps("mostrarNif")} />
            <QCheckbox label={tContabilidad("comun.mostrarDocumento")} {...uiProps("mostrarDocumento")} />
            <QCheckbox label={tContabilidad("comun.mostrarAsiento")} {...uiProps("mostrarAsiento")} />
        </FilaFormulario>
        <FilaFormulario>
            <QCheckbox label={tContabilidad("comun.numeracionAutomatica")} {...uiProps("numeracionAutomatica")} />
            <QInput
                label={tContabilidad("comun.numerarDesde")}
                {...uiProps("numeroDesde")}
                soloLectura={!numeroDesdeEditable}
                opcional
            />
        </FilaFormulario>
    </>
);
