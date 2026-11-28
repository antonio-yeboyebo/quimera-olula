import { apiAgendaCliente } from "#/ventas/cliente/infraestructura.ts";
import { TabCrmContactos } from "#/ventas/cliente/detalle/crm_contactos/TabCrmContactos.tsx";
import { CambiarIdFiscal } from "#/ventas/comun/componentes/moleculas/CambiarIdFiscal/CambiarIdFiscal.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Detalle, QBoton, Tab, Tabs } from "@olula/componentes/index.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { useParams } from "react-router";
import { BorrarCliente } from "../borrar/BorrarCliente.tsx";
import { Acciones } from "./acciones/Acciones.tsx";
import { clienteVacio, metaCliente } from "./detalle.ts";
import "./DetalleCliente.css";
import { getMaquina } from "./maquina.ts";
import { Oportunidades } from "./oportunidades/Oportunidades.tsx";
import { TabGeneral } from "./tabs/TabGeneral.tsx";
import { useTCrm } from "../../i18n/index.ts";

export const DetalleCliente = ({
  id,
  publicar,
}: {
  id?: string;
  publicar: EmitirEvento;
}) => {
  const t = useTCrm();
  const params = useParams();

  const clienteId = id ?? params.id;
  const titulo = (cliente: Entidad) => cliente.nombre as string;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      cliente: clienteVacio,
    },
    publicar
  );

  const cliente = useModelo(metaCliente, ctx.cliente);
  const { modelo, modificado, valido } = cliente;

  useEffect(() => {
    if (clienteId) {
      emitir("cliente_id_cambiado", clienteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  return (
    <Detalle
      id={clienteId}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={modelo}
      cerrarDetalle={() => emitir("edicion_cliente_cancelada", null)}
    >
      {!!clienteId && (
        <div className="DetalleCliente">
          <div className="maestro-botones">
            <QuimeraAcciones
              vertical
              acciones={[
                {
                  icono: "eliminar",
                  texto: t("cliente.borrar"),
                  onClick: () => emitir("borrado_cliente_solicitado"),
                  advertencia: true,
                },
              ]}
            />
          </div>

          <Tabs>
            <Tab label={t("cliente.general")}>
              <TabGeneral cliente={cliente} emitir={emitir} />
            </Tab>

            <Tab label={t("cliente.contactos")}>
              <TabCrmContactos entidadId={clienteId} api={apiAgendaCliente} />
            </Tab>

            <Tab label={t("cliente.oportunidades")}>
              <Oportunidades cliente={cliente} />
            </Tab>

            <Tab label={t("cliente.acciones")}>
              <Acciones cliente={cliente} />
            </Tab>
          </Tabs>

          {modificado && (
            <div className="botones maestro-botones">
              <QBoton
                onClick={() => emitir("cliente_cambiado", modelo)}
                deshabilitado={!valido}
              >
                {t("cliente.guardar")}
              </QBoton>
              <QBoton
                tipo="reset"
                variante="texto"
                onClick={() => emitir("edicion_cliente_cancelada")}
              >
                {t("cliente.cancelar")}
              </QBoton>
            </div>
          )}
          {ctx.estado === "CAMBIANDO_ID_FISCAL" && (
            <CambiarIdFiscal
              publicar={emitir}
              tipoIdFiscal={ctx.cliente.tipo_id_fiscal}
              idFiscal={ctx.cliente.id_fiscal}
            />
          )}
          {ctx.estado === "BORRANDO" && (
            <BorrarCliente publicar={emitir} cliente={modelo} />
          )}
        </div>
      )}
    </Detalle>
  );
};
