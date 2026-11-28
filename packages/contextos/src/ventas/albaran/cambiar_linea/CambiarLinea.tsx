import { Lote } from "#/almacen/comun/componentes/Lote.tsx";
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
import { LineaAlbaran, MovimientoLote } from "../diseño.ts";
import { patchLinea } from "../infraestructura.ts";
import "./CambiarLinea.css";
import { getModeloInicial, metaLinea, ModeloCambiarLinea } from "./dominio.ts";
import { useTVentas } from "../../i18n/index.ts";

const FilaMovimiento = ({
  movimiento,
  publicar,
}: {
  movimiento: MovimientoLote;
  publicar: ProcesarEvento;
}) => {
  const t = useTVentas();
  return (
  <tr>
    <td>{movimiento.loteId}</td>
    <td className="lotes-num">{movimiento.cantidad}</td>
    <td>
      <QBoton
        tamaño="pequeño"
        onClick={() =>
          publicar("borrar_movimiento_lote_solicitado", {
            movimiento_id: movimiento.id,
          })
        }
      >
        {t("documento.detalle.borrar")}
      </QBoton>
    </td>
  </tr>
  );
};

export const CambiarLinea = ({
  publicar,
  linea,
  albaranId,
}: {
  linea: LineaAlbaran;
  albaranId: string;
  publicar: ProcesarEvento;
}) => {
  const t = useTVentas();
  const modeloInicial = useMemo(() => getModeloInicial(linea), [linea.id, linea.movimientos]);

  const { modelo, uiProps, valido, set, modificado } = useModelo<ModeloCambiarLinea>(metaLinea, modeloInicial);
  const [mostrarMas, setMostrarMas] = useState(false);

  const [mostrandoFormularioLote, setMostrandoFormularioLote] = useState(false);
  const [nuevoLoteId, setNuevoLoteId] = useState("");
  const [nuevaCantidad, setNuevaCantidad] = useState("");

  const cambiar_ = useCallback(async () => {
    await patchLinea(albaranId, modelo);
    publicar("linea_actualizada");
  }, [modelo, publicar, albaranId]);

  const cancelar_ = useCallback(
    () => publicar("editar_linea_cancelado"),
    [publicar]
  );

  const [cambiar, cancelar] = useForm(cambiar_, cancelar_);

  const libre = modelo.tipoArticulo === "libre";
  const porLotes = linea.porLotes;
  const movimientos = linea.movimientos ?? [];

  const crearLote = useCallback(() => {
    const cantidad = parseFloat(nuevaCantidad);
    if (!nuevoLoteId || isNaN(cantidad) || cantidad <= 0) return;
    publicar("crear_movimiento_lote_solicitado", {
      lote_id: nuevoLoteId,
      cantidad,
    });
    setMostrandoFormularioLote(false);
    setNuevoLoteId("");
    setNuevaCantidad("");
  }, [publicar, nuevoLoteId, nuevaCantidad]);

  return (
    <QModal
      abierto={true}
      nombre="editar_linea_albaran"
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
            nombre="referencia_cambiar_linea_albaran"
            onChange={(cambios) => set({ ...modelo, ...cambios })}
            bloqueado={true}
          />

          <QInput label={t("documento.formLinea.cantidad")} {...uiProps("cantidad")} soloLectura={porLotes} />
          <QInput label={t("documento.formLinea.precio")} {...uiProps("pvp_unitario")} />
          <QInput label={t("documento.formLinea.total")} {...uiProps("pvp_total")} />

          {porLotes && (
            <div className="lotes-seccion">
              <div className="lotes-cabecera">
                <span className="lotes-titulo">{t("documento.formLinea.lotes")}</span>
                {!mostrandoFormularioLote && (
                  <QBoton
                    tamaño="pequeño"
                    onClick={() => setMostrandoFormularioLote(true)}
                  >
                    {t("documento.formLinea.anadirLote")}
                  </QBoton>
                )}
              </div>

              {mostrandoFormularioLote && (
                <div className="lotes-formulario">
                  <Lote
                    label={t("documento.formLinea.lote")}
                    nombre="nuevo_lote_id"
                    valor={nuevoLoteId}
                    onChange={(opcion) => setNuevoLoteId(opcion?.valor ?? "")}
                  />
                  <QInput
                    label={t("documento.formLinea.cantidad")}
                    nombre="nueva_cantidad_lote"
                    valor={nuevaCantidad}
                    onChange={setNuevaCantidad}
                  />
                  <div className="lotes-formulario-botones">
                    <QBoton tamaño="pequeño" onClick={crearLote} deshabilitado={!nuevoLoteId || !nuevaCantidad}>
                      {t("documento.formLinea.crearBoton")}
                    </QBoton>
                    <QBoton tamaño="pequeño" variante="borde" onClick={() => {
                      setMostrandoFormularioLote(false);
                      setNuevoLoteId("");
                      setNuevaCantidad("");
                    }}>
                      {t("documento.formLinea.cancelar")}
                    </QBoton>
                  </div>
                </div>
              )}

              {movimientos.length > 0 && (
                <table className="lotes-tabla">
                  <thead>
                    <tr>
                      <th>{t("documento.formLinea.lote")}</th>
                      <th className="lotes-num">{t("documento.formLinea.cantidad")}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.map((m) => (
                      <FilaMovimiento
                        key={m.id}
                        movimiento={m}
                        publicar={publicar}
                      />
                    ))}
                  </tbody>
                </table>
              )}

              {movimientos.length === 0 && !mostrandoFormularioLote && (
                <p className="lotes-vacio">Sin movimientos de lote.</p>
              )}
            </div>
          )}

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
          <QBoton onClick={cambiar} deshabilitado={!(valido && modificado)}>
            Guardar
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
