import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Filtro } from "@olula/lib/diseño.ts";
import { getUsuarios } from "../../auth/usuario/infraestructura.ts";
import { tComun } from "../i18n/index.ts";

interface UsuarioProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const Usuario = ({
  descripcion = "",
  valor,
  nombre = "usuario_id",
  label = tComun("componentes.usuario"),
  deshabilitado = false,
  onChange,
  ...props
}: UsuarioProps) => {
  const obtenerOpciones = async (texto: string) => {
    const criteria = {
      filtro: ["nombre", "~", texto],
      orden: ["id"],
    };

    const { datos } = await getUsuarios(
      criteria.filtro as unknown as Filtro,
      criteria.orden
    );

    if (!Array.isArray(datos)) {
      console.error("Los usuarios no son un array:", datos);
      return [];
    }

    return datos.map((usuario) => ({
      valor: usuario.id,
      descripcion: usuario.nombre,
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
