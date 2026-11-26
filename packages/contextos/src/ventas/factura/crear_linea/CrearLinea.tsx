import { useAplicarImpuestoDefecto } from "#/almacen/config/useImpuestoDefecto.ts";
import { ArticuloLinea, CamposArticuloLinea } from "#/ventas/comun/componentes/articulo_linea/ArticuloLinea.tsx";
import { GrupoIvaProducto } from "#/ventas/comun/componentes/grupo_iva_producto.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { plugin } from "@olula/lib/dominio.js";
import { useForm } from "@olula/lib/useForm.js";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useState } from "react";
import type { ModeloNuevaLinea } from "../../venta/diseño.ts";
import { postLinea, queryNuevaLinea } from "../infraestructura.ts";
import "./CrearLinea.css";
import {
    camposConCambiosServidor,
    metaNuevaLinea,
    nuevaLineaInicial,
} from "./dominio.ts";
import { useTVentas } from "../../i18n/index.ts";

export const CrearLinea = ({
  facturaId,
  publicar,
}: {
  facturaId: string;
  publicar: ProcesarEvento;
}) => {
    const t = useTVentas();
    const onModeloListo = useCallback(
        async (nuevaLinea: ModeloNuevaLinea, campo?: string) => {
            if (campo && !(camposConCambiosServidor as readonly string[]).includes(campo)) return;
            return await queryNuevaLinea(facturaId, nuevaLinea);
        },
        [facturaId]
    );

    const lineaArticulo = useModelo(metaNuevaLinea, nuevaLineaInicial, onModeloListo);
    useAplicarImpuestoDefecto(lineaArticulo, "idGrupoIvaProducto", "linea");
    const linea = lineaArticulo.modelo;

    const onArticuloCambiado = useCallback(
        async (cambios: Partial<CamposArticuloLinea>) => {
            const extra = cambios.idArticulo !== undefined ? { pvpUnitario: null } : {};
            lineaArticulo.set({ ...linea, ...cambios, ...extra });
        },
        [linea, lineaArticulo]
    );

    const crear_ = useCallback(async () => {
        const lineaConId = await postLinea(facturaId, lineaArticulo.modelo);
        publicar("linea_creada", lineaConId);
    }, [facturaId, lineaArticulo, publicar]);

    const cancelar_ = useCallback(
        () => publicar("crear_linea_cancelado"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const valido = lineaArticulo.valido;
    const [mostrarMas, setMostrarMas] = useState(false);
    const libre = linea.tipoArticulo === "libre";
    const ivaIncluidoActivo = plugin("iva_incluido") === "activo";

    return (
        <QModal
            abierto={true}
            nombre="crear_linea_factura"
            titulo={t("documento.formLinea.crear")}
            onCerrar={cancelar}
        >
            <div className="CrearLinea">
                <quimera-formulario>
                    <ArticuloLinea
                        tipoArticulo={linea.tipoArticulo}
                        idArticulo={linea.idArticulo}
                        descripcionArticulo={linea.descripcionArticulo}
                        descripcion={linea.descripcion ?? ""}
                        nombre="idArticulo_nueva_linea_factura"
                        onChange={onArticuloCambiado}
                    />
                    <QInput label={t("documento.formLinea.cantidad")} {...lineaArticulo.uiProps("cantidad")} />
                    <QInput label={t("documento.formLinea.pvpUnitario")} {...lineaArticulo.uiProps("pvpUnitario")} />
                    <QInput label={t("documento.formLinea.total")} {...lineaArticulo.uiProps("pvpTotal")} />

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
                            <QInput label={t("documento.formLinea.descuento")} {...lineaArticulo.uiProps("dtoPorcentual")} />
                            <QInput label={t("documento.formLinea.dtoLineal")} {...lineaArticulo.uiProps("dtoLineal")} />

                            <div className="seccion-separador">Impuestos</div>
                            <GrupoIvaProducto {...lineaArticulo.uiProps("idGrupoIvaProducto")} soloLectura={!libre} />
                            <QInput label={t("documento.formLinea.iva")} {...lineaArticulo.uiProps("tipoIva")} soloLectura />
                            <QInput label={t("documento.formLinea.recargo")} {...lineaArticulo.uiProps("tipoRecargo")} soloLectura />
                            {ivaIncluidoActivo &&
                                <QCheckbox label={t("documento.formLinea.ivaIncluido")} {...lineaArticulo.uiProps("ivaIncluido")} soloLectura={!libre} />
                            }
                            <QInput label={t("documento.formLinea.irpf")} {...lineaArticulo.uiProps("tipoIrpf")} />
                        </>
                    )}
                </quimera-formulario>
                <div className="botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        Crear
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
