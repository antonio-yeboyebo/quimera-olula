import { MetaCampoFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { Familia } from "./componentes/Familia.tsx";
import { tAlmacen } from "../i18n/index.ts";

export const filtroFamilia: MetaCampoFiltro = {
  id: "familia_id",
  get label() { return tAlmacen("comun.familia"); },
  filtro: (v) => (v ? ["familia_id", "=", v as string] : null),
  render: (valor, onChange) => (
    <Familia
      valor={(valor as string) ?? ""}
      opcional
      onChange={(opcion) => onChange(opcion?.valor ?? "")}
    />
  ),
};
