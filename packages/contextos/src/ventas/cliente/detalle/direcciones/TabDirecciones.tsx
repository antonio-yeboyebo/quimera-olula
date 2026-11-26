import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { listaEntidadesInicial } from "@olula/lib/ListaEntidades.js";
import { useEffect } from "react";
import { BorrarDireccion } from "../../borrar_direccion/BorrarDireccion.tsx";
import { CrearDireccion } from "../../crear_direccion/CrearDireccion.tsx";
import { DirCliente } from "../../diseño.ts";
import { CambiarDireccion } from "../../cambiar_direccion/CambiarDireccion.tsx";
import { TabDireccionesLista } from "./TabDireccionesLista.tsx";
import { useTVentas } from "../../../i18n/index.ts";
import { getMaquina } from "./maquina.ts";

export const TabDirecciones = ({ clienteId }: { clienteId: string }) => {
  const t = useTVentas();
  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "lista",
    direcciones: listaEntidadesInicial<DirCliente>(),
    cargando: true,
    clienteId,
  });

  useEffect(() => {
    if (clienteId) emitir("cargar_direcciones", clienteId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  const estado = ctx.estado;

  return (
    <div className="TabDirecciones">
      <TabDireccionesLista
        clienteId={clienteId}
        direcciones={ctx.direcciones.lista}
        seleccionada={ctx.direcciones.activo}
        emitir={emitir}
        cargando={ctx.cargando}
      />

      <QModal
        nombre="crearDireccion"
        abierto={estado === "alta"}
        onCerrar={() => emitir("alta_cancelada")}
        titulo={t("cliente.direccion.nueva")}
      >
        <CrearDireccion clienteId={clienteId} publicar={emitir} />
      </QModal>

      <QModal
        nombre="editarDireccion"
        abierto={estado === "edicion"}
        onCerrar={() => emitir("edicion_cancelada")}
        titulo={t("cliente.direccion.editar")}
      >
        {ctx.direcciones.activo && (
          <CambiarDireccion
            direccion={ctx.direcciones.activo}
            clienteId={clienteId}
            publicar={emitir}
          />
        )}
      </QModal>

      {estado === "confirmar_borrado" && ctx.direcciones.activo && (
        <BorrarDireccion
          direccion={ctx.direcciones.activo}
          clienteId={clienteId}
          publicar={emitir}
          onCancelar={() => emitir("borrado_cancelado")}
        />
      )}
    </div>
  );
};
