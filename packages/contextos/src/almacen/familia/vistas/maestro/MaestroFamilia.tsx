import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import {
  Listado,
  MaestroDetalle,
  QBoton,
} from "@olula/componentes/index.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { Familia } from "../../diseño.ts";
import { CrearFamilia } from "../CrearFamilia.tsx";
import { DetalleFamilia } from "../detalle/DetalleFamilia.tsx";
import { metaTablaFamilia } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTAlmacen } from "../../../i18n/index.ts";

export const MaestroFamilia = () => {
  const t = useTAlmacen();
  const { id, criteria } = getUrlParams();

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    familias: listaActivaEntidadesInicial<Familia>(id, criteria),
  });

  useUrlParams(ctx.familias.activo, ctx.familias.criteria);

  useEffect(() => {
    emitir("recarga_de_familias_solicitada", ctx.familias.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Familia">
      <MaestroDetalle<Familia>
        seleccionada={ctx.familias.activo}
        layout="TABLA"
        Maestro={
          <>
            <h2>{t("familia.familias")}</h2>
            <div className="maestro-botones">
              <QBoton onClick={() => emitir("crear")}>{t("familia.nueva")}</QBoton>
            </div>
            <Listado<Familia>
              metaTabla={metaTablaFamilia}
              criteria={ctx.familias.criteria}
              modo="tabla"
              entidades={ctx.familias.lista}
              totalEntidades={ctx.familias.total}
              seleccionada={ctx.familias.activo}
              onSeleccion={(payload) => emitir("familia_seleccionada", payload)}
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
            />
          </>
        }
        Detalle={<DetalleFamilia id={ctx.familias.activo} publicar={emitir} />}
      />
      <CrearFamilia publicar={emitir} activo={ctx.estado === "CREANDO"} />
    </div>
  );
};
