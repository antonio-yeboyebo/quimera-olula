import { mostrarPestanaContabilidad } from "#/contabilidad/subcuentas_tercero/dominio.ts";
import { TabContabilidad } from "#/contabilidad/subcuentas_tercero/detalle/TabContabilidad.tsx";
import { CambiarIdFiscal } from "#/ventas/comun/componentes/moleculas/CambiarIdFiscal/CambiarIdFiscal.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede, puedeAlguna } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { useParams } from "react-router";
import { useTVentas } from "../../i18n/index.ts";
import { TabPreciosArticulo } from "#/ventas/precio_articulo/detalle/TabPreciosArticulo.tsx";
import { muestraPreciosArticulo } from "#/ventas/precio_articulo/dominio.ts";
import { BorrarCliente } from "../borrar/BorrarCliente.tsx";
import { BajaCliente } from "../dar_de_baja/BajaCliente.tsx";
import { Cliente } from "../diseño.ts";
import { apiAgendaCliente } from "../infraestructura.ts";
import { TabCrmContactos } from "./crm_contactos/TabCrmContactos.tsx";
import { TabCuentasBanco } from "./cuentas_banco/TabCuentasBanco.tsx";
import "./DetalleCliente.css";
import { documentos } from "./documentos/documentos.ts";
import { TabDocumentos } from "./documentos/TabDocumentos.tsx";
import { TabDirecciones } from "./direcciones/TabDirecciones.tsx";
import { clienteVacio, metaCliente } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";
import { TabComercial } from "./TabComercial.tsx";
import { TabGeneral } from "./TabGeneral.tsx";

export const DetalleCliente = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const t = useTVentas();
  const params = useParams();
  const clienteId = id ?? params.id;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      cliente: clienteVacio(),
      clienteInicial: clienteVacio(),
    },
    publicar
  );

  const autoGuardar = useCallback(
    async (modelo: Cliente) => {
      emitir("edicion_de_cliente_lista", modelo);
    },
    [emitir]
  );

  const cliente = useModelo(metaCliente, ctx.cliente, autoGuardar);

  useEffect(() => {
    emitir("cliente_id_cambiado", clienteId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  const { estado } = ctx;

  const titulo = (cliente: Cliente) => cliente.nombre as string;

  if (!ctx.cliente.id) return;

  return (
    <div className="DetalleCliente">
      <Detalle
        id={ctx.cliente.id}
        obtenerTitulo={titulo}
        setEntidad={() => {}}
        entidad={ctx.cliente}
        cerrarDetalle={() => emitir("cliente_deseleccionado", null)}
      >
        {!!ctx.cliente.id && (
          <div className="DetalleCliente-contenido">
            <div className="maestro-botones">
              <QuimeraAcciones
                acciones={[
                  {
                    icono: "eliminar",
                    texto: t("cliente.botones.borrar"),
                    onClick: () => emitir("borrado_solicitado"),
                    advertencia: true,
                  },
                  ...(!ctx.cliente.de_baja
                    ? [
                        {
                          texto: t("cliente.detalle.darDeBaja"),
                          onClick: () => emitir("baja_solicitada"),
                        },
                      ]
                    : [
                        {
                          texto: t("cliente.detalle.darDeAlta"),
                          onClick: () => emitir("dar_de_alta_solicitado"),
                        },
                      ]),
                ]}
                vertical
              />
            </div>
            <Tabs
              children={[
                <Tab
                  key="tab-1"
                  label={t("cliente.detalle.pestanas.general")}
                  children={
                    <TabGeneral
                      form={cliente}
                      cliente={ctx.cliente}
                      emitirCliente={emitir}
                      recargarCliente={() =>
                        emitir("cliente_id_cambiado", ctx.cliente.id)
                      }
                    />
                  }
                />,
                <Tab
                  key="tab-2"
                  label={t("cliente.detalle.pestanas.comercial")}
                  children={
                    <TabComercial
                      form={cliente}
                      cliente={ctx.cliente}
                      emitirCliente={emitir}
                    />
                  }
                />,
                <Tab
                  key="tab-3"
                  label={t("cliente.detalle.pestanas.direcciones")}
                  children={<TabDirecciones clienteId={ctx.cliente.id} />}
                />,
                <Tab
                  key="tab-4"
                  label={t("cliente.detalle.pestanas.cuentas")}
                  children={
                    <TabCuentasBanco cliente={ctx.cliente} publicar={emitir} />
                  }
                />,
                ...(puede("ventas.contacto")
                  ? [
                      <Tab
                        key="tab-5"
                        label={t("cliente.detalle.pestanas.agenda")}
                        children={
                          <div className="detalle-cliente-tab-contenido">
                            <TabCrmContactos entidadId={ctx.cliente.id} api={apiAgendaCliente} />
                          </div>
                        }
                      />,
                    ]
                  : []),
                ...(puedeAlguna(documentos.map((documento) => documento.regla))
                  ? [
                      <Tab
                        key="tab-6"
                        label={t("cliente.detalle.pestanas.documentos")}
                        children={<TabDocumentos clienteId={ctx.cliente.id} />}
                      />,
                    ]
                  : []),
                ...(mostrarPestanaContabilidad()
                  ? [
                      <Tab
                        key="tab-7"
                        label={t("cliente.detalle.pestanas.contabilidad")}
                        children={
                          <div className="detalle-cliente-tab-contenido">
                            <TabContabilidad
                              tipo="cliente"
                              terceroId={ctx.cliente.id}
                            />
                          </div>
                        }
                      />,
                    ]
                  : []),
                ...(muestraPreciosArticulo()
                  ? [
                      <Tab
                        key="tab-8"
                        label={t("cliente.detalle.pestanas.precios")}
                        children={
                          <TabPreciosArticulo clienteId={ctx.cliente.id} />
                        }
                      />,
                    ]
                  : []),
              ]}
            />
            {estado === "CAMBIANDO_ID_FISCAL" && (
              <CambiarIdFiscal
                publicar={emitir}
                tipoIdFiscal={ctx.cliente.tipo_id_fiscal}
                idFiscal={ctx.cliente.id_fiscal}
              />
            )}

            {estado === "BORRANDO_CLIENTE" && (
              <BorrarCliente
                clienteId={ctx.cliente.id}
                clienteNombre={ctx.cliente.nombre as string}
                publicar={emitir}
                onCancelar={() => emitir("borrado_cancelado")}
              />
            )}

            <QModal
              nombre="modal-baja"
              abierto={estado === "BAJANDO_CLIENTE"}
              titulo={t("cliente.detalle.darDeBaja")}
              onCerrar={() => emitir("baja_cancelada")}
            >
              <BajaCliente clienteId={ctx.cliente.id} publicar={emitir} />
            </QModal>
          </div>
        )}
      </Detalle>
    </div>
  );
};
