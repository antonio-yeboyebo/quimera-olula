import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { useTComun } from "../i18n/index.ts";
import {
  OpcionGrupoIvaNegocio,
  useOpcionesGrupoIvaNegocio,
} from "./useOpcionesGrupoIvaNegocio.ts";

interface GrupoIvaNegocioProps {
  valor: string;
  label?: string;
  nombre?: string;
  onChange: (opcion: OpcionGrupoIvaNegocio | null) => void;
}

export const GrupoIvaNegocio = ({
  valor,
  label,
  nombre = "grupo_iva_negocio_id",
  onChange,
  ...props
}: GrupoIvaNegocioProps) => {
  const t = useTComun();
  const opciones = useOpcionesGrupoIvaNegocio();

  return (
    <QSelect
      {...props}
      label={label ?? t("grupoIvaNegocio")}
      nombre={nombre}
      valor={valor}
      onChange={onChange}
      opciones={opciones}
    />
  );
};
