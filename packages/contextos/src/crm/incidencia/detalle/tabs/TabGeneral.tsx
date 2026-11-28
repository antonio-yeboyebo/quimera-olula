import { Usuario } from "#/comun/componentes/usuario.tsx";
import { EstadoIncidencia } from "#/crm/comun/componentes/EstadoIncidencia.tsx";
import { PrioridadIncidencia } from "#/crm/comun/componentes/PrioridadIncidencia.tsx";
import { TipoIncidencia } from "#/crm/comun/componentes/TipoIncidencia.tsx";
import {
  QDate,
  QInput,
  QTextArea,
  Tab,
  Tabs,
} from "@olula/componentes/index.js";
import { HookModelo } from "@olula/lib/useModelo.js";
import { Incidencia } from "../../diseño.ts";
import { tCrm } from "../../../i18n/index.ts";

export const TabGeneral = ({
  incidencia,
}: {
  incidencia: HookModelo<Incidencia>;
}) => {
  const { uiProps } = incidencia;

  return (
    <div className="TabGeneral">
      <quimera-formulario>
        <QInput label={tCrm("incidencia.descripcion")} {...uiProps("descripcion")} />
        <QInput label={tCrm("incidencia.nombre")} {...uiProps("nombre")} />
        <QDate label={tCrm("incidencia.fecha")} {...uiProps("fecha")} />
        <PrioridadIncidencia {...uiProps("prioridad")} />
        <EstadoIncidencia {...uiProps("estado")} />
        <TipoIncidencia {...uiProps("tipo_incidencia")} />
        <Usuario
          {...uiProps("responsable_id", "nombre_responsable")}
          label={tCrm("incidencia.responsable")}
        />
        <div className="Tabs">
          <Tabs>
            <Tab label={tCrm("incidencia.descripcion")}>
              <QTextArea
                label={tCrm("incidencia.descripcionLarga")}
                rows={5}
                {...uiProps("descripcion_larga")}
              />
            </Tab>
            <Tab label={tCrm("incidencia.resolucion")}>
              <QTextArea
                label={tCrm("incidencia.resolucion")}
                rows={5}
                {...uiProps("resolucion")}
              />
            </Tab>
          </Tabs>
        </div>
      </quimera-formulario>
    </div>
  );
};
