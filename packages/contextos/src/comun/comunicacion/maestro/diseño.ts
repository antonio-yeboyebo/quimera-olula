import { MetaTabla } from "@olula/componentes/index.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Comunicacion } from "../diseño.ts";
import { tComun } from "../../i18n/index.ts";

export type EstadoMaestroComunicacion = "INICIAL" | "CREANDO_COMUNICACION";

export type ContextoMaestroComunicacion = {
    estado: EstadoMaestroComunicacion;
    comunicaciones: ListaActivaEntidades<Comunicacion>;
};

export const metaTablaComunicacion: MetaTabla<Comunicacion> = [
    { id: "asunto", get cabecera() { return tComun("comunicacion.asunto"); } },
    { id: "fechaEnvio", get cabecera() { return tComun("comunicacion.enviada"); }, tipo: "fechahora" },
];
