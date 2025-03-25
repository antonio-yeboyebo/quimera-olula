import { MouseEventHandler, PropsWithChildren } from "react";
import "./qboton.css";

type QBotonProps = {
  tipo?: "button" | "submit" | "reset";
  variante?: "solido" | "borde" | "texto";
  tamaño?: "pequeño" | "mediano" | "grande";
  destructivo?: boolean;
  deshabilitado?: boolean;
  onClick?: MouseEventHandler;
};

export const QBoton = ({
  children,
  tipo = "button",
  variante = "solido",
  tamaño = "mediano",
  destructivo,
  deshabilitado,
  onClick,
}: PropsWithChildren<QBotonProps>) => {
  const attrs = { tamaño, variante, destructivo, deshabilitado };

  return (
    <quimera-boton {...attrs}>
      <button type={tipo} onClick={onClick}>
        {children}
      </button>
    </quimera-boton>
  );
};
