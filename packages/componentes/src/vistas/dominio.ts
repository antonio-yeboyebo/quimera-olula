import {
  AccionCatalogo,
  ColumnaCatalogo,
  ConfigTabla,
  ConfigTarjeta,
  ConfigVista,
  ModoVista,
  SentidoOrden,
} from "./diseño.ts";

/**
 * Pone cada elemento nuevo (del catálogo, sin posición guardada) detrás del
 * elemento que le precede en el catálogo y ya está colocado; si no hay
 * ninguno, al principio. Así una columna nueva aparece donde la puso el código.
 */
const insertarNuevos = (
  colocados: string[],
  catalogo: string[],
  nuevos: Set<string>
): string[] =>
  catalogo.reduce((resultado, id, posicion) => {
    if (!nuevos.has(id)) return resultado;
    const anterior = catalogo
      .slice(0, posicion)
      .reverse()
      .find((previo) => resultado.includes(previo));
    const indice = anterior === undefined ? 0 : resultado.indexOf(anterior) + 1;
    return [...resultado.slice(0, indice), id, ...resultado.slice(indice)];
  }, colocados);

/**
 * Columnas visibles y en orden según la configuración. Los ids que ya no están
 * en el catálogo se ignoran; las columnas nuevas salen según `oculta`. Sin
 * configuración, las del catálogo que no son ocultas.
 */
export const aplicarColumnas = <C extends ColumnaCatalogo>(
  catalogo: C[],
  config?: ConfigTabla
): C[] => {
  const porId = new Map(catalogo.map((columna) => [columna.id, columna]));
  if (!config) return catalogo.filter((columna) => !columna.oculta);

  const conocidas = new Set([...config.columnas, ...(config.ocultas ?? [])]);
  const visibles = config.columnas.filter((id) => porId.has(id));
  const nuevas = new Set(
    catalogo
      .filter((columna) => !conocidas.has(columna.id) && !columna.oculta)
      .map((columna) => columna.id)
  );

  return insertarNuevos(visibles, catalogo.map((columna) => columna.id), nuevas)
    .map((id) => porId.get(id))
    .filter((columna): columna is C => columna !== undefined);
};

/**
 * Configuración de tabla que resulta de dejar `visibles` (en ese orden): el
 * resto del catálogo pasa a ocultas. Conserva la ordenación guardada.
 */
export const configTablaDesdeVisibles = (
  catalogo: ColumnaCatalogo[],
  visibles: string[],
  anterior?: ConfigTabla
): ConfigTabla => {
  const ids = new Set(catalogo.map((columna) => columna.id));
  const columnas = visibles.filter((id) => ids.has(id));
  const elegidas = new Set(columnas);
  return {
    columnas,
    ocultas: catalogo.map((columna) => columna.id).filter((id) => !elegidas.has(id)),
    ...(anterior?.orden ? { orden: anterior.orden } : {}),
  };
};

export type RepartoAcciones<A> = { botones: A[]; menu: A[] };

/**
 * Qué acciones salen como botón y cuáles en el desplegable. Con `destacadas`
 * (las que eligió el usuario, en su orden) salen esas, aunque estén
 * deshabilitadas, para que no cambien de sitio según el estado; las que no
 * tienen id o son nuevas van al desplegable en el orden del código. Sin
 * configuración manda el código (`principal`).
 */
export const repartirAcciones = <A extends AccionCatalogo>(
  acciones: A[],
  destacadas: string[] | undefined,
  principal: (acciones: A[]) => A | undefined
): RepartoAcciones<A> => {
  const botones = destacadas
    ? destacadas
        .map((id) => acciones.find((accion) => accion.id === id))
        .filter((accion): accion is A => accion !== undefined)
    : [principal(acciones)].filter((accion): accion is A => accion !== undefined);
  return { botones, menu: acciones.filter((accion) => !botones.includes(accion)) };
};

/** Los botones que no caben pasan, en su orden, al principio del desplegable. */
export const desbordarAcciones = <A>(
  { botones, menu }: RepartoAcciones<A>,
  caben: number
): RepartoAcciones<A> => ({
  botones: botones.slice(0, Math.max(0, caben)),
  menu: [...botones.slice(Math.max(0, caben)), ...menu],
});

/**
 * Cuántos botones caben en `ancho`, dados sus anchos, el hueco entre ellos y el
 * del botón del desplegable (que solo se reserva si queda algo en él).
 */
export const botonesQueCaben = (
  anchos: number[],
  ancho: number,
  hueco: number,
  anchoDesplegable: number,
  hayMenu: boolean
): number => {
  const ocupado = (n: number) =>
    anchos.slice(0, n).reduce((total, a) => total + a, 0) + hueco * Math.max(0, n - 1);
  for (let n = anchos.length; n > 0; n--) {
    const conMenu = hayMenu || n < anchos.length;
    if (ocupado(n) + (conMenu ? hueco + anchoDesplegable : 0) <= ancho) return n;
  }
  return 0;
};

