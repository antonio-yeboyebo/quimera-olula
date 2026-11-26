import { ContactoSelector } from "#/ventas/comun/componentes/contacto.tsx";
import { ApiAgenda } from "#/comun/agenda/infraestructura.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useEffect, useState } from "react";
import { CrearCrmContactos } from "./CrearCrmContactos.tsx";
import { EdicionCrmContactos } from "./EdicionCrmContactos.tsx";
import { TabCrmContactosLista } from "./TabCrmContactosLista.tsx";
import { useTVentas } from "../../../i18n/index.ts";
import { getMaquina } from "./maquina.ts";

/** Agenda de contactos de un cliente o un proveedor: `api` dice contra qué rutas trabaja. */
export const TabCrmContactos = ({ entidadId, api }: { entidadId: string; api: ApiAgenda }) => {
  const t = useTVentas();
  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "lista",
    contactos: [],
    contactoActivo: null,
    cargando: true,
    entidadId,
    api,
  });

  useEffect(() => {
    if (entidadId) emitir("cargar_contactos", entidadId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entidadId]);

  const estado = ctx.estado;
  const [contactoSeleccionado, setContactoSeleccionado] = useState<{
    valor: string;
    descripcion: string;
  } | null>(null);

  const acciones = [
    {
      texto: t("cliente.agenda.anadirExistente"),
      onClick: () => emitir("asociar_solicitado"),
    },
    {
      texto: t("cliente.agenda.quitar"),
      onClick: () => emitir("eliminar_asociacion"),
      deshabilitado: !ctx.contactoActivo,
    },
    {
      icono: "eliminar",
      texto: t("cliente.botones.borrar"),
      advertencia: true,
      onClick: () => emitir("borrado_solicitado"),
      deshabilitado: !ctx.contactoActivo,
    },
  ];

  return (
    <div className="CrmContactos">
      <>
        <TabCrmContactosLista
          contactos={ctx.contactos}
          seleccionado={ctx.contactoActivo}
          emitir={emitir}
          cargando={ctx.cargando}
          acciones={acciones}
        />
      </>

      <QModalConfirmacion
        nombre="confirmacionBorrarContacto"
        abierto={estado === "confirmar_borrado"}
        titulo={t("cliente.agenda.borrarTitulo")}
        mensaje={t("cliente.agenda.borrarMensaje")}
        onCerrar={() => emitir("borrado_cancelado")}
        onAceptar={() => emitir("borrado_confirmado")}
      />

      <QModalConfirmacion
        nombre="confirmacionEliminarAsociacion"
        abierto={estado === "confirmar_eliminar_asociacion"}
        titulo={t("cliente.agenda.quitar")}
        mensaje={t("cliente.agenda.quitarMensaje")}
        onCerrar={() => emitir("eliminacion_cancelada")}
        onAceptar={() => emitir("eliminacion_solicitada")}
      />

      <QModal
        nombre="altaCrmContacto"
        abierto={estado === "alta"}
        onCerrar={() => emitir("alta_cancelada")}
        titulo={t("cliente.agenda.nuevo")}
      >
        {estado === "alta" && <CrearCrmContactos emitir={emitir} />}
      </QModal>

      <QModal
        nombre="edicionCrmContacto"
        abierto={estado === "edicion"}
        onCerrar={() => emitir("edicion_cancelada")}
        titulo={t("cliente.agenda.editar")}
      >
        {estado === "edicion" && ctx.contactoActivo && (
          <EdicionCrmContactos contacto={ctx.contactoActivo} emitir={emitir} />
        )}
      </QModal>

      <QModal
        nombre="asociarCrmContacto"
        abierto={estado === "asociar"}
        onCerrar={() => emitir("asociacion_cancelada")}
        titulo={t("cliente.agenda.anadirExistente")}
      >
        <ContactoSelector
          valor={contactoSeleccionado?.valor || ""}
          descripcion=""
          nombre="cliente/contacto_id"
          label={t("comun.seleccionarContacto")}
          excluir={ctx.contactos.map((contacto) => contacto.id)}
          obtenerContactos={api.buscar}
          onChange={(contacto) => setContactoSeleccionado(contacto)}
        />
        <div className="botones">
          <QBoton
            onClick={() => {
              if (contactoSeleccionado) {
                emitir("vinculacion_solicitada", contactoSeleccionado.valor);
              }
            }}
            deshabilitado={!contactoSeleccionado}
          >
            {t("cliente.botones.guardar")}
          </QBoton>
          <QBoton
            tipo="reset"
            variante="texto"
            onClick={() => emitir("asociacion_cancelada")}
          >
            {t("cliente.botones.cancelar")}
          </QBoton>
        </div>
      </QModal>
    </div>
  );
};
