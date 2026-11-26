import { localeActual } from "@olula/lib/i18n/i18n.ts";
import { useTComponentes } from "../../i18n/textos.ts";
import { ClausulaFiltro, Entidad, TipoInput } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { QBoton } from "../../atomos/qboton.tsx";
import { QCheckbox } from "../../atomos/qcheckbox.tsx";
import { QDateInterval } from "../../atomos/qdateinterval.tsx";
import { QIcono } from "../../atomos/qicono.tsx";
import { QInput } from "../../atomos/qinput.tsx";
import { QMonthYear } from "../../atomos/qmonthyear.tsx";
import { Opcion, QMultiCheckbox } from "../../atomos/qmulticheckbox.tsx";
import { QNumberInterval } from "../../atomos/qnumberinterval.tsx";
import { MetaTabla, obtenerCols } from "../../atomos/qtablacontrolada.tsx";
import { campoAncho, chipsFiltro, ordenarCamposPanel } from "./dominio.ts";
import "./MaestroFiltrosActivoControlado.css";

export const filtroTextos = (id: string, valor: unknown) => {
  return [id, "~", valor as string] as ClausulaFiltro;
};

export const filtroBooleanos = (id: string, valor: unknown) => {
  return [id, "=", valor as string] as ClausulaFiltro;
};

