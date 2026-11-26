import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import {
    Listado,
    MaestroDetalle,
    QBoton,
} from "@olula/componentes/index.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { Ubicacion } from "../../diseño.ts";
import { CrearUbicacion } from "../crear/CrearUbicacion.tsx";
import { DetalleUbicacion } from "../detalle/DetalleUbicacion.tsx";
import { metaTablaUbicacion } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTAlmacen } from "../../../i18n/index.ts";

export const MaestroUbicacion = () => {
  const t = useTAlmacen();
  const { id, criteria } = getUrlParams();

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    ubicaciones: listaActivaEntidadesInicial<Ubicacion>(id, criteria),
  });

  useUrlParams(ctx.ubicaciones.activo, ctx.ubicaciones.criteria);

  useEffect(() => {
    emitir("recarga_de_ubicaciones_solicitada", ctx.ubicaciones.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Ubicacion">
      <MaestroDetalle<Ubicacion>
        seleccionada={ctx.ubicaciones.activo}
        layout="TABLA"
        Maestro={
          <>
            <h2>{t("ubicacion.ubicaciones")}</h2>
            <div className="maestro-botones">
              <QBoton onClick={() => emitir("crear")}>{t("ubicacion.nueva")}</QBoton>
            </div>
            <Listado<Ubicacion>
              metaTabla={metaTablaUbicacion}
              criteria={ctx.ubicaciones.criteria}
              modo="tabla"
              entidades={ctx.ubicaciones.lista}
              totalEntidades={ctx.ubicaciones.total}
              seleccionada={ctx.ubicaciones.activo}
              onSeleccion={(payload) => emitir("ubicacion_seleccionada", payload)}
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
            />
          </>
        }
        Detalle={<DetalleUbicacion id={ctx.ubicaciones.activo} publicar={emitir} />}
      />
      <CrearUbicacion publicar={emitir} activo={ctx.estado === "CREANDO"} />
    </div>
  );
};
