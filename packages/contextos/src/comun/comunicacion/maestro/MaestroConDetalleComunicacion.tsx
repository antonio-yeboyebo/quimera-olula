import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import {
  filtroFechas,
  MetaFiltro,
} from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { Filtro } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { EstadoComunicacion } from "../../componentes/estado_comunicacion.tsx";
import { CrearComunicacion } from "../crear/CrearComunicacion.tsx";
import { DetalleComunicacion } from "../detalle/DetalleComunicacion.tsx";
import { Comunicacion, ESTADOS_COMUNICACION } from "../diseño.ts";
import { metaTablaComunicacion } from "./diseño.ts";
import "./MaestroConDetalleComunicacion.css";
import { getMaquina } from "./maquina.ts";
import { TarjetaComunicacion } from "./TarjetaComunicacion.tsx";
import { tComun, useTComun } from "../../i18n/index.ts";

const criteriaBaseComunicaciones = {
  ...criteriaDefecto,
  orden: ["fechaEnvio", "DESC"],
  filtro: [["estado", "=", ESTADOS_COMUNICACION.NO_LEIDA]] as Filtro,
};

const metaFiltroComunicacion: MetaFiltro = {
  estado: {
    id: "estado",
    get label() { return tComun("comunicacion.estado"); },
    filtro: (valor) => (valor ? ["estado", "=", valor as string] : null),
    render: (valor, onChange) => (
      <EstadoComunicacion
        valor={(valor as string) ?? ""}
        onChange={(opcion: { valor: string; descripcion: string } | null) =>
          onChange(opcion?.valor ?? "")
        }
      />
    ),
  },
  fechaEnvio: {
    id: "fechaEnvio",
    get label() { return tComun("comunicacion.fecha"); },
    tipo: "intervalo_fechas",
    filtro: (valor) => filtroFechas("fechaEnvio", valor),
  },
};

export const MaestroConDetalleComunicacion = () => {
  const t = useTComun();
  const { id, criteria } = getUrlParams();
  const criteriaInicial = {
    ...criteria,
    orden:
      criteria.orden.toString() === criteriaDefecto.orden.toString()
        ? criteriaBaseComunicaciones.orden
        : criteria.orden,
    filtro:
      criteria.filtro.length === 0
        ? criteriaBaseComunicaciones.filtro
        : criteria.filtro,
  };

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    comunicaciones: listaActivaEntidadesInicial<Comunicacion>(
      id,
      criteriaInicial
    ),
  });

  useUrlParams(ctx.comunicaciones.activo, ctx.comunicaciones.criteria);

  useEffect(() => {
    emitir("recarga_de_comunicaciones_solicitada", ctx.comunicaciones.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="MaestroComunicacion">
      <MaestroDetalle<Comunicacion>
        Maestro={
          <>
            <h2>{t("comunicacion.comunicaciones")}</h2>
            <Listado<Comunicacion>
              metaTabla={metaTablaComunicacion}
              metaFiltro={metaFiltroComunicacion}
              modo="tarjetas"
              criteria={ctx.comunicaciones.criteria}
              // renderAcciones={() => (
              //   <div className="maestro-botones">
              //     <QBoton onClick={() => emitir("creacion_solicitada")}>
              //       Nueva comunicación
              //     </QBoton>
              //   </div>
              // )}
              tarjeta={TarjetaComunicacion}
              entidades={ctx.comunicaciones.lista}
              totalEntidades={ctx.comunicaciones.total}
              seleccionada={ctx.comunicaciones.activo}
              onSeleccion={(payload) =>
                emitir("comunicacion_seleccionada", payload)
              }
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
              onSiguientePagina={(payload) =>
                emitir("siguiente_pagina", payload)
              }
            />
          </>
        }
        Detalle={
          <DetalleComunicacion
            id={ctx.comunicaciones.activo}
            publicar={emitir}
          />
        }
        seleccionada={ctx.comunicaciones.activo}
        modoDisposicion="maestro-50"
      />

      <CrearComunicacion
        publicar={emitir}
        onCancelar={() => emitir("creacion_cancelada")}
        activo={ctx.estado === "CREANDO_COMUNICACION"}
      />
    </div>
  );
};
