import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { ESTADOS_COMUNICACION } from "../comunicacion/diseño.ts";
import { tComun } from "../i18n/index.ts";

interface EstadoComunicacionProps {
  valor: string;
  nombre?: string;
  label?: string;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

const opcionesEstadoComunicacion = [
  { valor: ESTADOS_COMUNICACION.NO_LEIDA, get descripcion() { return tComun("componentes.noLeida"); } },
  { valor: ESTADOS_COMUNICACION.LEIDA, get descripcion() { return tComun("componentes.leida"); } },
];

export const EstadoComunicacion = ({
  valor,
  nombre = "estado",
  label = tComun("componentes.estado"),
  onChange,
  ...props
}: EstadoComunicacionProps) => {
  return (
    <QSelect
      label={label}
      nombre={nombre}
      valor={valor}
      onChange={onChange}
      opciones={opcionesEstadoComunicacion}
      placeholder={tComun("componentes.todas")}
      {...props}
    />
  );
};
