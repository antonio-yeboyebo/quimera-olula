import { ConfigVentas, SiNoPreguntar } from "./diseño.ts";
import { tVentas } from "../i18n/index.ts";

/** Los valores por defecto del escritorio (facturac_general.mtd). */
export const configVentasPorDefecto: ConfigVentas = {
    mostrarObservacionesCliente: false,
    facturarAlbaranesBorrador: "Si",
    crearFacturasBorrador: "Si",
    correoCopias: "",
};

/** Opciones con la descripción en el idioma activo (el valor es el que guarda el servidor). */
export const opcionesSiNoPreguntar = (): { valor: SiNoPreguntar; descripcion: string }[] =>
    (["Si", "No", "Preguntar"] as const).map((valor) => ({ valor, descripcion: tVentas(`config.opciones.${valor}`) }));

/** Vacía vale (no se envía copia); si hay algo, tiene que parecer un correo. */
export const correoCopiasValido = (correo: string): boolean =>
    !correo.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
