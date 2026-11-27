import { opcionesEstadoAccion } from "./estado_accion.ts";
import { opcionesEstadoBaseOportunidad } from "./estado_base_oportunidad.ts";
import { opcionesTipoAccion } from "./tipo_accion.ts";
import { opcionesTipoEntidadLead } from "./tipo_entidad_lead.ts";

type Opcion = { valor: string; descripcion: string };

/** Descripción (traducida) de un valor que se guarda en BD en español; si no es una opción conocida, el valor tal cual. */
export const textoOpcion = (opciones: Opcion[], valor?: string | null): string =>
    opciones.find((o) => o.valor === valor)?.descripcion ?? valor ?? "";

export const textoTipoAccion = (valor?: string | null) => textoOpcion(opcionesTipoAccion, valor);
export const textoEstadoAccion = (valor?: string | null) => textoOpcion(opcionesEstadoAccion, valor);
export const textoEstadoBaseOportunidad = (valor?: string | null) => textoOpcion(opcionesEstadoBaseOportunidad, valor);
export const textoTipoEntidadLead = (valor?: string | null) => textoOpcion(opcionesTipoEntidadLead, valor);
