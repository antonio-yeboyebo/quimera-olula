import {
    ArticuloLinea,
    CamposArticuloLinea,
} from "#/compras/comun/componentes/articulo_linea/ArticuloLinea.tsx";
import { useAplicarImpuestoDefecto } from "#/almacen/config/useImpuestoDefecto.ts";
import { reinicioAlCambiarArticulo } from "#/compras/comun/dominio.ts";
import { GrupoIvaProducto } from "#/ventas/comun/componentes/grupo_iva_producto.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo, useState } from "react";
import { Albaran, NuevaLineaAlbaran } from "../diseño.ts";
import {
    camposConCambiosServidor,
    metaNuevaLineaAlbaran,
    nuevaLineaAlbaranVacia,
} from "../dominio.ts";
import { postLineaAlbaran, queryNuevaLineaAlbaran } from "../infraestructura.ts";
import "./CrearLineaAlbaran.css";
import { useTCompras } from "#/compras/i18n/index.ts";

export const CrearLineaAlbaran = ({
    albaran,
    publicar,
}: {
    albaran: Albaran;
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    const inicial = useMemo(nuevaLineaAlbaranVacia, []);

    const onModeloListo = useCallback(
        async (linea: NuevaLineaAlbaran, campo?: string) => {
            if (
                campo &&
                !(camposConCambiosServidor as readonly string[]).includes(campo)
            ) {
                return;
            }
            return await queryNuevaLineaAlbaran(albaran.id, linea);
        },
        [albaran.id]
    );

    const { modelo, uiProps, valido, set } = useModelo(
        metaNuevaLineaAlbaran,
        inicial,
        onModeloListo
    );
    useAplicarImpuestoDefecto({ modelo, set }, "grupoIvaProductoId", "linea");

    const onArticuloCambiado = useCallback(
        (cambios: Partial<CamposArticuloLinea>) => {
            set({
                ...modelo,
                ...cambios,
                ...reinicioAlCambiarArticulo(cambios),
            });
        },
        [modelo, set]
    );

    const crear_ = useCallback(async () => {
        const idLinea = await postLineaAlbaran(albaran.id, modelo);
        publicar("linea_creada", idLinea);
    }, [modelo, albaran.id, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_linea_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const [mostrarMas, setMostrarMas] = useState(false);

    return (
        <QModal
            abierto={true}
            nombre="crearLineaAlbaranCompra"
            titulo={t("comun.lineas.crear")}
            onCerrar={cancelar}
        >
            <div className="CrearLineaAlbaran">
                <quimera-formulario>
                    <ArticuloLinea
                        tipoArticulo={modelo.tipoArticulo}
                        referencia={modelo.referencia}
                        descripcionArticulo={modelo.descripcionArticulo}
                        descripcion={modelo.descripcion}
                        nombre="referenciaNuevaLineaAlbaranCompra"
                        onChange={onArticuloCambiado}
                        autoFocus
                    />
                    <QInput label={t("comun.lineas.cantidad")} {...uiProps("cantidad")} />
                    <QInput label={t("comun.lineas.costeUnitario")} {...uiProps("pvpUnitario")} />
                    <QInput label={t("comun.campos.total")} {...uiProps("pvpTotal")} soloLectura />

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
                            <QInput
                                label={t("comun.lineas.pctRecargo")}
                                {...uiProps("tipoRecargo")}
                                soloLectura
                            />
                            <QInput label={t("comun.lineas.pctIrpf")} {...uiProps("tipoIrpf")} />
                        </>
                    )}
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("comun.botones.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
