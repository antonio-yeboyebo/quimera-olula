import { QAvatar, QEtiqueta, QIcono } from "@olula/componentes/index.js";
import { formatearFechaDate, formatearMoneda } from "@olula/lib/dominio.js";
import {
  claseImportePorImporte,
  claseProbabilidadOportunidad,
  getConfigVisualOportunidad,
} from "../comun/config_visual.ts";
import { OportunidadVenta } from "../diseño.ts";
import "./TarjetaOportunidadVentaKanban.css";
import { tCrm } from "../../i18n/index.ts";

type EstadoVencimiento = {
  clase: "vencida" | "hoy" | "manana" | "proxima" | "normal";
  texto: string;
};

const getEstadoVencimiento = (
  fechaCierre: Date | null | undefined
): EstadoVencimiento | null => {
  if (!fechaCierre) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const cierre = new Date(fechaCierre);
  cierre.setHours(0, 0, 0, 0);

  const dias = Math.floor(
    (cierre.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (dias < 0) {
    const diasVencida = Math.abs(dias);
    return {
      clase: "vencida",
      texto: tCrm("oportunidadventa.vencidaHace", { count: diasVencida }),
    };
  }

  if (dias === 0) return { clase: "hoy", texto: tCrm("oportunidadventa.venceHoy") };
  if (dias === 1) return { clase: "manana", texto: tCrm("oportunidadventa.venceManana") };
  if (dias <= getConfigVisualOportunidad().diasVencePronto) {
    return { clase: "proxima", texto: tCrm("oportunidadventa.venceEnDiasDias", { dias }) };
  }

  return { clase: "normal", texto: tCrm("oportunidadventa.venceEnDiasDias", { dias }) };
};

export const TarjetaOportunidadVentaKanban = (
  oportunidad: OportunidadVenta
) => {
  const probabilidad = oportunidad.probabilidad ?? 0;
  const importe = oportunidad.importe ?? 0;
  const estadoVencimiento = getEstadoVencimiento(oportunidad.fecha_cierre);
  const accionesPendientes = oportunidad.acciones_pendientes;
  const tieneAccionesPendientes =
    typeof accionesPendientes === "number" && accionesPendientes > 0;
  const personaPrincipal =
    oportunidad.nombre_contacto || oportunidad.nombre_cliente || "-";

  return (
    <article className="TarjetaOportunidadVentaKanban">
      <div className="tarjeta-kanban-titulo">
        {oportunidad.descripcion || "-"}
      </div>

      <header className="tarjeta-kanban-cabecera">
        <div className="tarjeta-kanban-indicadores">
          <QAvatar
            className={claseProbabilidadOportunidad(probabilidad)}
            tamaño="sm"
          >
            {`${probabilidad}%`}
          </QAvatar>
        </div>

        <QEtiqueta
          className={`tarjeta-kanban-total ${claseImportePorImporte(importe)}`}
        >
          {formatearMoneda(importe, "EUR")}
        </QEtiqueta>
      </header>

      <div className="tarjeta-kanban-meta tarjeta-kanban-meta-persona">
        <QIcono nombre="usuario" tamaño="sm" />
        <span className="tarjeta-kanban-texto">{personaPrincipal}</span>
      </div>

      <div className="tarjeta-kanban-meta tarjeta-kanban-meta-fecha">
        <QIcono nombre="calendario_evento" tamaño="sm" />
        <span className="tarjeta-kanban-texto">
          {oportunidad.fecha_cierre
            ? formatearFechaDate(oportunidad.fecha_cierre)
            : "-"}
        </span>
        {estadoVencimiento && estadoVencimiento.clase !== "normal" && (
          <QEtiqueta
            variante={
              estadoVencimiento.clase === "vencida"
                ? "error"
                : estadoVencimiento.clase === "hoy"
                  ? "advertencia"
                  : "primario"
            }
            className="tarjeta-kanban-vencimiento"
          >
            {estadoVencimiento.texto}
          </QEtiqueta>
        )}
      </div>

      {tieneAccionesPendientes && (
        <div className="tarjeta-kanban-meta tarjeta-kanban-meta-acciones">
          <QIcono nombre="lista_detalle" tamaño="sm" />
          <QEtiqueta
            variante="advertencia"
            className="tarjeta-kanban-acciones-pendientes"
          >
            {tCrm("oportunidadventa.accionesPendientes", { count: accionesPendientes })}
          </QEtiqueta>
        </div>
      )}
    </article>
  );
};
