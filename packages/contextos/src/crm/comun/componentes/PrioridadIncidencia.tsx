import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { tCrm } from "../../i18n/index.ts";
import { opcionesPrioridadIncidencia } from "../valores/prioridad_incidencia.ts";

interface PrioridadProps {
  valor: string;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
  getProps?: (campo: string) => Record<string, unknown>;
}


export const PrioridadIncidencia = ({
  valor,
  onChange,
  getProps,
}: PrioridadProps) => {
  return (
    <QSelect
      label={tCrm("comun.prioridad")}
      nombre="prioridad"
      valor={valor}
      onChange={onChange}
      opciones={opcionesPrioridadIncidencia}
      {...(getProps ? getProps("prioridad") : {})}
    />
  );
};
