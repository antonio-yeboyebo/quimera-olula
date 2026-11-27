import { Entidad, Filtro, Orden } from "@olula/lib/diseño.ts";
import { useEffect, useRef } from "react";
import {
  MetaColumna,
  MetaTabla,
  obtenerCols,
  PersonalizacionColumnas,
} from "../atomos/qtablacontrolada.tsx";
import { ConfigTarjeta, ConfigVista, ModoVista, SentidoOrden } from "./diseño.ts";
import {
  aplicarColumnas,
  aplicarTarjeta,
  configTablaDesdeVisibles,
  mismoOrden,
  moverColumna,
  ocultarColumna,
  sinListado,
  sinTarjeta,
} from "./dominio.ts";
import { guardarVistaUsuario } from "./infraestructura.ts";
import { usePreferenciasVista } from "./usePreferenciasVista.ts";
import { recargarVistasGuardadas } from "./useVistasGuardadas.ts";

const mismoFiltro = (a: Filtro | undefined, b: Filtro | undefined) =>
  JSON.stringify(a ?? []) === JSON.stringify(b ?? []);

const conColumnas = <T extends Entidad>(
  metaTabla: MetaTabla<T>,
  cols: MetaColumna<T>[]
): MetaTabla<T> =>
  Array.isArray(metaTabla) ? cols : { cols, expansion: metaTabla.expansion };

const sentido = (valor: string | undefined): SentidoOrden =>
  valor === "DESC" ? "DESC" : "ASC";

/**
 * Lo que la personalización aporta a un `Listado` con `pantalla`: columnas
 * visibles y en orden, menú de columna, selector de columnas, ordenación y modo
 * por defecto. Sin `pantalla` todo queda como lo da el código.
 */
