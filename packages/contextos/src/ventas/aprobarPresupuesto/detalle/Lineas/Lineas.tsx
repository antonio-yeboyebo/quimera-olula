import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModalConfirmacion } from "@olula/componentes/index.ts";
import { EmitirEvento, ListaSeleccionable } from "@olula/lib/diseño.ts";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { LineaAprobarPresupuesto as Linea } from "../../diseño.ts";
import { metaLinea } from "../../dominio.ts";
import { EstadoAprobarPresupuesto } from "../diseño.ts";
import { AccionesLinea } from "./AccionesLinea.tsx";
import "./Lineas.css";
import { useTVentas } from "../../../i18n/index.ts";

// ---------------------------------------------------------------------------
// Fila de línea
// ---------------------------------------------------------------------------

const FilaLinea = ({
  linea,
  presupuestoId,
  publicar,
}: {
  linea: Linea;
  presupuestoId: string;
  publicar: EmitirEvento;
}) => {
  const { uiProps } = useModelo(metaLinea, linea, async (lineaActualizada) => {
    await publicar("cantidad_cambiada", {
      id: lineaActualizada.id,
      cantidad: Number(lineaActualizada.a_aprobar),
    });
  });

  return (
    <tr>
      <td>
        <span>{linea.referencia}</span> <span>{linea.descripcion}</span>{" "}
        <span>{`(${formatearMoneda(linea.pvp_total, "EUR")})`}</span>
      </td>
      <td className="num">
        <QEtiqueta
          variante={
            linea.aprobada === 0
              ? "error"
              : linea.aprobada < linea.cantidad
                ? "advertencia"
                : "exito"
          }
        >
          {linea.aprobada} / {linea.cantidad}
        </QEtiqueta>
      </td>
      <td className="num">
        <QInput label="" {...uiProps("a_aprobar")} />
      </td>
      <td>
        <AccionesLinea
          linea={linea}
          presupuestoId={presupuestoId}
          publicar={publicar}
        />
      </td>
    </tr>
  );
};

// ---------------------------------------------------------------------------
// Orquestador principal
// ---------------------------------------------------------------------------

export const Lineas = ({
  presupuestoId,
  lineas,
  estado,
  publicar,
}: {
  presupuestoId: string;
  lineas: ListaSeleccionable<Linea>;
  estado: EstadoAprobarPresupuesto;
  publicar: EmitirEvento;
}) => {
  const t = useTVentas();
  return (
    <div className="LineasAprobar">
      <table>
        <thead>
          <tr>
            <th>{t("presupuesto.aprobarParcial.articulo")}</th>
            <th className="num">{t("presupuesto.aprobarParcial.aprobada")}</th>
            <th className="num">{t("presupuesto.aprobarParcial.aAprobar")}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {lineas.lista.map((linea) => (
            <FilaLinea
              key={linea.id}
              linea={linea}
              presupuestoId={presupuestoId}
              publicar={publicar}
            />
          ))}
        </tbody>
      </table>

      <QModalConfirmacion
        nombre="aprobarPresupuesto"
        abierto={estado === "CONFIRMANDO_APROBACION"}
        titulo={t("presupuesto.aprobarParcial.confirmar")}
        mensaje={t("presupuesto.aprobarParcial.confirmarMensaje")}
        labelAceptar={t("presupuesto.aprobarParcial.aceptar")}
        mostrarCancelar={true}
        onCerrar={() => publicar("aprobacion_cancelada")}
        onAceptar={() => publicar("aprobacion_confirmada")}
      />
    </div>
  );
};
