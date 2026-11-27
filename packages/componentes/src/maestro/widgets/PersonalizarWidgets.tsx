import { Filtro } from "@olula/lib/diseño.ts";
import { useEffect, useState } from "react";
import { QBoton } from "../../atomos/qboton.tsx";
import { QIcono } from "../../atomos/qicono.tsx";
import { QInput } from "../../atomos/qinput.tsx";
import { QSelect } from "../../atomos/qselect.tsx";

import { QModal } from "../../moleculas/qmodal.tsx";
import {
  ConfigWidgets,
  DefinicionWidget,
  FormatoWidget,
  OperacionWidget,
  RecursoAgregable,
  TipoWidget,
} from "./diseño.ts";
import {
  formatosWidget,
  MAX_WIDGETS,
  nuevoWidget,
  operacionesWidget,
  dimensionesAgrupables,
  pieWidget,
  tiposWidget,
} from "./dominio.ts";
import { getRecursosAgregables } from "./infraestructura.ts";
import "./PersonalizarWidgets.css";
import { useTotalesWidgets } from "./useTotalesWidgets.ts";
import { WidgetCompacto } from "./WidgetCompacto.tsx";
import { useTComponentes } from "../../i18n/textos.ts";

type PersonalizarWidgetsProps = {
  config: ConfigWidgets;
  widgets: DefinicionWidget[];
  filtro: Filtro | undefined;
  onGuardar: (widgets: DefinicionWidget[]) => Promise<void>;
  onRestaurar: () => Promise<void>;
  onCerrar: () => void;
};

