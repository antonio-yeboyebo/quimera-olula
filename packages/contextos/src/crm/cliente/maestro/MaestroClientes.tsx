import { Agente } from "#/ventas/comun/componentes/agente.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { getMetaFiltroDefecto } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { DetalleCliente } from "../detalle/DetalleCliente.tsx";
import { Cliente } from "../diseño.ts";
import { metaTablaCliente } from "./maestro.ts";
import "./MaestroClientes.css";
import { getMaquina } from "./maquina.ts";
import { TarjetaCliente } from "./TarjetaCliente.tsx";
import { useTCrm } from "../../i18n/index.ts";

export const MaestroClientes = () => {
  const t = useTCrm();
  const { id, criteria } = getUrlParams();

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    clientes: listaActivaEntidadesInicial<Cliente>(id, criteria),
  });

  useUrlParams(ctx.clientes.activo, ctx.clientes.criteria);

  useEffect(() => {
    emitir("recarga_de_clientes_solicitada", ctx.clientes.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Cliente">
      <MaestroDetalle<Cliente>
        Maestro={
          <>
            <h2>{t("cliente.clientes")}</h2>

            <Listado<Cliente>
              metaTabla={metaTablaCliente}
              metaFiltro={{
                ...getMetaFiltroDefecto(metaTablaCliente),
                agente_id: {
                  id: "agente_id",
                  label: t("cliente.agente"),
                  filtro: (v) => (v ? ["agente_id", "=", v as string] : null),
                  render: (valor, onChange) => (
                    <Agente
                      valor={(valor as string) ?? ""}
                      onChange={(opcion) => onChange(opcion?.valor ?? "")}
                    />
                  ),
                },
              }}
              criteria={ctx.clientes.criteria}
              modosDisponibles={["tarjetas"]}
              tarjeta={TarjetaCliente}
              entidades={ctx.clientes.lista}
              totalEntidades={ctx.clientes.total}
              seleccionada={ctx.clientes.activo}
              onSeleccion={(payload) => emitir("cliente_seleccionado", payload)}
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
              onSiguientePagina={(payload) =>
                emitir("siguiente_pagina", payload)
              }
            />
          </>
        }
        Detalle={<DetalleCliente id={ctx.clientes.activo} publicar={emitir} />}
        seleccionada={ctx.clientes.activo}
        modoDisposicion="maestro-50"
      />
    </div>
  );
};
