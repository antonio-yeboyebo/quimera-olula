import { useTVentas } from "#/ventas/i18n/index.ts";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { getAgentes } from "../../agente/infraestructura.ts";

interface AgenteProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  opcional?: boolean;
  enlace?: string;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const Agente = ({
  descripcion = "",
  valor,
  nombre = "agente_id",
  label,
  enlace = "/ventas/agente?id={id}",
  onChange,
  ...props
}: AgenteProps) => {
  const t = useTVentas();
  const obtenerOpciones = async (valor: string, id?: string) => {
    const criteria = {
      filtro: id ? [["id", "=", id]] : ["nombre", "~", valor],
      orden: ["id"],
    };

    const agentes = await getAgentes(
      criteria.filtro as unknown as Filtro,
      criteria.orden as Orden
    );

    return agentes.map((agente) => ({
      valor: agente.id,
      descripcion: agente.nombre,
      por_comision: agente.por_comision,
    }));
  };

  return (
    <QAutocompletar
      label={label ?? t("comun.agente")}
      nombre={nombre}
      onChange={onChange}
      valor={valor}
      autoSeleccion
      obtenerOpciones={obtenerOpciones}
      enlace={enlace}
      descripcion={descripcion}
      longitudMinima={0}
      {...props}
    />
  );
};
