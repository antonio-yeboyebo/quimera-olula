import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { opcionesEstadoAccion } from "../valores/estado_accion.ts";
import { tCrm } from "../../i18n/index.ts";

interface EstadoAccionProps {
  valor: string;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
  getProps?: (campo: string) => Record<string, unknown>;
}

export const EstadoAccion = ({
  valor,
  onChange,
  getProps,
}: EstadoAccionProps) => {
  return (
    <QSelect
      label={tCrm("comun.estado")}
      nombre="estado"
      valor={valor}
      onChange={onChange}
      opciones={opcionesEstadoAccion}
      {...(getProps ? getProps("estado") : {})}
    />
  );
};