/** Panel lateral para elegir qué totales se ven encima del listado. */
export const PersonalizarWidgets = ({
  config,
  widgets,
  filtro,
  onGuardar,
  onRestaurar,
  onCerrar,
}: PersonalizarWidgetsProps) => {
  const tx = useTComponentes();
  const [borrador, setBorrador] = useState(widgets);
  const [titulo, setTitulo] = useState("");
  const sinMedidas = config.campos.length === 0;
  const [operacion, setOperacion] = useState<OperacionWidget>(
    sinMedidas ? "conteo" : "suma"
  );
  const [campoId, setCampoId] = useState(config.campos[0]?.id ?? "");
  // El formato sale del campo; el usuario lo puede cambiar (en los maestros sin
  // widgets propios se deduce del nombre de la medida y puede no acertar).
  const [formatoElegido, setFormatoElegido] = useState<FormatoWidget>();
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [tipo, setTipo] = useState<TipoWidget>("tarjeta");
  const [agrupar, setAgrupar] = useState("");
  const [meta, setMeta] = useState("");
  const [dimensiones, setDimensiones] = useState<
    NonNullable<RecursoAgregable["dimensiones"]>
  >([]);

  // Las dimensiones del recurso (para agrupar), del registro que ya se pidió al abrir.
  useEffect(() => {
    let cancelado = false;
    getRecursosAgregables().then((recursos) => {
      if (cancelado) return;
      setDimensiones(recursos.find((r) => r.id === config.recurso)?.dimensiones ?? []);
    });
    return () => {
      cancelado = true;
    };
  }, [config.recurso]);

  const fechas = dimensiones.filter((d) => d.tipo === "fecha");
  const categorias = dimensionesAgrupables(dimensiones, config.recurso);
  const opcionesAgrupar = tipo === "temporal" ? fechas : categorias;
  const agruparValido = opcionesAgrupar.some((d) => d.id === agrupar)
    ? agrupar
    : opcionesAgrupar[0]?.id;
  const necesitaAgrupar = tipo === "temporal" || tipo === "circular" || tipo === "ranking";
  const metaValida = Number(meta.replace(",", ".")) || undefined;
  const incompleto =
    (necesitaAgrupar && !agruparValido) || (tipo === "objetivo" && !metaValida);
  const compacto = {
    tipo,
    agrupar: necesitaAgrupar ? agruparValido : undefined,
    meta: metaValida,
  };

  const campo = config.campos.find((c) => c.id === campoId);
  const formato = formatoElegido ?? campo?.formato ?? "numero";
  const propuesto = nuevoWidget(
    titulo || tx("ui.maestro.nuevoWidget"),
    operacion,
    campo,
    borrador,
    formato,
    compacto
  );
  const { valores, series, cargando } = useTotalesWidgets(
    { ...config, widgets: [propuesto] },
    filtro
  );

  const idsPorDefecto = new Set(config.widgets.map((w) => w.id));
  const lleno = borrador.length >= MAX_WIDGETS;

  const mover = (indice: number, desplazamiento: number) => {
    const destino = indice + desplazamiento;
    if (destino < 0 || destino >= borrador.length) return;
    const copia = [...borrador];
    [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
    setBorrador(copia);
  };

  const anadir = () => {
    if (!titulo.trim() || lleno || incompleto) return;
    setBorrador([
      ...borrador,
      nuevoWidget(titulo, operacion, campo, borrador, formato, compacto),
    ]);
    setTitulo("");
  };

  const ejecutar = async (accion: () => Promise<void>) => {
    setGuardando(true);
    setError(null);
    try {
      await accion();
      onCerrar();
    } catch {
      setError(tx("ui.maestro.noSeHaPodidoGuardarIntentalo"));
      setGuardando(false);
    }
  };

  return (
    <QModal
      nombre="personalizar-widgets"
      titulo={tx("ui.maestro.widgetsDeTitulo", { titulo: config.titulo })}
      abierto={true}
      onCerrar={onCerrar}
      pantallaCompletaMovil
    >
      <div className="personalizar-widgets">
        <p className="personalizar-widgets-ayuda">
          {tx("ui.maestro.seCalculanSobreLosFiltrosActivos")}
        </p>

        <section aria-labelledby="widgets-visibles">
          <h3 id="widgets-visibles">{tx("ui.maestro.visibles")}</h3>
          {borrador.length === 0 && (
            <p className="personalizar-widgets-vacio">
              {tx("ui.maestro.noHayWidgetsAnadeAlgunoAbajo")}
            </p>
          )}
          <ul className="personalizar-widgets-lista">
            {borrador.map((widget, indice) => (
              <li key={widget.id}>
                <div className="personalizar-widgets-texto">
                  <span className="titulo">{widget.titulo}</span>
                  <span className="descripcion">
                    {pieWidget(widget, config.campos)}
                    {widget.tipo && widget.tipo !== "tarjeta" &&
                      ` · ${tiposWidget.find((t) => t.valor === widget.tipo)?.descripcion}`}
                  </span>
                </div>
                {idsPorDefecto.has(widget.id) && (
                  <span className="personalizar-widgets-defecto">
                    {tx("ui.maestro.porDefecto")}
                  </span>
                )}
                <button
                  type="button"
                  aria-label={tx("ui.maestro.subirTitulo", { titulo: widget.titulo })}
                  disabled={indice === 0}
                  onClick={() => mover(indice, -1)}
                >
                  <QIcono nombre="arriba" tamaño="sm" />
                </button>
                <button
                  type="button"
                  aria-label={tx("ui.maestro.bajarTitulo", { titulo: widget.titulo })}
                  disabled={indice === borrador.length - 1}
                  onClick={() => mover(indice, 1)}
                >
                  <QIcono nombre="abajo" tamaño="sm" />
                </button>
                <button
                  type="button"
                  aria-label={tx("ui.maestro.quitarTitulo", { titulo: widget.titulo })}
                  onClick={() =>
                    setBorrador(borrador.filter((w) => w.id !== widget.id))
                  }
                >
                  <QIcono nombre="eliminar" tamaño="sm" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="widget-nuevo"
          className="personalizar-widgets-nuevo"
        >
          <h3 id="widget-nuevo">{tx("ui.maestro.nuevoWidget")}</h3>
          <QSelect
            label={tx("ui.maestro.tipo")}
            nombre="tipo_widget"
            valor={tipo}
            opciones={tiposWidget}
            onChange={(opcion) => opcion && setTipo(opcion.valor as TipoWidget)}
          />
          {necesitaAgrupar && (
            <QSelect
              label={tipo === "temporal" ? tx("ui.maestro.porMesesDe") : tx("ui.maestro.agruparPor")}
              nombre="agrupar_widget"
              valor={agruparValido ?? ""}
              placeholder={tx("ui.maestro.sinDimensionesDisponibles")}
              opciones={opcionesAgrupar.map((d) => ({
                valor: d.id,
                descripcion: d.descripcion,
              }))}
              onChange={(opcion) => opcion && setAgrupar(opcion.valor)}
            />
          )}
          {tipo === "objetivo" && (
            <QInput
              label={tx("ui.maestro.meta")}
              nombre="meta_widget"
              tipo="decimal"
              valor={meta}
              onChange={(valor) => setMeta(valor)}
            />
          )}
          <QInput
            label={tx("ui.maestro.titulo")}
            nombre="titulo_widget"
            valor={titulo}
            maxLength={60}
            onChange={(valor) => setTitulo(valor)}
          />
          <QSelect
            label={tx("ui.maestro.calculo")}
            nombre="operacion_widget"
            valor={operacion}
            opciones={
              sinMedidas
                ? operacionesWidget.filter((o) => o.valor === "conteo")
                : operacionesWidget
            }
            onChange={(opcion) =>
              opcion && setOperacion(opcion.valor as OperacionWidget)
            }
          />
          {operacion !== "conteo" && (
            <>
              <QSelect
                label={tx("ui.maestro.campo")}
                nombre="campo_widget"
                valor={campoId}
                opciones={config.campos.map((c) => ({
                  valor: c.id,
                  descripcion: c.etiqueta,
                }))}
                onChange={(opcion) => {
                  if (!opcion) return;
                  setCampoId(opcion.valor);
                  setFormatoElegido(undefined);
                }}
              />
              <QSelect
                label={tx("ui.maestro.formato")}
                nombre="formato_widget"
                valor={formato}
                opciones={formatosWidget}
                onChange={(opcion) =>
                  opcion && setFormatoElegido(opcion.valor as FormatoWidget)
                }
              />
            </>
          )}

          <div className="personalizar-widgets-previa">
            <span>{tx("ui.maestro.vistaPrevia")}</span>
            <WidgetCompacto
              widget={propuesto}
              valor={valores[propuesto.id]}
              puntos={series[propuesto.id] ?? []}
              pie={pieWidget(propuesto, config.campos)}
              cargando={cargando || incompleto}
            />
          </div>

          <QBoton
            variante="borde"
            deshabilitado={!titulo.trim() || lleno || incompleto}
            onClick={anadir}
          >
            {tx("ui.maestro.anadirAlPanel")}
          </QBoton>
          {lleno && (
            <p className="personalizar-widgets-vacio">
              {tx("ui.maestro.comoMaximoMaxWidgetsWidgets", { MAX_WIDGETS })}
            </p>
          )}
        </section>

        {error && (
          <p className="personalizar-widgets-error" role="alert">
            {error}
          </p>
        )}

        <footer className="personalizar-widgets-pie">
          <QBoton
            variante="texto"
            deshabilitado={guardando}
            onClick={() => ejecutar(onRestaurar)}
          >
            {tx("ui.maestro.restaurarPorDefecto")}
          </QBoton>
          <div>
            <QBoton variante="borde" onClick={onCerrar}>
              {tx("ui.maestro.cancelar")}
            </QBoton>
            <QBoton
              deshabilitado={guardando}
              onClick={() => ejecutar(() => onGuardar(borrador))}
            >
              {tx("ui.maestro.guardar")}
            </QBoton>
          </div>
        </footer>
      </div>
    </QModal>
  );
};
