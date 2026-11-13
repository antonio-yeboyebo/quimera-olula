import { moduloBloqueadoEnUrl, plugin } from "./dominio.ts";

export interface ElementoMenuBase {
    nombre: string;
    icono?: string;
    regla?: string | string[];
    /** Plugins que deben estar activos para mostrar la entrada (todos). */
    plugin?: string | string[];
    color?: string;
    variant?: string;
    posicion?: number;
}

export interface ElementoMenuPadre extends ElementoMenuBase {
    subelementos: ElementoMenuHijo[];
    /** Título visual bajo el que se agrupa en el menú (Comercial, Operaciones…).
     *  No es un nivel: solo ordena y rotula los grupos. */
    area?: string;
}

export interface ElementoMenuHijo extends ElementoMenuBase {
    url: string;
    descripcionIA?: string;
    parametrosIA?: Record<string, string>;
    /** Otras palabras con las que se busca la pantalla (búsqueda rápida). */
    alias?: string[];
}

export type ElementoMenu = ElementoMenuPadre | ElementoMenuHijo;

export type MenuContextFactory = { menu: ElementoMenu };

export const crearMenu = (factory: Record<string, MenuContextFactory>) => {
    const formatearNombre = (i: ElementoMenu) => ({ ...i, nombre: i.nombre.split('/').pop()?.trim() });
    const agruparPorNombre = (i: ElementoMenu) => i.nombre.split('/')[0];

    const factorias = Object.values(factory);
    const menus = factorias.map(v => (v as MenuContextFactory)?.menu).filter(Boolean).flat();
    const items = menus.map(m => Object.entries(m).map(([k, v]) => ({ nombre: k, ...v }))).flat();
    const itemsAgrupados = Object.entries(Object.groupBy(items, agruparPorNombre)).map(([k, v]) => ({ ...((v ?? []).filter(i => i.nombre === k)[0]), subelementos: (v ?? []).filter(i => i.nombre !== k).map(formatearNombre) }));

    itemsAgrupados.sort((a, b) => (a.posicion ?? Infinity) - (b.posicion ?? Infinity));

    return itemsAgrupados as ElementoMenu[];
};
/** Los plugins que pide la entrada están activos en esta instalación (whoami). */
export const pluginsActivos = (e: ElementoMenuBase): boolean =>
    !e.plugin || [e.plugin].flat().every((nombre) => plugin(nombre) === "activo");

/** SaaS: la entrada no es de un módulo que la empresa no tiene contratado. */
export const disponibleEnSaas = (e: ElementoMenuBase): boolean =>
    !("url" in e) || typeof e.url !== "string" || !moduloBloqueadoEnUrl(e.url);
