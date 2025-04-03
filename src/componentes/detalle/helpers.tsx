import { Entidad } from "../../contextos/comun/diseño.ts";
import { QInput } from "../atomos/qinput.tsx";
import { QSelect } from "../atomos/qselect.tsx";
import { CampoFormularioGenerico } from "./FormularioGenerico.tsx";

export const renderSelect = (
  campo: CampoFormularioGenerico,
  entidad: Entidad
) => {
  const attrs = {
    nombre: campo.nombre,
    label: campo.etiqueta,
    placeholder:
      campo.placeholder ?? `Selecciona un/a ${campo.etiqueta.toLowerCase()}`,
    valor: entidad[campo.nombre] as string,
    opcional: !campo.requerido,
    deshabilitado: campo.soloLectura,
    condensado: campo.condensado,
    opciones:
      campo.opciones?.map(([valor, descripcion]) => ({
        valor,
        descripcion,
      })) ?? [],
    "todo-ancho": campo.ancho === "100%" ? "true" : undefined,
  };

  return <QSelect key={campo.nombre} {...attrs} />;
};

export const renderInput = (
  campo: CampoFormularioGenerico,
  entidad: Entidad
) => {
  const attrs = {
    nombre: campo.nombre,
    label: campo.etiqueta,
    placeholder:
      campo.placeholder ??
      `Introduce el valor de ${campo.etiqueta.toLowerCase()}`,
    valor: entidad[campo.nombre] as string,
    condensado: campo.condensado,
    opcional: !campo.requerido,
    deshabilitado: campo.soloLectura,
    "todo-ancho": campo.ancho === "100%" ? "true" : undefined,
  };

  return <QInput key={campo.nombre} {...attrs} />;
};

export const renderSpace = () => {
  return <div key="space" style={{ height: "1rem", width: "100%" }}></div>;
};

export const expandirEntidad = (entidad: Entidad) =>
  Object.entries(entidad)
    .filter(([, valor]) => !Array.isArray(valor))
    .flatMap(([clave, valor]) => {
      if (valor?.constructor !== Object) return [[clave, valor]];

      return Object.entries(valor).map(([claveInterna, valor]) => [
        clave + "." + claveInterna,
        valor,
      ]);
    });

export const formatearClave = (clave: string) =>
  clave
    .split(".")
    .at(-1)!
    .replaceAll("_", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
