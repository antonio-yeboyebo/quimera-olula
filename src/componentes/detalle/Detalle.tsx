import { PropsWithChildren, useEffect } from "react";
import { Entidad } from "../../contextos/comun/diseño.ts";
import { QBoton } from "../atomos/qboton.tsx";
import { QIcono } from "../atomos/qicono.tsx";
import estilos from "./detalle.module.css";

interface DetalleProps<T extends Entidad> {
  id: string | undefined;
  obtenerTitulo?: (entidad: T) => string;
  entidad: T | null;
  setEntidad: (entidad: T) => void;
  cargar: (id: string) => Promise<T>;
  className?: string;
  cerrarDetalle?: () => void;
}

export function Detalle<T extends Entidad>({
  id,
  obtenerTitulo,
  children,
  entidad,
  setEntidad,
  cargar,
  className,
  cerrarDetalle,
}: PropsWithChildren<DetalleProps<T>>) {
  const { detalle } = estilos;

  useEffect(() => {
    if (id && (!entidad || id !== entidad.id)) {
      const load = async () => {
        const cliente = await cargar(id);
        if (cliente) {
          setEntidad(cliente);
        }
      };
      load();
    }
  }, [id, entidad, cargar, setEntidad]);

  if (!entidad) {
    return <>No se ha encontrado la entidad con Id: {id}</>;
  }

  if (!id) {
    return <></>;
  }

  return (
    <div className={`${detalle} ${className || ""}`.trim()}>
      {" "}
      {/* Combinar clases */}
      {obtenerTitulo && (
        <h2>
          <span>{obtenerTitulo(entidad)}</span>
          {cerrarDetalle && (
            <QBoton
              onClick={cerrarDetalle}
              variante="texto"
              tamaño="pequeño"
              destructivo
            >
              <QIcono nombre="cerrar" tamaño="xs" />
            </QBoton>
          )}
        </h2>
      )}
      {children}
    </div>
  );
}
