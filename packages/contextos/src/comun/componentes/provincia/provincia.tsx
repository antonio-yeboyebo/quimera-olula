import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { getProvincias } from "./infraestructura.ts";

interface ProvinciaProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const Provincia = ({
  descripcion = "",
  valor,
  nombre = "provincia_id",
  label = "Provincia",
  deshabilitado = false,
  onChange,
}: ProvinciaProps) => {
  // El segundo argumento llega cuando QAutocompletar tiene un id sin descripción
  // y necesita resolver su nombre.
  const obtenerOpciones = async (texto: string, id?: string) => {
    const criteria = {
      filtro: id ? [["id", "=", id]] : ["nombre", "~", texto],
      orden: ["nombre"],
    };

    const provincias = await getProvincias(
      criteria.filtro as unknown as Filtro,
      criteria.orden as Orden
    );

    return provincias.map((provincia) => ({
      valor: provincia.id,
      descripcion: provincia.nombre,
    }));
  };

  return (
    <QAutocompletar
      label={label}
      nombre={nombre}
      onChange={onChange}
      valor={valor}
      autoSeleccion
      obtenerOpciones={obtenerOpciones}
      descripcion={descripcion}
      deshabilitado={deshabilitado}
      longitudMinima={0}
    />
  );
};
