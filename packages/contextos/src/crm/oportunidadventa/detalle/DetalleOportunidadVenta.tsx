import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Detalle, QBoton, Tab, Tabs } from "@olula/componentes/index.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.js";
import { formatearFechaDate, formatearMoneda } from "@olula/lib/dominio.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { useParams } from "react-router";
import { BorrarOportunidadVenta } from "../borrar/BorrarOportunidadVenta.tsx";
import { claseImportePorImporte } from "../comun/config_visual.ts";
import { Acciones } from "./acciones/Acciones.tsx";
import { metaOportunidadVenta, oportunidadVentaVacia } from "./detalle.ts";
import "./DetalleOportunidadVenta.css";
import { getMaquina } from "./maquina.ts";
import { Presupuestos } from "./presupuestos/Presupuestos.tsx";
import { TabDatos } from "./tabs/TabDatos.tsx";
import { TabObservaciones } from "./tabs/TabObservaciones.tsx";
import { useTCrm } from "../../i18n/index.ts";

export const DetalleOportunidadVenta = ({
  id,
  publicar,
}: {
  id?: string;
  publicar: EmitirEvento;
}) => {
  const t = useTCrm();
  const params = useParams();

  const oportunidadId = id ?? params.id;
  const titulo = (oportunidad: Entidad) => oportunidad.descripcion as string;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      oportunidad: oportunidadVentaVacia,
    },
    publicar
  );

  const oportunidad = useModelo(metaOportunidadVenta, ctx.oportunidad);
  const { modelo, modificado, valido } = oportunidad;
  const accionesPendientes = modelo.acciones_pendientes;
  const tieneAccionesPendientes =
    typeof accionesPendientes === "number" && accionesPendientes > 0;

  useEffect(() => {
    if (oportunidadId) {
      emitir("oportunidad_id_cambiado", oportunidadId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oportunidadId]);

  return (
    <Detalle
      id={oportunidadId}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={modelo}
      cerrarDetalle={() => emitir("edicion_oportunidad_cancelada", null)}
    >
      {!!oportunidadId && (
        <div className="DetalleOportunidad">
          <QuimeraAcciones
            vertical
            acciones={[
              {
                texto: t("oportunidadventa.borrar"),
                onClick: () => emitir("borrado_oportunidad_solicitado"),
                advertencia: true,
              },
            ]}
          />

          <div className="oportunidad-resumen-banda">
            {modelo.descripcion_estado && (
              <span className="oportunidad-resumen-estado">
                {modelo.descripcion_estado} ({modelo.probabilidad ?? 0}%)
              </span>
            )}
            <QEtiqueta
              className={`oportunidad-resumen-importe ${claseImportePorImporte(modelo.importe ?? 0)}`}
            >
              {formatearMoneda(modelo.importe, "EUR")}
            </QEtiqueta>
            {modelo.fecha_cierre && (
              <span className="oportunidad-resumen-fecha">
                {formatearFechaDate(new Date(modelo.fecha_cierre))}
              </span>
            )}
            {modelo.nombre_cliente && (
              <span className="oportunidad-resumen-cliente">
                {modelo.nombre_cliente}
              </span>
            )}
            {modelo.nombre_contacto && (
              <span className="oportunidad-resumen-cliente">
                {modelo.nombre_contacto}
              </span>
            )}
            {tieneAccionesPendientes && (
              <QEtiqueta
                variante="advertencia"
                className="oportunidad-resumen-acciones-pendientes"
              >
                {t("oportunidadventa.accionesPendientes", { count: accionesPendientes })}
              </QEtiqueta>
            )}
          </div>

          <Tabs>
            <Tab label={t("oportunidadventa.datos")}>
              <TabDatos oportunidad={oportunidad} />
            </Tab>

            <Tab label={t("oportunidadventa.observaciones")}>
              <TabObservaciones oportunidad={oportunidad} />
            </Tab>

            <Tab label={t("oportunidadventa.acciones")}>
              <Acciones oportunidad={oportunidad} />
            </Tab>

            <Tab label={t("oportunidadventa.presupuestos")}>
              <Presupuestos oportunidad={oportunidad} />
            </Tab>
          </Tabs>

          {modificado && (
            <div className="botones maestro-botones">
              <QBoton
                onClick={() => emitir("oportunidad_cambiada", modelo)}
                deshabilitado={!valido}
              >
                {t("oportunidadventa.guardar")}
              </QBoton>
              <QBoton
                tipo="reset"
                variante="texto"
                onClick={() => emitir("edicion_oportunidad_cancelada")}
              >
                {t("oportunidadventa.cancelar")}
              </QBoton>
            </div>
          )}

          {ctx.estado === "BORRANDO" && (
            <BorrarOportunidadVenta publicar={emitir} oportunidad={modelo} />
          )}
        </div>
      )}
    </Detalle>
  );
};
