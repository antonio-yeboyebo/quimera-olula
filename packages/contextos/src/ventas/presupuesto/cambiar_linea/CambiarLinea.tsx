import { ArticuloLinea } from "#/ventas/comun/componentes/articulo_linea/ArticuloLinea.tsx";
import { GrupoIvaProducto } from "#/ventas/comun/componentes/grupo_iva_producto.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { useForm } from "@olula/lib/useForm.js";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo, useState } from "react";
import { LineaPresupuesto } from "../diseño.ts";
import { patchLinea } from "../infraestructura.ts";
import "./CambiarLinea.css";
import { getModeloInicial, metaLinea, ModeloCambiarLinea } from "./dominio.ts";
import { useTVentas } from "../../i18n/index.ts";

export const CambiarLinea = ({
  presupuestoId,
  publicar,
  linea,
}: {
  presupuestoId: string;
  linea: LineaPresupuesto;
  publicar: ProcesarEvento;
}) => {
  const t = useTVentas();
  const modeloInicial = useMemo(() => getModeloInicial(linea), [linea.id]);

  const { modelo, uiProps, valido, set } = useModelo<ModeloCambiarLinea>(metaLinea, modeloInicial);
  const [mostrarMas, setMostrarMas] = useState(false);

  const cambiar_ = useCallback(async () => {
    await patchLinea(presupuestoId, modelo);
    publicar("linea_actualizada");
  }, [modelo, publicar, presupuestoId]);

  const cancelar_ = useCallback(
    () => publicar("editar_linea_cancelado"),
    [publicar]
  );

  const [cambiar, cancelar] = useForm(cambiar_, cancelar_);

  const libre = modelo.tipoArticulo === "libre";

  return (
    <QModal
      abierto={true}
      nombre="editar_linea_presupuesto"
      titulo={t("documento.formLinea.editar")}
      onCerrar={cancelar}
    >
      <div className="EditarLinea">
        <quimera-formulario>
          <ArticuloLinea
            tipoArticulo={modelo.tipoArticulo}
            idArticulo={modelo.referencia}
            descripcionArticulo={modelo.descripcionArticulo}
            descripcion={modelo.descripcion}
            nombre="referencia_cambiar_linea_presupuesto"
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
              <div className="seccion-separador">Descuento</div>
              <QInput label={t("documento.formLinea.descuento")} {...uiProps("dto_porcentual")} />
              <QInput label={t("documento.formLinea.dtoLineal")} {...uiProps("dto_lineal")} />

              <div className="seccion-separador">Impuestos</div>
              <GrupoIvaProducto {...uiProps("grupo_iva_producto_id")} soloLectura={!libre} />
              <QInput label={t("documento.formLinea.iva")} {...uiProps("tipo_iva")} soloLectura />
              <QCheckbox label={t("documento.formLinea.ivaIncluido")} {...uiProps("iva_incluido")} soloLectura={!libre} />
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
