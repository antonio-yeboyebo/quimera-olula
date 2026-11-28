import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { useEffect, useState } from "react";
import { getEstadosOportunidadVenta } from "../../oportunidadventa/infraestructura.ts";
import { tCrm } from "../../i18n/index.ts";

interface EstadoOportunidadProps {
  valor: string;
  nombre?: string;
  label?: string;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const EstadoOportunidad = ({
  valor,
  nombre = "estado_id",
  label = tCrm("comun.estado"),
  onChange,
  ...props
}: EstadoOportunidadProps) => {
  const [opcionesEstado, setOpcionesEstado] = useState<
    { valor: string; descripcion: string }[]
  >([]);

  useEffect(() => {
    const cargarOpcionesEstado = async () => {
      const criteria = {
        filtro: [] as unknown as Filtro,
        orden: ["id"] as unknown as Orden,
      };

      const estados = await getEstadosOportunidadVenta(
        criteria.filtro,
        criteria.orden
      );

      const opcionesMapeadas = estados.map((estado) => ({
        valor: String(estado.id),
        descripcion: estado.descripcion ?? "",
        probabilidad: estado.probabilidad,
      }));

      setOpcionesEstado(opcionesMapeadas);
    };

    cargarOpcionesEstado();
  }, []);

  return (
    <QSelect
      label={label}
      nombre={nombre}
      valor={valor}
      onChange={onChange}
      opciones={opcionesEstado}
      {...props}
    />
  );
};
