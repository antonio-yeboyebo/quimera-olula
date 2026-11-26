import { useTComun } from "../../i18n/index.ts";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { getPaises } from "./infraestructura.ts";

interface PaisSelectorProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
  // Se usa con "{...uiProps('pais_id')}": evaluarCambio es lo que dispara el
  // guardado al perder el foco (ver useModelo). Sin recogerlo y reenviarlo a
  // QAutocompletar aquí, se pierde antes de llegar y el campo nunca guarda.
  evaluarCambio?: () => void;
}

export const PaisSelector = ({
  descripcion = "",
  valor,
  nombre = "pais_id",
  label,
  deshabilitado = false,
  onChange,
  evaluarCambio,
}: PaisSelectorProps) => {
  const t = useTComun();
  // El segundo argumento llega cuando QAutocompletar tiene un id sin descripción
  // y necesita resolver su nombre (ej. la dirección ya guardada de un documento).
  const obtenerOpciones = async (texto: string, id?: string) => {
    if (!id && texto.length < 2) return [];

    const criteria = {
      filtro: id ? [["id", "=", id]] : ["nombre", "~", texto],
      orden: ["id"],
    };

    const paises = await getPaises(
      criteria.filtro as unknown as Filtro,
      criteria.orden as Orden
    );

    return paises.datos.map((pais) => ({
      valor: pais.id,
      descripcion: pais.nombre,
    }));
  };

  return (
    <QAutocompletar
      label={label ?? t("pais")}
      nombre={nombre}
      onChange={onChange}
      valor={valor}
      autoSeleccion
      obtenerOpciones={obtenerOpciones}
      descripcion={descripcion}
      deshabilitado={deshabilitado}
      evaluarCambio={evaluarCambio}
    />
  );
};
