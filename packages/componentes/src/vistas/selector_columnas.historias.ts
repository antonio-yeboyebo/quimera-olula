import { Historia, MetaHistorias } from "../historias/diseño.ts";
import { SelectorColumnas } from "./SelectorColumnas.tsx";

const catalogo = [
  { id: "codigo", cabecera: "Código" },
  { id: "cliente", cabecera: "Cliente" },
  { id: "fecha", cabecera: "Fecha" },
  { id: "total", cabecera: "Total" },
  { id: "notas", cabecera: "Notas" },
];

const nada = () => undefined;

export default {
  grupo: "vistas",
  titulo: "selector de columnas",
  Componente: SelectorColumnas,
} as MetaHistorias;

export const SinPersonalizar: Historia = {
  catalogo,
  visibles: ["codigo", "cliente", "fecha", "total"],
  personalizada: false,
  puedeGuardarOrden: false,
  onCambiar: nada,
  onGuardarOrden: nada,
  onRestaurar: nada,
};

export const Personalizada: Historia = {
  catalogo,
  visibles: ["total", "cliente", "codigo"],
  personalizada: true,
  puedeGuardarOrden: true,
  onCambiar: nada,
  onGuardarOrden: nada,
  onRestaurar: nada,
};
