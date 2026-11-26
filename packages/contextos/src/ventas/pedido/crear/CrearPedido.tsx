import { CamposDireccionVenta } from "#/ventas/comun/componentes/CamposDireccionVenta.tsx";
import { Cliente } from "#/ventas/comun/componentes/cliente.tsx";
import { DirCliente } from "#/ventas/comun/componentes/dirCliente.tsx";
import { EmpresaActual } from "#/comun/componentes/empresaActual.tsx";
import { conEmpresaActual } from "#/valores/empresaActual.ts";
import {
  metaNuevaVentaClienteNoRegistrado,
  nuevaVentaClienteNoRegistradaVacia,
} from "#/ventas/venta/dominio.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useFocus } from "@olula/lib/useFocus.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useState } from "react";
import { getPedido, postPedido } from "../infraestructura.ts";
import "./CrearPedido.css";
import { metaNuevoPedido, nuevoPedidoVacio } from "./crear.ts";
import { useTVentas } from "../../i18n/index.ts";

export const CrearPedido = ({
  publicar = async () => {},
}: {
  publicar?: EmitirEvento;
}) => {
  const t = useTVentas();
  const [modoNoRegistrado, setModoNoRegistrado] = useState(false);
  /* Lazy initializer: referencia estable para useModelo y empresa ya puesta en el
     primer render, sin depender del efecto de EmpresaActual. */
  const [inicialRegistrado] = useState(() => conEmpresaActual(nuevoPedidoVacio));
  const [inicialNoRegistrado] = useState(() =>
    conEmpresaActual(nuevaVentaClienteNoRegistradaVacia)
  );
  const pedidoRegistrado = useModelo(metaNuevoPedido, inicialRegistrado);
  const pedidoNoRegistrado = useModelo(
    metaNuevaVentaClienteNoRegistrado,
    inicialNoRegistrado
  );
  const focus = useFocus();

  /* El maestro monta el modal siempre, así que el modo no se reinicia solo. */
  const reiniciar = useCallback(() => {
    pedidoRegistrado.init(conEmpresaActual(nuevoPedidoVacio));
    pedidoNoRegistrado.init(conEmpresaActual(nuevaVentaClienteNoRegistradaVacia));
    setModoNoRegistrado(false);
  }, [pedidoRegistrado, pedidoNoRegistrado]);

  const guardar_ = useCallback(async () => {
    const modelo = modoNoRegistrado
      ? pedidoNoRegistrado.modelo
      : pedidoRegistrado.modelo;

    const id = await postPedido(modelo);
    const pedidoCreado = await getPedido(id);
    publicar("pedido_creado", pedidoCreado);

    reiniciar();
  }, [
    modoNoRegistrado,
    pedidoNoRegistrado.modelo,
    pedidoRegistrado.modelo,
    publicar,
    reiniciar,
  ]);

  const cancelar_ = useCallback(() => {
    publicar("creacion_pedido_cancelada");
    reiniciar();
  }, [publicar, reiniciar]);

  const [guardar, cancelar] = useForm(guardar_, cancelar_);

  const toggleModoCliente = () => {
    setModoNoRegistrado(!modoNoRegistrado);
    pedidoRegistrado.init(conEmpresaActual(nuevoPedidoVacio));
    pedidoNoRegistrado.init(conEmpresaActual(nuevaVentaClienteNoRegistradaVacia));
  };

  return (
    <>
      <div className="modo-cliente">
        <QBoton onClick={toggleModoCliente} variante="texto" tipo="button">
          {modoNoRegistrado ? t("documento.crear.clienteRegistrado") : t("documento.crear.clienteNoRegistrado")}
        </QBoton>
      </div>
      <div className="CrearPedido campos-direccion">
        <quimera-formulario>
          {modoNoRegistrado ? (
            <>
              <EmpresaActual
                onChange={(id) => pedidoNoRegistrado.uiProps("empresa_id").onChange(id)}
              />
              <QInput
                label={t("documento.crear.nombreCliente")}
                {...pedidoNoRegistrado.uiProps("nombre_cliente")}
                ref={focus}
              />
              <QInput
                label={t("documento.detalle.idFiscal")}
                {...pedidoNoRegistrado.uiProps("id_fiscal")}
              />
              <CamposDireccionVenta uiProps={pedidoNoRegistrado.uiProps} />
            </>
          ) : (
            <>
              <EmpresaActual
                onChange={(id) => pedidoRegistrado.uiProps("empresa_id").onChange(id)}
              />
              <Cliente
                {...pedidoRegistrado.uiProps("cliente_id", "nombre")}
                nombre="ClientePedido"
                avisarObservaciones
                ref={focus}
              />
              <DirCliente
                clienteId={pedidoRegistrado.modelo.cliente_id}
                {...pedidoRegistrado.uiProps("direccion_id")}
              />
            </>
          )}
        </quimera-formulario>
      </div>
      <div className="botones">
        <QBoton
          onClick={guardar}
          deshabilitado={
            modoNoRegistrado
              ? !pedidoNoRegistrado.valido
              : !pedidoRegistrado.valido
          }
        >
          Guardar
        </QBoton>
        <QBoton onClick={cancelar} variante="texto">
          Cancelar
        </QBoton>
      </div>
    </>
  );
};
