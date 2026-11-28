import { useTVentas } from "#/ventas/i18n/index.ts";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { CrmContacto } from "../../cliente/diseño.ts";
import { getCrmContactos } from "../../cliente/infraestructura.ts";

interface ContactoSelectorProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  excluir?: string[];
  /** De dónde se buscan los contactos. Por defecto, los del CRM. */
  obtenerContactos?: (filtro: Filtro, orden: Orden) => Promise<CrmContacto[]>;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const ContactoSelector = ({
  descripcion = "",
  valor,
  nombre = "contacto_id",
  label,
  deshabilitado = false,
  excluir = [],
  obtenerContactos = getCrmContactos,
  onChange,
}: ContactoSelectorProps) => {
  const t = useTVentas();
  const obtenerOpciones = async (valor: string) => {
    if (valor.length < 3) return [];

    const criteria = {
      filtro: ["nombre", "~", valor],
      orden: ["id"],
    };

    const contactos = await obtenerContactos(
      criteria.filtro as unknown as Filtro,
      criteria.orden as Orden
    );

    return contactos
      .filter((contacto) => !excluir.includes(contacto.id))
      .map((contacto) => ({
        valor: contacto.id,
        descripcion: [contacto.nombre, contacto.email, contacto.telefono1]
          .filter(Boolean)
          .join(" - "),
      }));
  };

  return (
    <QAutocompletar
      label={label ?? t("comun.seleccionarContacto")}
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
