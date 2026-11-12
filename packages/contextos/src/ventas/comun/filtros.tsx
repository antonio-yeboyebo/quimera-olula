import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { ProvinciaSelector } from "#/comun/componentes/provincia/provincia.tsx";
import {
  filtroFechas,
  MetaCampoFiltro,
} from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { Agente } from "./componentes/agente.tsx";
import { Cliente } from "./componentes/cliente.tsx";

/**
 * Filtros compartidos por los maestros de ventas.
 *
 * Los de entidad no declaran `tipo`: convertirCampoHaciaUI transformaría el valor
 * y no llegaría intacto al selector.
 */

export const filtroCliente: MetaCampoFiltro = {
  id: "cliente_id",
  label: "Cliente",
  filtro: (v) => (v ? ["cliente_id", "=", v as string] : null),
  render: (valor, onChange) => (
    <Cliente
      valor={(valor as string) ?? ""}
      opcional
      onChange={(opcion) => onChange(opcion?.valor ?? "")}
    />
  ),
};

export const filtroAgente: MetaCampoFiltro = {
  id: "agente_id",
  label: "Agente",
  filtro: (v) => (v ? ["agente_id", "=", v as string] : null),
  render: (valor, onChange) => (
    <Agente
      valor={(valor as string) ?? ""}
      opcional
      enlace=""
      onChange={(opcion) => onChange(opcion?.valor ?? "")}
    />
  ),
};

export const filtroProvincia: MetaCampoFiltro = {
  id: "provincia_id",
  label: "Provincia",
  filtro: (v) => (v ? ["provincia_id", "=", v as string] : null),
  render: (valor, onChange) => (
    <ProvinciaSelector
      valor={(valor as string) ?? ""}
      opcional
      onChange={(opcion) => onChange(opcion?.valor ?? "")}
    />
  ),
};

export const filtroAlmacen: MetaCampoFiltro = {
  id: "almacen_id",
  label: "Almacén",
  filtro: (v) => (v ? ["almacen_id", "=", v as string] : null),
  render: (valor, onChange) => (
    <Almacen
      nombre="almacen_id"
      valor={(valor as string) ?? ""}
      opcional
      onChange={(opcion) => onChange(opcion?.valor ?? "")}
    />
  ),
};

export const filtroCodigo: MetaCampoFiltro = {
  id: "codigo",
  label: "Código",
  tipo: "texto",
  filtro: (v) => (v ? ["codigo", "~", v as string] : null),
};

export const filtroFechaDocumento: MetaCampoFiltro = {
  id: "fecha",
  label: "Fecha",
  tipo: "intervalo_fechas",
  filtro: (v) => filtroFechas("fecha", v),
};
