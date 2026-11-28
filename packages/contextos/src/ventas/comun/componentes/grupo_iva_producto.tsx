import { QSelect, QSelectProps } from "@olula/componentes/atomos/qselect.tsx";
import { obtenerOpcionesSelector } from "@olula/lib/infraestructura.ts";
import { useEffect, useState } from "react";
import { useTVentas } from "../../i18n/index.ts";

type GrupoIvaProductoProps = Omit<QSelectProps, "opciones" | "label">;

export const GrupoIvaProducto = ({
  valor,
  onChange,
  // nombre,
  ...props
}: GrupoIvaProductoProps) => {
  const t = useTVentas();
  const [opciones, setOpciones] = useState<
    { valor: string; descripcion: string }[]
  >([]);

  useEffect(() => {
    const cargarOpciones = async () => {
      const opciones = await obtenerOpcionesSelector("grupo_iva_producto")();
      const opcionesMapeadas = opciones.map((opcion) => ({
        valor: opcion[0],
        descripcion: opcion[1],
      }));
      setOpciones(opcionesMapeadas);
    };

    cargarOpciones();
  }, []);

  return (
    <QSelect
      {...props}
      label={t("comun.campos.grupoIva")}
      // nombre="grupo_iva_producto_id"
      valor={valor}
      onChange={onChange}
      opciones={opciones}
    />
  );
};
