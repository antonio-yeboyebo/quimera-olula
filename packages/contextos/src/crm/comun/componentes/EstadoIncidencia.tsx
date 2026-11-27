import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { tCrm } from "../../i18n/index.ts";

interface EstadoProps {
  valor: string;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
  getProps?: (campo: string) => Record<string, unknown>;
}

export const opcionesEstadoIncidencia = [
  { valor: "nueva", get descripcion() { return tCrm("comun.nueva"); } },
  { valor: "en_espera", get descripcion() { return tCrm("comun.enEspera"); } },
  { valor: "asignada", get descripcion() { return tCrm("comun.asignada"); } },
  { valor: "rechazada", get descripcion() { return tCrm("comun.rechazada"); } },
  { valor: "cerrada", get descripcion() { return tCrm("comun.cerrada"); } },
];

const opcionesEstado = opcionesEstadoIncidencia;

export const descripcionEstadoIncidencia = (estado: string): string =>
  opcionesEstadoIncidencia.find((o) => o.valor === estado)?.descripcion ??
  estado;

export const EstadoIncidencia = ({
  valor,
  onChange,
  ...props
}: EstadoProps) => {
  return (
    <QSelect
      label={tCrm("comun.estado")}
      nombre="estado"
      valor={valor}
      onChange={onChange}
      opciones={opcionesEstado}
      {...props}
    />
  );
};
