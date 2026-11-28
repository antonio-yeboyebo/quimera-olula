import { Tab, Tabs } from "@olula/componentes/index.js";
import { MaestroEstadosLead } from "../estadoLead/maestro/MaestroEstadosLead.tsx";
import { MaestroEstadosOportunidad } from "../estadoOportunidadVenta/maestro/MaestroEstadosOportunidad.tsx";
import { MaestroFuentesLead } from "../fuenteLead/maestro/MaestroFuentesLead.tsx";
import { tCrm } from "../i18n/index.ts";

export const OtrosCrm = () => {
  return (
    <Tabs>
      <Tab label={tCrm("otros.estadosOportunidad")}>
        <MaestroEstadosOportunidad />
      </Tab>
      <Tab label={tCrm("otros.estadosLead")}>
        <MaestroEstadosLead />
      </Tab>
      <Tab label={tCrm("otros.fuentesLead")}>
        <MaestroFuentesLead />
      </Tab>
    </Tabs>
  );
};
