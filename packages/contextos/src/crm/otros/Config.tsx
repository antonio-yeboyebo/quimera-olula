import { Tab, Tabs } from "@olula/componentes/index.js";
import { MaestroEstadosLead } from "../estadoLead/maestro/MaestroEstadosLead.tsx";
import { MaestroEstadosOportunidad } from "../estadoOportunidadVenta/maestro/MaestroEstadosOportunidad.tsx";
import { MaestroFuentesLead } from "../fuenteLead/maestro/MaestroFuentesLead.tsx";

export const OtrosCrm = () => {
  return (
    <Tabs>
      <Tab label="Estados oportunidad">
        <MaestroEstadosOportunidad />
      </Tab>
      <Tab label="Estados lead">
        <MaestroEstadosLead />
      </Tab>
      <Tab label="Fuentes lead">
        <MaestroFuentesLead />
      </Tab>
    </Tabs>
  );
};
