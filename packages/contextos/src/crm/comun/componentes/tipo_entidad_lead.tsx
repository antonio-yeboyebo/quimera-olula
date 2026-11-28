import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { opcionesTipoEntidadLead } from "../valores/tipo_entidad_lead.ts";
import { tCrm } from "../../i18n/index.ts";

interface TipoEntidadLeadProps {
  valor: string;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
  getProps?: (campo: string) => Record<string, unknown>;
}

export const TipoEntidadLead = ({
  valor,
  onChange,
  getProps,
}: TipoEntidadLeadProps) => {
  return (
    <QSelect
      label={tCrm("comun.tipoEntidad")}
      nombre="tipo"
      valor={valor}
      onChange={onChange}
      opciones={opcionesTipoEntidadLead}
      deshabilitado={true}
      {...(getProps ? getProps("tipo") : {})}
    />
  );
};