/** Campos de la tarjeta además de título, subtítulo y etiqueta (lo valida también el servidor). */
export const MAXIMO_CAMPOS_TARJETA = 3;

/** Huecos de la tarjeta sin los ids que ya no existen en el catálogo;
 *  `undefined` si no queda ninguno (se usa la tarjeta del código). */
export const aplicarTarjeta = (
  catalogo: ColumnaCatalogo[],
  config?: ConfigTarjeta
): ConfigTarjeta | undefined => {
  if (!config) return undefined;
  const ids = new Set(catalogo.map((columna) => columna.id));
  const valido = (id?: string) => (id && ids.has(id) ? id : undefined);
  const tarjeta = {
    titulo: valido(config.titulo),
    subtitulo: valido(config.subtitulo),
    etiqueta: valido(config.etiqueta),
    campos: config.campos.filter((id) => ids.has(id)).slice(0, MAXIMO_CAMPOS_TARJETA),
  };
  const vacia =
    !tarjeta.titulo && !tarjeta.subtitulo && !tarjeta.etiqueta && !tarjeta.campos.length;
  return vacia ? undefined : tarjeta;
};

/** La configuración sin la tarjeta; `undefined` si no queda nada. */
export const sinTarjeta = (config?: ConfigVista): ConfigVista | undefined => {
  const resto = { ...config };
  delete resto.tarjeta;
  return vacia(resto) ? undefined : resto;
};

/** Ordenación por defecto guardada, o la que da el código. */
export const ordenPorDefecto = (
  config: ConfigVista | undefined,
  porCodigo?: [string, SentidoOrden]
): [string, SentidoOrden] | undefined => config?.tabla?.orden ?? porCodigo;

/** Modo guardado si la pantalla lo admite; si no, el que da el código. */
export const modoDeVista = (
  config: ConfigVista | undefined,
  disponibles: ModoVista[],
  porCodigo?: ModoVista
): ModoVista | undefined =>
  config?.modo && disponibles.includes(config.modo) ? config.modo : porCodigo;

/** `ids` con `id` movido a la posición que ocupa `destino`. */
export const moverColumna = (ids: string[], id: string, destino: string): string[] => {
  if (id === destino || !ids.includes(id) || !ids.includes(destino)) return ids;
  const sin = ids.filter((otro) => otro !== id);
  const indice = ids.indexOf(destino);
  return [...sin.slice(0, indice), id, ...sin.slice(indice)];
};

/** `ids` con `id` una posición antes (-1) o después (+1). */
export const desplazarColumna = (ids: string[], id: string, paso: -1 | 1): string[] => {
  const indice = ids.indexOf(id);
  const destino = ids[indice + paso];
  return indice < 0 || destino === undefined ? ids : moverColumna(ids, id, destino);
};

/** Quita `id` de las visibles; la última visible no se puede ocultar. */
export const ocultarColumna = (ids: string[], id: string): string[] =>
  ids.length <= 1 ? ids : ids.filter((otro) => otro !== id);

/** Las ordenaciones son iguales (campo y sentido). */
export const mismoOrden = (a?: string[], b?: string[]): boolean =>
  !!a && !!b && a[0] === b[0] && (a[1] ?? "ASC") === (b[1] ?? "ASC");

const vacia = (config: ConfigVista): boolean =>
  !config.modo && !config.tabla && !config.tarjeta && !Object.keys(config.acciones ?? {}).length;

/**
 * La configuración sin lo que es del listado (columnas, orden, modo, tarjeta):
 * restaurar el listado no debe borrar los botones elegidos en el detalle, que
 * se guardan en la misma fila. `undefined` si no queda nada (se borra la fila).
 */
export const sinListado = (config?: ConfigVista): ConfigVista | undefined => {
  const resto = { ...config };
  delete resto.modo;
  delete resto.tabla;
  delete resto.tarjeta;
  return vacia(resto) ? undefined : resto;
};

/** La configuración sin un grupo de acciones; `undefined` si no queda nada. */
export const sinGrupoAcciones = (
  config: ConfigVista | undefined,
  grupo: string
): ConfigVista | undefined => {
  const acciones = { ...config?.acciones };
  delete acciones[grupo];
  const resto: ConfigVista = { ...config, acciones };
  if (!Object.keys(acciones).length) delete resto.acciones;
  return vacia(resto) ? undefined : resto;
};

/**
 * Id de una vista con nombre a partir del nombre visible: minúsculas sin
 * acentos, dígitos y «_» (lo que admite el servidor, ≤60), sin repetir uno de
 * `existentes` (añade _2, _3...).
 */
export const idDeVista = (nombre: string, existentes: string[]): string => {
  const base =
    nombre
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 50) || "vista";
  const usados = new Set(existentes);
  if (!usados.has(base)) return base;
  let n = 2;
  while (usados.has(`${base}_${n}`)) n++;
  return `${base}_${n}`;
};
