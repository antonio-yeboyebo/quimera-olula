import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import {
  Listado,
  MaestroDetalle,
  QBoton,
} from "@olula/componentes/index.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { Almacen } from "../../diseño.ts";
import { CrearAlmacen } from "../CrearAlmacen.tsx";
import { DetalleAlmacen } from "../detalle/DetalleAlmacen.tsx";
import { metaTablaAlmacen } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTAlmacen } from "../../../i18n/index.ts";

export const MaestroAlmacen = () => {
  const t = useTAlmacen();
  const { id, criteria } = getUrlParams();

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    almacenes: listaActivaEntidadesInicial<Almacen>(id, criteria),
  });

  useUrlParams(ctx.almacenes.activo, ctx.almacenes.criteria);

  useEffect(() => {
    emitir("recarga_de_almacenes_solicitada", ctx.almacenes.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Almacen">
      <MaestroDetalle<Almacen>
        seleccionada={ctx.almacenes.activo}
        layout="TABLA"
        Maestro={
          <>
            <h2>{t("almacen.almacenes")}</h2>
            <div className="maestro-botones">
              <QBoton onClick={() => emitir("crear")}>{t("almacen.nuevo")}</QBoton>
            </div>
            <Listado<Almacen>
              metaTabla={metaTablaAlmacen}
              criteria={ctx.almacenes.criteria}
              modo="tabla"
              entidades={ctx.almacenes.lista}
              totalEntidades={ctx.almacenes.total}
              seleccionada={ctx.almacenes.activo}
              onSeleccion={(payload) => emitir("almacen_seleccionado", payload)}
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
            />
          </>
        }
        Detalle={<DetalleAlmacen id={ctx.almacenes.activo} publicar={emitir} />}
      />
      <CrearAlmacen publicar={emitir} activo={ctx.estado === "CREANDO"} />
    </div>
  );
};
