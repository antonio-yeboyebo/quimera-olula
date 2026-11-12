import { ProvinciaSelector } from "#/comun/componentes/provincia/provincia.tsx";
import { Agente } from "#/ventas/comun/componentes/agente.tsx";
import { Cliente } from "#/ventas/comun/componentes/cliente.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { NuevaComparativaVentas } from "../diseño.ts";
import {
    admiteFechas,
    aniosInformados,
    opcionesBusquedaAgente,
    opcionesIntervalo,
} from "../dominio.ts";
import "./CamposCriterios.css";

export const CamposCriterios = ({
    form,
    comparativa,
}: {
    form: FormModelo;
    comparativa: NuevaComparativaVentas;
}) => {
    const { uiProps } = form;
    const conFechas = admiteFechas(comparativa);

    return (
        <div className="CamposCriterios">
            <quimera-formulario>
                <QInput label="Año desde" {...uiProps("anioDesde")} autoSeleccion />
                <QInput label="Año hasta" {...uiProps("anioHasta")} autoSeleccion />
                <QCheckbox label="Mostrar objetivo" {...uiProps("mostrarObjetivo")} />
                <QSelect
                    label="Intervalo"
                    {...uiProps("intervaloId")}
                    opciones={opcionesIntervalo}
                    placeholder="Sin intervalo"
                    deshabilitado={comparativa.mostrarObjetivo || !aniosInformados(comparativa)}
                    opcional
                />
                <QDate
                    label="Desde fecha"
                    {...uiProps("fechaDesde")}
                    deshabilitado={!conFechas}
                    opcional
                />
                <QDate
                    label="Hasta fecha"
                    {...uiProps("fechaHasta")}
                    deshabilitado={!conFechas}
                    opcional
                />
            </quimera-formulario>

            <quimera-formulario>
                <Cliente {...uiProps("clienteId", "nombreCliente")} opcional />
                <Agente {...uiProps("agenteId", "nombreAgente")} opcional />
                <QSelect
                    label="Búsqueda de agente"
                    {...uiProps("busquedaAgente")}
                    opciones={opcionesBusquedaAgente}
                />
                <ProvinciaSelector {...uiProps("provinciaId", "nombreProvincia")} opcional />
            </quimera-formulario>
        </div>
    );
};