export const useVistaListado = <T extends Entidad>({
  pantalla,
  vista = "",
  metaTabla,
  orden,
  ordenInicial,
  filtro,
  filtroInicial,
  onOrdenChanged,
  onVistaAplicada,
}: {
  pantalla?: string;
  /** Vista con nombre activa ('' = la de por defecto). */
  vista?: string;
  metaTabla?: MetaTabla<T>;
  /** Ordenación actual del listado. */
  orden: Orden;
  /** La que trae la pantalla (o la URL): si no se ha cambiado, manda la guardada. */
  ordenInicial: Orden;
  /** Filtro actual del listado y el de la pantalla. */
  filtro?: Filtro;
  filtroInicial?: Filtro;
  onOrdenChanged: (orden: Orden) => void;
  /** Al cambiar de vista: el filtro y el orden que trae. */
  onVistaAplicada?: (filtro: Filtro, orden: Orden) => void;
}) => {
  const preferencias = usePreferenciasVista(pantalla, vista);
  const { config, cargada, personalizable } = preferencias;

  const catalogo = metaTabla ? obtenerCols(metaTabla) : [];
  const columnasVisibles = aplicarColumnas(catalogo, config?.tabla);
  const visibles = columnasVisibles.map((columna) => columna.id);
  const ordenGuardado = config?.tabla?.orden;

  const guardar = (cambios: Partial<ConfigVista>) =>
    void preferencias.guardar({ ...config, ...cambios });

  const guardarVisibles = (ids: string[]) =>
    guardar({ tabla: configTablaDesdeVisibles(catalogo, ids, config?.tabla) });

  // La ordenación guardada se aplica una vez al cargar, si el usuario no ha
  // llegado con otra (enlace, URL).
  const ordenAplicado = useRef(false);
  useEffect(() => {
    if (!cargada || ordenAplicado.current) return;
    ordenAplicado.current = true;
    if (ordenGuardado && mismoOrden(orden, ordenInicial) && !mismoOrden(orden, ordenGuardado)) {
      onOrdenChanged(ordenGuardado);
    }
  }, [cargada, ordenGuardado, orden, ordenInicial, onOrdenChanged]);

  // Al cambiar de vista (ya cargada), su filtro y su orden pasan al listado;
  // al volver a la de por defecto, los de la pantalla.
  const vistaAplicada = useRef(vista);
  useEffect(() => {
    if (!cargada || vistaAplicada.current === vista) return;
    vistaAplicada.current = vista;
    ordenAplicado.current = true;
    onVistaAplicada?.(
      vista ? (config?.filtro ?? filtroInicial ?? []) : (filtroInicial ?? []),
      config?.tabla?.orden ?? ordenInicial
    );
  }, [cargada, vista, config, filtroInicial, ordenInicial, onVistaAplicada]);

  const configActual = (): ConfigVista => ({
    ...config,
    tabla: {
      ...(config?.tabla ?? configTablaDesdeVisibles(catalogo, visibles)),
      ...(orden.length > 0 ? { orden: [orden[0], sentido(orden[1])] } : {}),
    },
  });

  const personalizacion: PersonalizacionColumnas | undefined =
    personalizable && metaTabla
      ? {
          onOcultar: (id) => guardarVisibles(ocultarColumna(visibles, id)),
          onMover: (id, destino) => guardarVisibles(moverColumna(visibles, id, destino)),
          puedeOcultar: visibles.length > 1,
        }
      : undefined;

  return {
    /** La metaTabla con las columnas que ve el usuario (la del código sin pantalla). */
    metaTabla: metaTabla && pantalla ? conColumnas(metaTabla, columnasVisibles) : metaTabla,
    personalizacion,
    /** Props del selector de columnas, o undefined si no se puede personalizar. */
    selector: personalizacion
      ? {
          catalogo: catalogo.map(({ id, cabecera }) => ({ id, cabecera })),
          visibles,
          // Solo lo del listado: los botones del detalle van en la misma fila.
          personalizada:
            preferencias.origen === "usuario" &&
            !!(config?.tabla || config?.modo || config?.tarjeta),
          puedeGuardarOrden: orden.length > 0 && !mismoOrden(orden, ordenGuardado),
          onCambiar: guardarVisibles,
          onGuardarOrden: () =>
            guardar({
              tabla: {
                ...(config?.tabla ?? configTablaDesdeVisibles(catalogo, visibles)),
                orden: [orden[0], sentido(orden[1])],
              },
            }),
          onRestaurar: () =>
            void preferencias.quitar(sinListado(config)).catch(() => undefined),
        }
      : undefined,
    /** La empresa o el grupo han bloqueado la personalización de la pantalla. */
    bloqueada: preferencias.bloqueada,
    /** Vistas con nombre: guardar la actual como nueva, guardar el filtro en la activa y borrarla. */
    vistas: {
      personalizable,
      filtroCambiado: vista !== "" && !mismoFiltro(filtro, config?.filtro ?? filtroInicial),
      guardarComo: async (nombre: string, id: string, modo?: ModoVista) => {
        if (!pantalla) return;
        const actual = configActual();
        await guardarVistaUsuario(
          pantalla,
          {
            nombre,
            filtro: filtro ?? [],
            tabla: actual.tabla,
            ...(modo ? { modo } : {}),
            ...(actual.tarjeta ? { tarjeta: actual.tarjeta } : {}),
          },
          id
        );
        await recargarVistasGuardadas(pantalla);
      },
      guardarFiltro: () => preferencias.guardar({ ...config, filtro: filtro ?? [] }),
      /** Lo que se comparte: la vista tal como se ve ahora (con su filtro si tiene nombre). */
      paraCompartir: (nombre?: string): ConfigVista => ({
        ...configActual(),
        ...(vista ? { nombre: nombre ?? config?.nombre ?? vista, filtro: filtro ?? [] } : {}),
      }),
      /** Tras compartir o quitar: lo que ve el usuario puede haber cambiado. */
      recargar: async () => {
        await preferencias.recargar();
        if (pantalla) await recargarVistasGuardadas(pantalla);
      },
      borrar: async () => {
        if (!pantalla) return;
        await preferencias.restaurar();
        await recargarVistasGuardadas(pantalla);
      },
    },
    /** Plantilla de tarjeta del usuario (ya filtrada por el catálogo), si la hay. */
    tarjeta: cargada ? aplicarTarjeta(catalogo, config?.tarjeta) : undefined,
    /** Guarda la plantilla de tarjeta; `undefined` vuelve a la del código. */
    guardarTarjeta: (tarjeta: ConfigTarjeta | undefined) =>
      personalizable &&
      void (tarjeta
        ? preferencias.guardar({ ...config, tarjeta })
        : preferencias.quitar(sinTarjeta(config))
      ).catch(() => undefined),
    /** Modo guardado, cuando ya se sabe. */
    modoGuardado: cargada ? config?.modo : undefined,
    guardarModo: (modo: ModoVista) => personalizable && guardar({ modo }),
  };
};
