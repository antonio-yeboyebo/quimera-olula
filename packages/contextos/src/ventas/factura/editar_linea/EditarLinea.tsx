import { ArticuloLinea } from "#/ventas/comun/componentes/articulo_linea/ArticuloLinea.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { GrupoIvaProducto } from "@olula/ctx/ventas/comun/componentes/grupo_iva_producto.tsx";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo, useState } from "react";
import { LineaFactura as Linea } from "../diseño.ts";
import "./EditarLinea.css";
import { getModeloInicial, metaLinea, ModeloCambiarLinea } from "./dominio.ts";
import { useTVentas } from "../../i18n/index.ts";

export const EditarLinea = ({
  publicar,
  linea,
}: {
  linea: Linea;
  publicar: ProcesarEvento;
}) => {
  const t = useTVentas();
  const modeloInicial = useMemo(() => getModeloInicial(linea), [linea.id]);

  const { modelo, uiProps, valido, set } = useModelo<ModeloCambiarLinea>(metaLinea, modeloInicial);

  const [cambiando, setCambiando] = useState(false);
  const [mostrarMas, setMostrarMas] = useState(false);

  const cambiar = () => {
    setCambiando(true);
    publicar("linea_actualizada", modelo);
  };

  const cancelar = useCallback(() => {
    if (!cambiando) publicar("editar_linea_cancelado");
  }, [cambiando, publicar]);

  const libre = modelo.tipoArticulo === "libre";

  return (
    <QModal
      abierto={true}
      nombre="editar_linea_factura"
      titulo={t("documento.formLinea.editar")}
      onCerrar={cancelar}
    >
      <div className="EdicionLinea">
        <quimera-formulario>
          <ArticuloLinea
            tipoArticulo={modelo.tipoArticulo}
            idArticulo={modelo.referencia}
            descripcionArticulo={modelo.descripcionArticulo}
            descripcion={modelo.descripcion}
            nombre="referencia_cambiar_linea_factura"
            onChange={(cambios) => set({ ...modelo, ...cambios })}
            bloqueado={true}
          />

          <QInput label={t("documento.formLinea.cantidad")} {...uiProps("cantidad")} />

          <QInput label={t("documento.formLinea.precio")} {...uiProps("pvp_unitario")} />

          <div className="mostrar-mas-fila">
            <button
              type="button"
              className="mostrar-mas-btn"
              onClick={() => setMostrarMas((v) => !v)}
            >
              {mostrarMas ? t("documento.formLinea.menosOpciones") : t("documento.formLinea.masOpciones")}
            </button>
          </div>

          {mostrarMas && (
            <>
              <QInput label={t("documento.formLinea.descuento")} {...uiProps("dto_porcentual")} />
              <QInput label={t("documento.formLinea.dtoLineal")} {...uiProps("dto_lineal")} />
              <GrupoIvaProducto {...uiProps("grupo_iva_producto_id")} soloLectura={!libre} />
              <QInput label={t("documento.formLinea.iva")} {...uiProps("tipo_iva")} soloLectura />
              <QInput label={t("documento.formLinea.irpf")} {...uiProps("tipo_irpf")} />
              <QInput label={t("documento.formLinea.porComision")} {...uiProps("por_comision")} />
              <QInput label={t("documento.formLinea.importeComision")} {...uiProps("importe_comision")} />
            </>
          )}
        </quimera-formulario>

        <div className="botones maestro-botones ">
          <QBoton onClick={cambiar} deshabilitado={!valido}>
            Guardar
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
