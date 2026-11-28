import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { formatearDireccionUnaLinea } from "@olula/lib/dominio.ts";
import { useEffect, useRef, useState } from "react";
import { getDirecciones } from "../../cliente/infraestructura.ts";
import { useTVentas } from "../../i18n/index.ts";
interface DireccionesProps {
  clienteId: string | undefined;
  valor?: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  valorDefecto?: "facturacion" | "envio";
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const DirCliente = ({
  clienteId,
  valor,
  nombre = "direccion_id",
  label: labelProp,
  deshabilitado = false,
  valorDefecto = "facturacion",
  onChange,
  ...props
}: DireccionesProps) => {
  const t = useTVentas();
  const label = labelProp ?? t("comun.campos.direccion");
  const [opcionesDireccion, setOpcionesDireccion] = useState<
    { valor: string; descripcion: string }[]
  >([]);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const valorRef = useRef(valor);
  valorRef.current = valor;
  const valorDefectoRef = useRef(valorDefecto);
  valorDefectoRef.current = valorDefecto;

  useEffect(() => {
    const fetchDirecciones = async () => {
      if (!clienteId) {
        setOpcionesDireccion([]);
        return;
      }

      const direcciones = await getDirecciones(clienteId);
      const opciones = direcciones.map((direccion) => ({
        valor: direccion.id,
        descripcion: formatearDireccionUnaLinea(direccion),
      }));
      setOpcionesDireccion(opciones);

      // Al cambiar de cliente el direccion_id anterior no se limpia, así que
      // solo se respeta si pertenece a este cliente.
      if (opciones.some((o) => o.valor === valorRef.current)) return;

      if (!valorDefectoRef.current) return;

      const dirDefecto = direcciones.find((d) =>
        valorDefectoRef.current === "facturacion" ? d.dir_facturacion : d.dir_envio
      );
      if (!dirDefecto) return;

      onChangeRef.current({
        valor: dirDefecto.id,
        descripcion: formatearDireccionUnaLinea(dirDefecto),
      });
    };

    fetchDirecciones();
  }, [clienteId]);

  return (
    <QSelect
      {...props}
      label={label}
      nombre={nombre}
      valor={valor}
      deshabilitado={deshabilitado}
      opciones={opcionesDireccion}
      onChange={onChange}
    />
  );
};
