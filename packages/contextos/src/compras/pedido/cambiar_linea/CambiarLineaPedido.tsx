import { ArticuloLinea } from "#/compras/comun/componentes/articulo_linea/ArticuloLinea.tsx";
import { GrupoIvaProducto } from "#/ventas/comun/componentes/grupo_iva_producto.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo, useState } from "react";
import { LineaPedido, Pedido } from "../diseño.ts";
import {
  articuloLineaBloqueado,
  metaLineaPedido,
  modeloLineaPedido,
} from "../dominio.ts";
import { patchLineaPedido } from "../infraestructura.ts";
import "./CambiarLineaPedido.css";
import { useTCompras } from "#/compras/i18n/index.ts";

export const CambiarLineaPedido = ({
  pedido,
  linea,
  publicar,
}: {
  pedido: Pedido;
  linea: LineaPedido;
  publicar: EmitirEvento;
}) => {
  const t = useTCompras();
  const inicial = useMemo(() => modeloLineaPedido(linea), [linea]);
  const { modelo, uiProps, valido, set } = useModelo(metaLineaPedido, inicial);

  const cambiar_ = useCallback(async () => {
    await patchLineaPedido(pedido.id, linea.id, modelo);
    publicar("linea_cambiada", linea.id);
  }, [modelo, pedido.id, linea.id, publicar]);

  const cancelar_ = useCallback(
    () => publicar("cambio_de_linea_cancelado"),
    [publicar]
  );

  const [mostrarMas, setMostrarMas] = useState(false);

  const [cambiar, cancelar] = useForm(cambiar_, cancelar_);

  // const [mostrarMas, setMostrarMas] = useState(false);

  return (
    <QModal
      abierto={true}
      nombre="cambiarLineaPedidoCompra"
      titulo={t("comun.lineas.cambiar")}
      onCerrar={cancelar}
    >
      <div className="CambiarLineaPedido">
        <quimera-formulario>
          <ArticuloLinea
            tipoArticulo={modelo.tipoArticulo}
            referencia={modelo.referencia}
            descripcionArticulo={modelo.descripcionArticulo}
            descripcion={modelo.descripcion}
            nombre="referenciaLineaPedidoCompra"
            onChange={(cambios) => set({ ...modelo, ...cambios })}
            bloqueado={articuloLineaBloqueado(linea)}
          />
          <QInput label={t("comun.lineas.cantidad")} {...uiProps("cantidad")} />
          <QInput label={t("comun.lineas.costeUnitario")} {...uiProps("pvpUnitario")} />

          <div className="mostrar-mas-fila">
            <button
              type="button"
              className="mostrar-mas-btn"
              onClick={() => setMostrarMas((v) => !v)}
            >
              {mostrarMas ? t("comun.lineas.menosOpciones") : t("comun.lineas.masOpciones")}
            </button>
          </div>

          {mostrarMas && (
            <>
              <div className="seccion-separador">{t("comun.lineas.descuento")}</div>
              <QInput label={t("comun.lineas.pctDescuento")} {...uiProps("dtoPorcentual")} />
              <QInput label={t("comun.lineas.descuentoLineal")} {...uiProps("dtoLineal")} />

              <div className="seccion-separador">{t("comun.lineas.impuestos")}</div>
              <GrupoIvaProducto {...uiProps("grupoIvaProductoId")} />
              <QInput label={t("comun.lineas.pctIva")} {...uiProps("tipoIva")} soloLectura />
              <QInput label={t("comun.lineas.pctIrpf")} {...uiProps("tipoIrpf")} />
            </>
          )}
        </quimera-formulario>
        <div className="botones maestro-botones">
          <QBoton onClick={cambiar} deshabilitado={!valido}>
            {t("comun.botones.cambiar")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
