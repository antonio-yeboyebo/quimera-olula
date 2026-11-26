import { MetaModelo } from "@olula/lib/dominio.ts";
import { ClaseAlmacenamiento, NuevaClaseAlmacenamiento } from "./diseño.ts";
import { sinTexto } from "#/almacen/comun/dominio.ts";
import { tAlmacen } from "../i18n/index.ts";

type CamposClaseAlmacenamiento = Pick<NuevaClaseAlmacenamiento, "codigo" | "descripcion">;

/** Devuelve `true` si es válido o el mensaje del primer error. */
export const validarClaseAlmacenamiento = (m: CamposClaseAlmacenamiento): string | true => {
    if (sinTexto(m.codigo)) return tAlmacen("clase_almacenamiento.elCodigoEsObligatorio");
    if (m.codigo.length > 10) return tAlmacen("clase_almacenamiento.elCodigoAdmiteComoMaximo10");
    if (sinTexto(m.descripcion)) return tAlmacen("clase_almacenamiento.laDescripcionEsObligatoria");
    return true;
};

const camposClaseAlmacenamiento = {
    codigo: { requerido: true },
    descripcion: { requerido: true },
};

export const claseAlmacenamientoVacia = (): ClaseAlmacenamiento => ({
    id: "",
    codigo: "",
    descripcion: "",
});

/** Constante estable (no función) para el formulario de alta. */
export const nuevaClaseAlmacenamientoVacia: NuevaClaseAlmacenamiento = {
    codigo: "",
    descripcion: "",
};

export const metaClaseAlmacenamiento: MetaModelo<ClaseAlmacenamiento> = {
    campos: camposClaseAlmacenamiento,
    validacion: validarClaseAlmacenamiento,
};

export const metaNuevaClaseAlmacenamiento: MetaModelo<NuevaClaseAlmacenamiento> = {
    campos: camposClaseAlmacenamiento,
    validacion: validarClaseAlmacenamiento,
};
