import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { useEffect, useState } from "react";
import { getEstadosLead } from "../../estadoLead/infraestructura.ts";
import { useTCrm } from "../../i18n/index.ts";

interface EstadoLeadsProps {
  valor: string;
  nombre?: string;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
  getProps?: (campo: string) => Record<string, unknown>;
}

export const EstadoLead = ({
  valor,
  nombre = "estado_id",
  onChange,
  ...props
}: EstadoLeadsProps) => {
  const t = useTCrm();
  const [opcionesEstadoLead, setOpcionesEstadoLead] = useState<
    { valor: string; descripcion: string }[]
  >([]);

  useEffect(() => {
    const cargarOpcionesEstadoLead = async () => {
      const opciones = await getEstadosLead([], [], {
        pagina: 1,
        limite: 100,
      }).then((respuesta) => respuesta.datos);
      const opcionesMapeadas = opciones.map((opcion) => ({
        valor: String(opcion.id),
        descripcion: String(opcion.descripcion),
      }));
      setOpcionesEstadoLead(opcionesMapeadas);
    };

    cargarOpcionesEstadoLead();
  }, []);

  return (
    <QSelect
      label={t("comun.estado")}
      nombre={nombre}
      valor={valor}
      onChange={onChange}
      opciones={opcionesEstadoLead}
      {...props}
    />
  );
};
