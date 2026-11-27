import { Entidad } from "@olula/lib/diseño.ts";
import {
  formatearFechaDate,
  formatearFechaHora,
  formatearFechaString,
  formatearHoraString,
  formatearMoneda,
  resolverDivisa,
} from "@olula/lib/dominio.ts";
import { ReactNode, isValidElement } from "react";
import { MetaColumna } from "../atomos/qtablacontrolada.tsx";

// Fuera de qtarjeta_metatabla.tsx: un fichero de componentes que exporta
// funciones rompe el fast refresh de Vite. Lo usan las tarjetas (genérica y
// plantilla del usuario) y las columnas de los plugins.

const formatearValor = (
  valor: unknown,
  tipo?:
    | "texto"
    | "numero"
    | "moneda"
    | "fecha"
    | "hora"
    | "fechahora"
    | "booleano",
  divisa?: string
): string => {
  if (tipo === "moneda") {
    if (typeof valor === "number" || typeof valor === "string") {
      return formatearMoneda(valor, divisa ?? "EUR");
    }
    return "";
  }

  if (tipo === "fecha" && typeof valor === "string") {
    return formatearFechaString(valor);
  }

  if (tipo === "fecha" && valor instanceof Date) {
    return formatearFechaDate(valor);
  }

  if (tipo === "hora" && typeof valor === "string") {
    return formatearHoraString(valor);
  }

  if (tipo === "fechahora" && valor instanceof Date) {
    return formatearFechaHora(valor);
  }

  if (tipo === "numero" && typeof valor === "number") {
    return valor.toLocaleString("es-ES");
  }

  if (tipo === "booleano" && typeof valor === "boolean") {
    return valor ? "Sí" : "No";
  }

  if (typeof valor === "boolean") {
    return valor ? "Sí" : "No";
  }

  if (typeof valor === "number") {
    return valor.toString();
  }

  if (typeof valor === "string") {
    return valor;
  }

  return valor as string;
};

const esValorVacio = (valor: unknown) =>
  valor === undefined || valor === null || valor === "";

/** Valor de una columna tal como se pinta en una tarjeta (render, formato, vacío). */
export const valorColumna = <T extends Entidad>(
  entidad: T,
  columna: MetaColumna<T>,
  placeholderVacio: string
): string | ReactNode => {
  const valorRender = columna.render?.(entidad);

  if (valorRender !== undefined && valorRender !== null) {
    if (typeof valorRender === "string" && esValorVacio(valorRender.trim())) {
      return (
        <span className="tarjeta-metatabla-valor-vacio">
          {placeholderVacio}
        </span>
      );
    }

    return valorRender;
  }

  const valorBruto = entidad[columna.id] as unknown;

  if (esValorVacio(valorBruto)) {
    return (
      <span className="tarjeta-metatabla-valor-vacio">{placeholderVacio}</span>
    );
  }

  const valorFormateado = formatearValor(
    valorBruto,
    columna.tipo,
    resolverDivisa(columna.divisa, entidad)
  );

  if (isValidElement(valorFormateado)) {
    return valorFormateado;
  }

  if (
    typeof valorFormateado === "string" ||
    typeof valorFormateado === "number" ||
    typeof valorFormateado === "boolean"
  ) {
    return String(valorFormateado);
  }

  return valorFormateado as ReactNode;
};
