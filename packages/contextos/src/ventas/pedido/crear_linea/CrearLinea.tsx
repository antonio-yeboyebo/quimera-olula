import { Articulo } from "#/ventas/comun/componentes/articulo.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { FactoryCtx } from "@olula/lib/factory_ctx.js";
import { useFocus } from "@olula/lib/useFocus.js";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useState } from "react";
import { postLinea } from "../infraestructura.ts";
import "./CrearLinea.css";
import { metaNuevaLinea, nuevaLineaVacia } from "./dominio.ts";

export type CrearLineaProps = {
  pedidoId: string;
  publicar: ProcesarEvento;
}

export const CrearLinea = (props: CrearLineaProps) => {
  
  const { app } = useContext(FactoryCtx);
  const CrearLinea_ = app.Ventas.pedido_CrearLinea as typeof CrearLineaBase;

  return CrearLinea_(props);
}

export const CrearLineaBase = ({
  pedidoId,
  publicar,
}: CrearLineaProps) => {
  const { intentar } = useContext(ContextoError);
  const { modelo, uiProps, valido } = useModelo(
    metaNuevaLinea,
    nuevaLineaVacia
  );
  const [creando, setCreando] = useState(false);
  const focus = useFocus();

  const crear = useCallback(async () => {
    await intentar(() => postLinea(pedidoId, modelo));
    setCreando(true);
    publicar("alta_linea_lista");
  }, [modelo, publicar, pedidoId, intentar]);

  const cancelar = useCallback(() => {
    if (!creando) publicar("crear_linea_cancelado");
  }, [creando, publicar]);

  return (
    <QModal abierto={true} nombre="mostrar" onCerrar={cancelar}>
      <div className="CrearLinea">
        <h2>Crear línea</h2>
        <quimera-formulario>
          <Articulo
            {...uiProps("referencia", "descripcion")}
            nombre="referencia_nueva_linea_pedido"
            ref={focus}
          />
          <QInput label="Cantidad" {...uiProps("cantidad")} />
        </quimera-formulario>
        <div className="botones maestro-botones ">
          <QBoton onClick={crear} deshabilitado={!valido}>
            Crear
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
