import {
  AvisoObservacionesCliente,
  DependenciasAvisoObservacionesCliente,
} from "./diseño.ts";
import { tVentas } from "../../../i18n/index.ts";

const esClienteRegistrado = (clienteId: string | null | undefined): clienteId is string =>
  !!clienteId && clienteId !== "None";

/**
 * Decide si hay que avisar de las observaciones del cliente, como Eneboo
 * (`flfacturac.qs`, `avisarObservacionesCliente`): solo con «Mostrar
 * observaciones del cliente» marcado en la configuración de ventas y si el
 * cliente tiene observaciones.
 */
export const avisoObservacionesCliente = (
  mostrar: boolean,
  clienteId: string | null | undefined,
  observaciones: string | null | undefined
): AvisoObservacionesCliente | null => {
  if (!mostrar || !esClienteRegistrado(clienteId)) return null;

  const texto = (observaciones ?? "").trim();
  if (!texto) return null;

  return { clienteId, observaciones: texto };
};

export const tituloAvisoObservacionesCliente = (aviso: AvisoObservacionesCliente) =>
  tVentas("comun.avisoObservaciones", { cliente: aviso.clienteId });

/**
 * Lee la configuración y, solo si el aviso está activo, las observaciones del
 * cliente. Un fallo de lectura no debe estorbar al usuario: no hay aviso.
 */
export const buscarAvisoObservacionesCliente = async (
  clienteId: string | null | undefined,
  { getConfig, getObservaciones }: DependenciasAvisoObservacionesCliente
): Promise<AvisoObservacionesCliente | null> => {
  if (!esClienteRegistrado(clienteId)) return null;

  try {
    const config = await getConfig();
    if (!config.mostrarObservacionesCliente) return null;

    const observaciones = await getObservaciones(clienteId);
    return avisoObservacionesCliente(true, clienteId, observaciones);
  } catch {
    return null;
  }
};
