import { EstadoBaseOportunidad } from "#/crm/comun/componentes/estado_base_oportunidad.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Detalle, QBoton, QInput } from "@olula/componentes/index.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { useParams } from "react-router";
import { BorrarEstadoOportunidad } from "../borrar/BorrarEstadoOportunidad.tsx";
import { estadoOportunidadVacio, metaEstadoOportunidad } from "./detalle.ts";
import "./DetalleEstadoOportunidad.css";
import { getMaquina } from "./maquina.ts";
import { useTCrm } from "../../i18n/index.ts";

export const DetalleEstadoOportunidad = ({
  id,
  publicar,
}: {
  id?: string;
  publicar: EmitirEvento;
}) => {
  const t = useTCrm();
  const params = useParams();

  const estadoOportunidadId = id ?? params.id;
  const titulo = (estado_oportunidad: Entidad) =>
    estado_oportunidad.descripcion as string;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      estado_oportunidad: estadoOportunidadVacio,
    },
    publicar
  );

  const estado_oportunidad = useModelo(
    metaEstadoOportunidad,
    ctx.estado_oportunidad
  );
  const { modelo, modificado, uiProps, valido } = estado_oportunidad;

  useEffect(() => {
    if (estadoOportunidadId) {
      emitir("estado_oportunidad_id_cambiado", estadoOportunidadId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadoOportunidadId]);

  return (
    <Detalle
      id={estadoOportunidadId}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={modelo}
      cerrarDetalle={() => emitir("edicion_estado_oportunidad_cancelada", null)}
    >
      {!!estadoOportunidadId && (
        <div className="DetalleEstadoOportunidad">
          <QuimeraAcciones
            vertical
            acciones={[
              {
                texto: t("estadoOportunidadVenta.marcarPorDefecto"),
                onClick: () => emitir("marcar_estado_oportunidad_por_defecto"),
                deshabilitado: modelo.valorDefecto,
              },
              {
                texto: t("estadoOportunidadVenta.borrar"),
                onClick: () => emitir("borrado_estado_oportunidad_solicitado"),
                advertencia: true,
              },
            ]}
          />

          <quimera-formulario>
            <QInput label={t("estadoOportunidadVenta.descripcion")} {...uiProps("descripcion")} />
            <QInput label={t("estadoOportunidadVenta.probabilidad")} {...uiProps("probabilidad")} />
            <EstadoBaseOportunidad {...uiProps("estadobase")} />
          </quimera-formulario>

          {modificado && (
            <div className="botones maestro-botones">
              <QBoton
                onClick={() => emitir("estado_oportunidad_cambiado", modelo)}
                deshabilitado={!valido}
              >
                {t("estadoOportunidadVenta.guardar")}
              </QBoton>
              <QBoton
                tipo="reset"
                variante="texto"
                onClick={() => emitir("edicion_estado_oportunidad_cancelada")}
              >
                {t("estadoOportunidadVenta.cancelar")}
              </QBoton>
            </div>
          )}

          {ctx.estado === "BORRANDO" && (
            <BorrarEstadoOportunidad
              publicar={emitir}
              estado_oportunidad={modelo}
            />
          )}
        </div>
      )}
    </Detalle>
  );
};