const fechaLocalStr = (fecha: Date): string => {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const filtroFechas = (
  id: string,
  valor: unknown
): ClausulaFiltro | null => {
  if (!Array.isArray(valor)) return [id, "=", valor] as ClausulaFiltro;

  const [desde, hasta] = valor as [Date, Date];

  if (!desde && !hasta) return null;

  const operador =
    !!desde && !hasta
      ? ">="
      : !!hasta && !desde
        ? "<="
        : !!desde && !!hasta
          ? "<>"
          : "";

  return [
    id,
    operador,
    [
      desde ? fechaLocalStr(desde) : undefined,
      hasta ? fechaLocalStr(hasta) : undefined,
    ].join("_"),
  ] as ClausulaFiltro;
};

export const filtroNumeros = (
  id: string,
  valor: unknown
): ClausulaFiltro | null => {
  const [desde, hasta] = valor as [number, number];

  const hayDesde = desde !== undefined && desde !== null && !isNaN(desde);
  const hayHasta = hasta !== undefined && hasta !== null && !isNaN(hasta);

  if (!hayDesde && !hayHasta) return null;

  const operador =
    hayDesde && !hayHasta
      ? ">="
      : hayHasta && !hayDesde
        ? "<="
        : hayDesde && hayHasta
          ? "<>"
          : "";

  return [
    id,
    operador,
    [hayDesde ? desde : undefined, hayHasta ? hasta : undefined].join("_"),
  ] as ClausulaFiltro;
};

export const filtroMesAnyoConManual = (
  id: string,
  valor: unknown
): ClausulaFiltro | null => {
  if (Array.isArray(valor)) {
    const [desde, hasta] = valor as [string, string];
    if (!desde && !hasta) return null;
    const operador = desde && hasta ? "<>" : desde ? ">=" : "<=";
    return [
      id,
      operador,
      [desde, hasta].filter(Boolean).join("_"),
    ] as ClausulaFiltro;
  }
  return filtroMesAnyo(id, valor);
};

export const filtroMesAnyo = (
  id: string,
  valor: unknown
): ClausulaFiltro | null => {
  if (!valor || typeof valor !== "string") return null;
  const [anyo, mes] = valor.split("-").map(Number);
  if (!anyo || !mes) return null;
  // toISOString() usa UTC y en zonas horarias positivas adelanta el día 1 al día anterior.
  // Construimos las cadenas directamente con valores locales.
  const mesStr = String(mes).padStart(2, "0");
  const ultimoDia = new Date(anyo, mes, 0).getDate(); // día 0 del mes siguiente = último del mes
  const desde = `${anyo}-${mesStr}-01`;
  const hasta = `${anyo}-${mesStr}-${String(ultimoDia).padStart(2, "0")}`;
  return [id, "<>", `${desde}_${hasta}`];
};

export type MetaCampoFiltro = {
  id: string;
  /** Nombre del campo en la API (snake_case). Si difiere de `id`, permite la hidratación
   * automática desde URL sin necesidad de declarar `fromFiltro`. */
  campo?: string;
  label: string;
  tipo?: TipoInput;
  opciones?: Opcion[];
  valorDefecto?: unknown;
  filtro: (v: unknown) => ClausulaFiltro | null;
  /** Solo necesario cuando la inversa es no trivial (ej: rango de fechas → mes/año).
   * Para renombrados simples (id ≠ campo API) basta con declarar `campo`. */
  fromFiltro?: (filtro: ClausulaFiltro[]) => unknown;
  render?: (valor: unknown, onChange: (v: unknown) => void) => ReactNode;
  /** Texto del chip cuando el valor no se lee solo (p. ej. un código de cliente). */
  describir?: (valor: unknown) => string;
};

export type MetaFiltro = Record<string, MetaCampoFiltro>;

type OpcionesMetaFiltroDefecto = {
  /** Nombre del campo en la API cuando difiere del id de la columna (p. ej. los
   *  módulos con modelo en camelCase y API en snake_case: `camelASnake`). */
  campoApi?: (id: string) => string;
};

export const getMetaFiltroDefecto = <T extends Entidad>(
  metaTabla: MetaTabla<T>,
  { campoApi = (id) => id }: OpcionesMetaFiltroDefecto = {}
): MetaFiltro => {
  const campos: Record<string, MetaCampoFiltro> = {};

  for (const columna of obtenerCols(metaTabla)) {
    if (columna.id === "id") continue;
    const campo = campoApi(columna.id);
    const base = { id: columna.id, campo, label: columna.cabecera };

    switch (columna.tipo) {
      case "booleano":
        campos[columna.id] = {
          ...base,
          tipo: "checkbox",
          filtro: (valor) => filtroBooleanos(campo, valor),
        };
        break;
      case "fecha":
      case "fechahora":
      case "hora":
        campos[columna.id] = {
          ...base,
          tipo: "intervalo_fechas",
          filtro: (valor) => filtroFechas(campo, valor),
        };
        break;
      case "numero":
      case "moneda":
        campos[columna.id] = {
          ...base,
          tipo: "intervalo_numeros",
          filtro: (valor) => filtroNumeros(campo, valor),
        };
        break;
      default:
        campos[columna.id] = {
          ...base,
          tipo: "texto",
          filtro: (valor) => filtroTextos(campo, valor),
        };
        break;
    }
  }

  return campos;
};

export const filtroToValores = (filtro: ClausulaFiltro[], meta: MetaFiltro) => {
  const valores: Record<string, unknown> = {};

  for (const [id, campo] of Object.entries(meta)) {
    if (campo.valorDefecto !== undefined) valores[id] = campo.valorDefecto;
  }

  // Mapa inverso: nombre del campo API → id en MetaFiltro.
  // Permite hidratar campos cuyo id de dominio difiere del campo en la cláusula API
  // (ej. "empleadoId" → "empleado_id") sin necesidad de declarar fromFiltro.
  const campoApiAId: Record<string, string> = {};
  for (const [id, defCampo] of Object.entries(meta)) {
    campoApiAId[defCampo.campo ?? id] = id;
  }

  for (const clausula of filtro) {
    const [campoApi, operador, valor] = clausula;
    const id = campoApiAId[campoApi] ?? campoApi;

    if (!meta[id]) continue;

    if (valor?.includes("_")) valores[id] = valor.split("_");
    else valores[id] = valor;

    const valor_final = valores[id];

    switch (meta[id].tipo) {
      case "intervalo_fechas": {
        if (!Array.isArray(valor_final)) break;
        valores[id] = (valor_final as [string, string])?.map((f: string) =>
          f ? new Date(Date.parse(f)) : undefined
        );
        break;
      }
      case "intervalo_numeros":
        valores[id] = (valor_final as [string, string])?.map((f: string) =>
          f ? parseFloat(f) : undefined
        );
        break;
      case "multiseleccion":
        {
          const valoresSeleccionados = Array.isArray(valor_final)
            ? valor_final.map(String)
            : typeof valor_final === "string"
              ? valor_final
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean)
              : valor_final === undefined || valor_final === null
                ? []
                : [String(valor_final)];

          if (operador === "!in") {
            const opciones = (meta[id].opciones ?? []).map((o) => o.valor);
            valores[id] = opciones.length
              ? opciones.filter(
                  (opcion) => !valoresSeleccionados.includes(opcion)
                )
              : valoresSeleccionados;
          } else {
            valores[id] = valoresSeleccionados;
          }
        }
        break;
      case "fecha":
        valores[id] = new Date(Date.parse(valor_final as string));
        break;
    }

    if ((meta[id].tipo as string) === "mes_año" && Array.isArray(valor_final)) {
      const [desde, hasta] = valor_final as [string, string];
      if (desde && hasta) {
        const [anyo, mes] = desde.split("-").map(Number);
        if (anyo && mes) {
          const ultimoDia = new Date(anyo, mes, 0).getDate();
          const esperadoDesde = `${anyo}-${String(mes).padStart(2, "0")}-01`;
          const esperadoHasta = `${anyo}-${String(mes).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
          if (desde === esperadoDesde && hasta === esperadoHasta) {
            valores[id] = desde.slice(0, 7);
          }
        }
      }
    }
  }

  // fromFiltro: solo para inversas no triviales (ej. rango → mes/año)
  for (const [id, defCampo] of Object.entries(meta)) {
    if (defCampo.fromFiltro) valores[id] = defCampo.fromFiltro(filtro);
  }

  return valores;
};

type MaestroFiltrosActivoControladoProps = {
  metaFiltro: MetaFiltro;
  filtroInicial: ClausulaFiltro[];
  filtro: ClausulaFiltro[];
  onFiltroChanged: (filtro: ClausulaFiltro[]) => void;
  /** Recuento con el filtro del panel antes de aplicarlo («Aplicar · 12»). */
  contar?: (filtro: ClausulaFiltro[]) => Promise<number | null>;
};

const ESPERA_RECUENTO_MS = 300;

/**
 * Filtros del listado: botón «Filtros» con contador y los activos como chips (con
 * × para quitarlos) en la propia cabecera; el botón abre un panel flotante (en
 * móvil, una hoja inferior) que se aplica de una vez, con el recuento a la vista.
 */
export const MaestroFiltrosActivoControlado = ({
  metaFiltro,
  filtroInicial,
  filtro,
  onFiltroChanged,
  contar,
}: MaestroFiltrosActivoControladoProps) => {
  const t = useTComponentes();
  const valoresAplicados = useMemo(
    () => filtroToValores(filtro, metaFiltro),
    [filtro, metaFiltro]
  );

  const valores = useModelo({ campos: metaFiltro }, valoresAplicados);
  const { modelo, uiProps, init } = valores;

  const [abierto, setAbierto] = useState(false);
  const [recuento, setRecuento] = useState<number | null>(null);
  const refContenedor = useRef<HTMLDivElement>(null);

  const buildFiltros = (modeloOverride: Record<string, unknown>) => {
    return Object.entries(modeloOverride).flatMap(([id, valor]) => {
      if (!metaFiltro[id]) return [];
      if (valor === undefined || valor === null) return [];
      const clausula = metaFiltro[id].filtro(valor);
      return clausula ? [clausula] : [];
    });
  };

  const borrador = abierto ? buildFiltros(modelo) : null;
  const claveBorrador = JSON.stringify(borrador);

  // Recuento del borrador (con espera) para el botón Aplicar.
  useEffect(() => {
    if (!borrador || !contar) return;
    let cancelado = false;
    const temporizador = setTimeout(() => {
      contar(borrador)
        .then((n) => !cancelado && setRecuento(n))
        .catch(() => !cancelado && setRecuento(null));
    }, ESPERA_RECUENTO_MS);
    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveBorrador]);

  const abrir = () => {
    init(valoresAplicados);
    setRecuento(null);
    setAbierto(true);
  };

  const cancelar = () => setAbierto(false);

  // Esc o clic fuera del panel descartan el borrador.
  useEffect(() => {
    if (!abierto) return;
    const alPulsarTecla = (e: KeyboardEvent) => e.key === "Escape" && cancelar();
    const alPulsarFuera = (e: MouseEvent) => {
      if (!refContenedor.current?.contains(e.target as Node)) cancelar();
    };
    document.addEventListener("keydown", alPulsarTecla);
    document.addEventListener("mousedown", alPulsarFuera);
    return () => {
      document.removeEventListener("keydown", alPulsarTecla);
      document.removeEventListener("mousedown", alPulsarFuera);
    };
  }, [abierto]);

  const aplicar = () => {
    onFiltroChanged(buildFiltros(modelo));
    setAbierto(false);
  };

  const limpiarTodo = () => {
    const iniciales = filtroToValores(filtroInicial, metaFiltro);
    init(iniciales);
    if (!abierto) onFiltroChanged(filtroInicial);
  };

  const quitar = (id: string) => {
    const siguiente = { ...valoresAplicados, [id]: metaFiltro[id]?.valorDefecto };
    onFiltroChanged(buildFiltros(siguiente));
  };

  const renderInput = (campo: MetaCampoFiltro) => {
    if (campo.render) {
      const { valor, onChange: onChangeProp } = uiProps(campo.id);
      const onChange = onChangeProp as (v: unknown) => void;
      return campo.render(valor, onChange);
    }
    // Extraemos `tipo` del spread: en el contexto de filtros ese campo decide
    // qué renderizador usar, pero no debe fluir hacia los componentes de UI
    // individuales (que tienen sus propios subtipos para ese prop).
    const { tipo: _, ...uiPropsBase } = uiProps(campo.id);
    // "mes_año" es un tipo de filtro propio, no parte de TipoInput (form inputs).
    // El cast es necesario porque MetaCampoFiltro.tipo es TipoInput en tiempo de tipos.
    if ((campo.tipo as string) === "mes_año") {
      return <QMonthYear {...uiPropsBase} label={campo.label} />;
    }
    switch (campo.tipo) {
      case "intervalo_fechas":
        return (
          <QDateInterval {...uiPropsBase} tipo={"fecha"} label={campo.label} />
        );
      case "intervalo_numeros":
        return (
          <QNumberInterval {...uiPropsBase} tipo={"numero"} label={campo.label} />
        );
      case "multiseleccion":
        return (
          <QMultiCheckbox
            {...uiPropsBase}
            opciones={campo.opciones as Opcion[]}
            label={campo.label}
          />
        );
      case "checkbox":
        return <QCheckbox {...uiPropsBase} label={campo.label} />;
      default:
        return <QInput {...uiPropsBase} label={campo.label} />;
    }
  };

  if (!Object.keys(metaFiltro).length) return;

  const chips = chipsFiltro(filtro, filtroInicial, metaFiltro, valoresAplicados);
  const activos = chips.filter((chip) => chip.quitable).length;
  const textoAplicar =
    recuento === null
      ? t("filtros.aplicar")
      : t("filtros.aplicarRecuento", { recuento: recuento.toLocaleString(localeActual()) });

  return (
    <div className="MaestroFiltrosControlado" ref={refContenedor}>
      <button
        type="button"
        className="filtros-boton"
        aria-expanded={abierto}
        aria-haspopup="dialog"
        onClick={abierto ? cancelar : abrir}
      >
        <QIcono nombre="filtro" tamaño="sm" />
        {t("filtros.filtros")}
        {activos > 0 && <span className="filtros-contador">{activos}</span>}
      </button>

      {chips.length > 0 && (
        <ul className="filtros-chips" aria-label={t("filtros.activos")}>
          {chips.map((chip) => (
            <li key={chip.id} className="filtros-chip" title={`${chip.etiqueta}: ${chip.texto}`}>
              <span className="filtros-chip-etiqueta">{chip.etiqueta}</span>
              <span className="filtros-chip-texto">{chip.texto}</span>
              {chip.quitable && (
                <button
                  type="button"
                  aria-label={t("filtros.quitar", { etiqueta: chip.etiqueta })}
                  onClick={() => quitar(chip.id)}
                >
                  ×
                </button>
              )}
            </li>
          ))}
          {activos > 0 && (
            <li>
              <button type="button" className="filtros-limpiar" onClick={limpiarTodo}>
                {t("filtros.limpiar")}
              </button>
            </li>
          )}
        </ul>
      )}

      {abierto && (
        <>
          <div className="filtros-fondo" onClick={cancelar} />
          <div className="filtros-panel" role="dialog" aria-label={t("filtros.filtros")}>
            <header className="filtros-panel-cabecera">
              <span>{t("filtros.filtros")}</span>
              <button type="button" onClick={cancelar} aria-label={t("filtros.cerrar")}>
                <QIcono nombre="cerrar" tamaño="sm" />
              </button>
            </header>
            <quimera-formulario>
              {ordenarCamposPanel(metaFiltro).map((campo) => (
                <div
                  key={campo.id}
                  className="campo-filtro"
                  data-ancho={campoAncho(campo) || undefined}
                >
                  {renderInput(campo)}
                </div>
              ))}
            </quimera-formulario>
            <footer>
              <button type="button" className="filtros-limpiar" onClick={limpiarTodo}>
                {t("filtros.limpiarTodo")}
              </button>
              <span className="filtros-panel-hueco" />
              <QBoton variante="borde" onClick={cancelar}>
                {t("comun.cancelar")}
              </QBoton>
              <QBoton onClick={aplicar}>
                {textoAplicar}
              </QBoton>
            </footer>
          </div>
        </>
      )}
    </div>
  );
};
