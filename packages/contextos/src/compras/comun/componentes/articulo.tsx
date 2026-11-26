import { getArticulo, getTagsArticulo } from "#/compras/articulo/infraestructura.ts";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { useEffect, useState } from "react";
import { useTCompras } from "#/compras/i18n/index.ts";

interface ArticuloProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  autoFocus?: boolean;
  deshabilitado?: boolean;
  opcional?: boolean;
  ref?: React.RefObject<HTMLInputElement | null>;
  soloLectura?: boolean;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const Articulo = ({
  descripcion = "",
  valor,
  nombre = "referencia",
  label,
  onChange,
  ...props
}: ArticuloProps) => {
  const t = useTCompras();
  const [descripcionResuelta, setDescripcionResuelta] = useState(descripcion);

  useEffect(() => {
    if (!valor) {
      setDescripcionResuelta(descripcion);
      return;
    }
    if (descripcion) {
      setDescripcionResuelta(descripcion);
      return;
    }
    getArticulo(valor).then((articulo) =>
      setDescripcionResuelta(articulo.descripcion)
    );
  }, [valor]); // eslint-disable-line react-hooks/exhaustive-deps

  const obtenerOpciones = async (texto: string) => {
    const criteria = {
      filtro: {
        or: [
          ["descripcion", "~", texto],
          ["id", "~", texto],
        ],
      },
      orden: ["id"],
    };

    const articulos = await getTagsArticulo(
      criteria.filtro as unknown as Filtro,
      criteria.orden as Orden
    );

    return articulos.map((articulo) => ({
      valor: articulo.id,
      descripcion: articulo.descripcion,
      descripcionOpcion: `${articulo.id} - ${articulo.descripcion}`,
      datos: articulo,
    }));
  };

  return (
    <QAutocompletar
      label={`${label ?? t("comun.campos.articulo")} ${valor}`}
      nombre={nombre}
      onChange={onChange}
      valor={valor}
      obtenerOpciones={obtenerOpciones}
      descripcion={descripcionResuelta}
      {...props}
    />
  );
};
