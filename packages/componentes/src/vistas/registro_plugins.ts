import { Entidad } from "@olula/lib/diseño.ts";
import { plugin as estadoPlugin } from "@olula/lib/dominio.ts";
import { MetaColumna, MetaTabla, obtenerCols } from "../atomos/qtablacontrolada.tsx";
import { AccionDefinida } from "../moleculas/acciones.ts";
import { valorColumna } from "../moleculas/valor_columna.tsx";

/**
 * Columnas y acciones que un plugin añade a pantallas que no son suyas. Se
 * registran al cargar el plugin (fuera de React) y solo aparecen si el plugin
 * está activo en la instalación (el mismo dato que filtra el menú). Los ids
 * llevan el prefijo `plugin.<nombre>.` para no chocar con los del código ni
 * entre plugins; así se guardan en la configuración del usuario.
 *
 *   registrarColumnas("ventas.pedido", "sga", [
 *     { id: "ubicacion", cabecera: "Ubicación" },            // oculta por defecto
 *     { id: "bultos", cabecera: "Bultos", oculta: false },   // visible
 *   ]);
 *   registrarAcciones("ventas.pedido", "detalle", "sga", (pedido) => [
 *     { id: "etiquetas", texto: "Etiquetas SGA", icono: "imprimir", onClick: () => ... },
 *   ]);
 */

type RegistroColumnas = { plugin: string; columnas: MetaColumna<Entidad>[] };
type FabricaAcciones = (contexto: unknown) => AccionDefinida[];
type RegistroAcciones = { plugin: string; fabrica: FabricaAcciones };

const columnas = new Map<string, RegistroColumnas[]>();
const acciones = new Map<string, RegistroAcciones[]>();

export const idDePlugin = (plugin: string, id: string) => `plugin.${plugin}.${id}`;

const activo = (plugin: string) => estadoPlugin(plugin) === "activo";

/** Columnas que el plugin añade a la tabla de `pantalla`. Ocultas salvo `oculta: false`. */
export const registrarColumnas = <T extends Entidad>(
  pantalla: string,
  plugin: string,
  nuevas: MetaColumna<T>[]
) => {
  const otras = (columnas.get(pantalla) ?? []).filter((r) => r.plugin !== plugin);
  columnas.set(pantalla, [
    ...otras,
    { plugin, columnas: nuevas as unknown as MetaColumna<Entidad>[] },
  ]);
};

/** Acciones que el plugin añade al grupo `grupo` de `pantalla`; reciben el contexto del grupo. */
export const registrarAcciones = <C>(
  pantalla: string,
  grupo: string,
  plugin: string,
  fabrica: (contexto: C) => AccionDefinida[]
) => {
  const clave = `${pantalla}:${grupo}`;
  const otras = (acciones.get(clave) ?? []).filter((r) => r.plugin !== plugin);
  acciones.set(clave, [...otras, { plugin, fabrica: fabrica as FabricaAcciones }]);
};

/** Para tests. */
export const olvidarRegistrosPlugins = () => {
  columnas.clear();
  acciones.clear();
};

/** Columnas de los plugins activos para `pantalla`, con id prefijado. */
export const columnasDePlugins = <T extends Entidad>(pantalla: string): MetaColumna<T>[] =>
  (columnas.get(pantalla) ?? [])
    .filter((r) => activo(r.plugin))
    .flatMap((r) =>
      r.columnas.map(
        (columna) =>
          ({
            ...columna,
            id: idDePlugin(r.plugin, columna.id),
            oculta: columna.oculta ?? true,
            // El id cambia, pero el valor sigue saliendo del campo original de
            // la entidad, con el formato de su tipo.
            render: columna.render ?? ((entidad: Entidad) => valorColumna(entidad, columna, "")),
          }) as unknown as MetaColumna<T>
      )
    );

/** La metaTabla del código con las columnas de los plugins activos al final. */
export const conColumnasDePlugins = <T extends Entidad>(
  metaTabla: MetaTabla<T> | undefined,
  pantalla: string | undefined
): MetaTabla<T> | undefined => {
  if (!metaTabla || !pantalla) return metaTabla;
  const extra = columnasDePlugins<T>(pantalla);
  if (!extra.length) return metaTabla;
  const cols = [...obtenerCols(metaTabla), ...extra];
  return Array.isArray(metaTabla) ? cols : { ...metaTabla, cols };
};

/** Acciones de los plugins activos para el grupo, con id prefijado. */
export const accionesDePlugins = (
  pantalla: string,
  grupo: string,
  contexto: unknown
): AccionDefinida[] =>
  (acciones.get(`${pantalla}:${grupo}`) ?? [])
    .filter((r) => activo(r.plugin))
    .flatMap((r) =>
      r.fabrica(contexto).map((accion) => ({
        ...accion,
        id: accion.id ? idDePlugin(r.plugin, accion.id) : undefined,
      }))
    );
