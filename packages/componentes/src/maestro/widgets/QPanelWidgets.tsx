import { useTComponentes } from "../../i18n/textos.ts";
import { QBoton } from "../../atomos/qboton.tsx";
import { QTarjetaResumen } from "../../atomos/qtarjeta_resumen.tsx";
import { CampoWidget, DefinicionWidget, SeriesWidgets, ValoresWidgets } from "./diseño.ts";
import { formatearValorWidget, pieWidget } from "./dominio.ts";
import "./QPanelWidgets.css";
import { WidgetCompacto } from "./WidgetCompacto.tsx";

/** Fila de totales encima del listado, calculados con el filtro activo. */
export const QPanelWidgets = ({
  widgets,
  campos = [],
  valores,
  series = {},
  cargando,
  onPersonalizar,
}: {
  widgets: DefinicionWidget[];
  campos?: CampoWidget[];
  valores: ValoresWidgets;
  series?: SeriesWidgets;
  cargando: boolean;
  onPersonalizar?: () => void;
}) => {
  const t = useTComponentes();
  return (
  <section
    className="panel-widgets"
    aria-labelledby="panel-widgets-titulo"
    data-vacio={widgets.length === 0 || undefined}
  >
    <header className="panel-widgets-cabecera">
      <h3 id="panel-widgets-titulo">
        {t("widgets.resumen")} <span>{t("widgets.segunFiltros")}</span>
      </h3>
      {onPersonalizar && (
        <QBoton variante="texto" tamaño="pequeño" onClick={onPersonalizar}>
          {widgets.length === 0 ? t("widgets.anadir") : t("widgets.personalizar")}
        </QBoton>
      )}
    </header>
    {widgets.length > 0 && (
      <div
        className="panel-widgets-rejilla"
        style={{ "--numero-widgets": widgets.length } as React.CSSProperties}
      >
        {widgets.map((widget) => {
          const valor = valores[widget.id];
          if ((widget.tipo ?? "tarjeta") !== "tarjeta") {
            return (
              <WidgetCompacto
                key={widget.id}
                widget={widget}
                valor={valor}
                puntos={series[widget.id] ?? []}
                pie={pieWidget(widget, campos)}
                cargando={cargando}
              />
            );
          }
          return (
            <QTarjetaResumen
              key={widget.id}
              titulo={widget.titulo}
              valor={formatearValorWidget(valor, widget)}
              pie={pieWidget(widget, campos)}
              cargando={cargando}
              aviso={
                valor === null
                  ? t("widgets.noDisponible")
                  : undefined
              }
            />
          );
        })}
      </div>
    )}
  </section>
  );
};
