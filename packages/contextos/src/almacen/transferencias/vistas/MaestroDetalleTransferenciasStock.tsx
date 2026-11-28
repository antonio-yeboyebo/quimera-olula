import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado } from "@olula/componentes/maestro/Listado.tsx";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { TransferenciaStock } from "../diseño.ts";
import {
  Contexto,
  getMaquina,
} from "../maquina_listado_transferencias_stock.ts";
import { CrearTransferenciaStock } from "./CrearTransferenciaStock.tsx";
import { DetalleTransferenciaStock } from "./DetalleTransferenciaStock.tsx";
import { tAlmacen, useTAlmacen } from "../../i18n/index.ts";

const metaTablaTransferenciaStock: MetaTabla<TransferenciaStock> = [
  { id: "id", cabecera: "ID" },
  { id: "nombre_origen", get cabecera() { return tAlmacen("transferencias.origen"); } },
  { id: "nombre_destino", get cabecera() { return tAlmacen("transferencias.destino"); } },
  {
    id: "fecha",
    get cabecera() { return tAlmacen("transferencias.fecha"); },
    render: (v) =>
      new Date(v.fecha).toLocaleString(undefined, {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
];

export const MaestroDetalleTransferenciasStock = () => {
  const t = useTAlmacen();
  const { id, criteria } = getUrlParams();

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    transferencias: listaActivaEntidadesInicial<TransferenciaStock>(
      id,
      criteria
    ),
  } as Contexto);

  useUrlParams(ctx.transferencias.activo, ctx.transferencias.criteria);

  useEffect(() => {
    emitir("recarga_de_transferencias_solicitada", ctx.transferencias.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="TransferenciaStock">
      <MaestroDetalle<TransferenciaStock>
        seleccionada={ctx.transferencias.activo}
        layout="TABLA"
        Maestro={
          <>
            <h2>{t("transferencias.transferencias")}</h2>
            <div className="maestro-botones">
              <QBoton onClick={() => emitir("crear")}>{t("transferencias.nueva")}</QBoton>
            </div>
            <Listado<TransferenciaStock>
              metaTabla={metaTablaTransferenciaStock}
              criteria={ctx.transferencias.criteria}
              modo="tabla"
              entidades={ctx.transferencias.lista}
              totalEntidades={ctx.transferencias.total}
              seleccionada={ctx.transferencias.activo}
              onSeleccion={(payload) =>
                emitir("transferencia_seleccionada", payload)
              }
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
            />
          </>
        }
        Detalle={
          <DetalleTransferenciaStock
            id={ctx.transferencias.activo}
            publicar={emitir}
          />
        }
      />
      <CrearTransferenciaStock
        publicar={emitir}
        activo={ctx.estado === "CREANDO"}
      />
    </div>
  );
};
