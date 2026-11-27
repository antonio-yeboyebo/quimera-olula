import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Filtro } from "@olula/lib/diseño.ts";
import { getEmpresas } from "../../../crm/empresa/infraestructura.ts";
import { tCrm } from "../../i18n/index.ts";

interface ClienteProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  onChange?: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const Empresa = ({
  descripcion = "",
  valor,
  nombre = "empresa_id",
  label = tCrm("comun.empresa"),
  deshabilitado = false,
  onChange,
  ...props
}: ClienteProps) => {
  const obtenerOpciones = async (texto: string) => {
    const criteria = {
      filtro: ["nombre", "~", texto],
      orden: ["id"],
    };

    const empresas = await getEmpresas(
      criteria.filtro as unknown as Filtro,
      criteria.orden
    );

    return empresas.map((empresa) => ({
      valor: empresa.id,
      descripcion: empresa.nombre,
    }));
  };

  return (
    <QAutocompletar
      label={label}
      nombre={nombre}
      onChange={onChange}
      valor={valor}
      obtenerOpciones={obtenerOpciones}
      descripcion={descripcion}
      deshabilitado={deshabilitado}
      {...props}
    />
  );
};
