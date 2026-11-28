import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { tCrm } from "../../i18n/index.ts";

interface TipoIncidenciaProps {
  valor: string;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
  getProps?: (campo: string) => Record<string, unknown>;
}

const opcionesTipo = [
  { valor: "proveedor", get descripcion() { return tCrm("comun.proveedor"); } },
  { valor: "transportista", get descripcion() { return tCrm("comun.transportista"); } },
];

export const TipoIncidencia = ({
  valor,
  onChange,
  getProps,
}: TipoIncidenciaProps) => {
  return (
    <QSelect
      label={tCrm("comun.tipo")}
      nombre="tipo_incidencia"
      valor={valor}
      onChange={onChange}
      opciones={opcionesTipo}
      {...(getProps ? getProps("tipo_incidencia") : {})}
    />
  );
};
