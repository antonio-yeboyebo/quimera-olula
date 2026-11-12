import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { getProvincias } from "./infraestructura.ts";

interface ProvinciaSelectorProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  opcional?: boolean;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
  evaluarCambio?: () => void;
}

export const ProvinciaSelector = ({
  descripcion = "",
  valor,
  nombre = "provincia_id",
  label = "Provincia",
  onChange,
  ...props
}: ProvinciaSelectorProps) => {
  const obtenerOpciones = async (texto: string, id?: string) => {
    if (!id && texto.length < 2) return [];

    const criteria = {
      filtro: id ? [["id", "=", id]] : ["nombre", "~", texto],
      orden: ["nombre"],
    };

    const provincias = await getProvincias(
      criteria.filtro as unknown as Filtro,
      criteria.orden as Orden
    );

    return provincias.datos.map((provincia) => ({
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
      {...props}
    />
  );
};
