import { Cliente as ClienteSelector } from "#/ventas/comun/componentes/cliente.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { useContext, useState } from "react";
import { Cliente } from "../../../cliente/diseño.ts";
import {
  desvincularContactoCliente,
  vincularContactoCliente,
} from "../../../cliente/infraestructura.ts";
import { Contacto } from "../../diseño.ts";
import { getClientesPorContacto } from "../../infraestructura.ts";
import { useTCrm } from "../../../i18n/index.ts";

interface Props {
  seleccionada?: Cliente | null;
  emitir: (evento: string, payload?: unknown) => void;
  estado: string;
  contacto: HookModelo<Contacto>;
}

export const TabClientesAcciones = ({
  seleccionada,
  emitir,
  contacto,
  estado,
}: Props) => {
  const t = useTCrm();
  const contactoId = contacto.modelo.id;
  const [clienteSeleccionado, setClienteSeleccionado] = useState<{
    valor: string;
    descripcion: string;
  } | null>(null);
  const { intentar } = useContext(ContextoError);

  const onAsociar = async () => {
    if (!clienteSeleccionado) return;

    await intentar(() =>
      vincularContactoCliente(contactoId, clienteSeleccionado.valor)
    );

    const nuevosClientes = await intentar(() =>
      getClientesPorContacto(contactoId)
    );
    setClienteSeleccionado(null);

    if (nuevosClientes) {
      emitir("CLIENTES_ACTUALIZADOS", {
        clientes: nuevosClientes.datos,
        clienteId: clienteSeleccionado.valor,
      });
    }
  };

  const onDesvincular = async () => {
    if (!seleccionada) return;

    await intentar(() =>
      desvincularContactoCliente(contactoId, seleccionada.id)
    );

    const nuevosClientes = await intentar(() =>
      getClientesPorContacto(contactoId)
    );

    if (nuevosClientes) {
      emitir("CLIENTES_ACTUALIZADOS", {
        clientes: nuevosClientes.datos,
      });
    }
  };

  return (
    <div className="TabClientesAcciones maestro-botones">
      <QBoton onClick={() => emitir("VINCULAR_SOLICITADO")}>
        {t("contacto.asociarCliente")}
      </QBoton>
      <QBoton
        onClick={() => emitir("DESVINCULAR_SOLICITADO")}
        deshabilitado={!seleccionada}
      >
        {t("contacto.desvincularCliente")}
      </QBoton>

      <QModal
        nombre="asociarCliente"
        abierto={estado === "vincular_cliente"}
        titulo={t("contacto.asociarCliente")}
        onCerrar={() => {
          setClienteSeleccionado(null);
          emitir("CANCELAR_VINCULACION");
        }}
      >
        <ClienteSelector
          valor={clienteSeleccionado?.valor || ""}
          descripcion={clienteSeleccionado?.descripcion || ""}
          nombre="cliente_id"
          label={t("contacto.seleccionarCliente")}
          onChange={(cliente) => setClienteSeleccionado(cliente)}
        />
        <div className="botones">
          <QBoton onClick={onAsociar} deshabilitado={!clienteSeleccionado}>
            {t("contacto.guardar")}
          </QBoton>
          <QBoton
            tipo="reset"
            variante="texto"
            onClick={() => {
              setClienteSeleccionado(null);
              emitir("CANCELAR_VINCULACION");
            }}
          >
            {t("contacto.cancelar")}
          </QBoton>
        </div>
      </QModal>

      <QModalConfirmacion
        nombre="confirmarDesvincularCliente"
        abierto={estado === "desvincular_cliente"}
        titulo={t("contacto.confirmarDesvincular")}
        mensaje={t("contacto.estaSeguroDeQueDeseaDesvincular")}
        onCerrar={() => emitir("CANCELAR_DESVINCULACION")}
        onAceptar={onDesvincular}
      />
    </div>
  );
};
