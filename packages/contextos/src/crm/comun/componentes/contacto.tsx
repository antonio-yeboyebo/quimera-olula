import { getContactos } from "#/crm/contacto/infraestructura.ts";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Criteria } from "@olula/lib/diseño.ts";

interface ContactoSelectorProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const ContactoSelector = ({
  descripcion = "",
  valor,
  nombre = "contacto_id",
  label = "Seleccionar contacto",
  deshabilitado = false,
  onChange,
}: ContactoSelectorProps) => {
  const obtenerOpciones = async (valor: string) => {
    if (valor.length < 3) return [];

    const criteria: Criteria = {
      filtro: [["nombre", "~", valor]],
      orden: ["id"],
      paginacion: { pagina: 1, limite: 10 },
    };

    const { datos: contactos } = await getContactos(
      criteria.filtro,
      criteria.orden,
      criteria.paginacion
    );

    return contactos.map((contacto) => ({
      valor: contacto.id,
      descripcion: contacto.nombre + " - " + contacto.email,
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
    />
  );
};
