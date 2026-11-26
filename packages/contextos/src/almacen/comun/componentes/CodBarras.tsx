import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Criteria } from "@olula/lib/diseño.js";
import { obtenerArticulosAlmacen } from "../../articulo/infraestructura.ts";
import { tAlmacen } from "../../i18n/index.ts";

interface CodBarrasProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const CodBarras = ({
  descripcion = "",
  valor,
  nombre = "referencia",
  label = tAlmacen("comun.articulo"),
  onChange,
  ...props
}: CodBarrasProps) => {
  const obtenerOpciones = async (texto: string) => {
    const criteria: Criteria = {
      filtro: [["descripcion", "~", texto]],
      orden: ["id"],
      paginacion: { limite: 10, pagina: 1 },
    };

    const articulos = await obtenerArticulosAlmacen(
      criteria.filtro,
      criteria.orden
    );

    return articulos.map((articulo) => ({
      valor: articulo.id,
      descripcion: articulo.descripcion,
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
      {...props}
    />
  );
};
