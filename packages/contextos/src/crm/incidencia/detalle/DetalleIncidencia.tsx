import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Detalle, QBoton, Tab, Tabs } from "@olula/componentes/index.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { useParams } from "react-router";
import { BorrarIncidencia } from "../borrar/BorrarIncidencia.tsx";
import { Acciones } from "./acciones/Acciones.tsx";
import { incidenciaVacia, metaIncidencia } from "./detalle.ts";
import "./DetalleIncidencia.css";
import { getMaquina } from "./maquina.ts";
import { TabGeneral } from "./tabs/TabGeneral.tsx";
import { useTCrm } from "../../i18n/index.ts";

export const DetalleIncidencia = ({
  id,
  publicar,
}: {
  id?: string;
  publicar: EmitirEvento;
}) => {
  const t = useTCrm();
  const params = useParams();

  const incidenciaId = id ?? params.id;
  const titulo = (incidencia: Entidad) => incidencia.descripcion as string;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      incidencia: incidenciaVacia,
    },
    publicar
  );

  const incidencia = useModelo(metaIncidencia, ctx.incidencia);
  const { modelo, modificado, valido } = incidencia;

  useEffect(() => {
    if (incidenciaId) {
      emitir("incidencia_id_cambiado", incidenciaId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidenciaId]);

  return (
    <Detalle
      id={incidenciaId}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={modelo}
      cerrarDetalle={() => emitir("edicion_incidencia_cancelada", null)}
    >
      {!!incidenciaId && (
        <div className="DetalleIncidencia">
          <QuimeraAcciones
            vertical
            acciones={[
              {
                texto: t("incidencia.borrar"),
                onClick: () => emitir("borrado_incidencia_solicitado"),
                advertencia: true,
              },
            ]}
          />

          <Tabs>
            <Tab label={t("incidencia.general")}>
              <TabGeneral incidencia={incidencia} />
            </Tab>

            <Tab label={t("incidencia.acciones")}>
              <Acciones incidencia={incidencia} />
            </Tab>
          </Tabs>

          {modificado && (
            <div className="botones maestro-botones">
              <QBoton
                onClick={() => emitir("incidencia_cambiada", modelo)}
                deshabilitado={!valido}
              >
                {t("incidencia.guardar")}
              </QBoton>
              <QBoton
                tipo="reset"
                variante="texto"
                onClick={() => emitir("edicion_incidencia_cancelada")}
              >
                {t("incidencia.cancelar")}
              </QBoton>
            </div>
          )}

          {ctx.estado === "BORRANDO" && (
            <BorrarIncidencia publicar={emitir} incidencia={modelo} />
          )}
        </div>
      )}
    </Detalle>
  );
};
