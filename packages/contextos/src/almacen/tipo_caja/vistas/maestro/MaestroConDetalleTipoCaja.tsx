import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useLayout } from "@olula/lib/useLayout.js";
import { useEffect, useMemo } from "react";
import { TipoCaja } from "../../diseño.js";
import { CrearTipoCaja } from "../crear/CrearTipoCaja.js";
import { DetalleTipoCaja } from "../detalle/DetalleTipoCaja.js";
import "./MaestroConDetalleTipoCaja.css";
import { getMaquina } from "./maquina.js";
import { tAlmacen, useTAlmacen } from "../../../i18n/index.ts";

/**
 * Metadatos para renderizar la tabla.
 */
const metaTablaTipoCaja: MetaTabla<TipoCaja> = [
    { id: "id", cabecera: "ID" },
    { id: "descripcion", get cabecera() { return tAlmacen("tipo_caja.descripcion"); } },
    { id: "sku", cabecera: "SKU" },
    { id: "capacidad", get cabecera() { return tAlmacen("tipo_caja.capacidad"); }, tipo: "numero" },
];

/**
 * Componente principal: listado (maestro) + detalle.
 */
export const MaestroConDetalleTipoCaja = () => {

    const t = useTAlmacen();
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { layout, cambiarLayout } = useLayout("TARJETA");

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        tiposCaja: listaActivaEntidadesInicial<TipoCaja>(id, criteriaInicial),
    });

    const { estado, tiposCaja } = ctx;

    useUrlParams(tiposCaja.activo, tiposCaja.criteria);

    useEffect(() => {
        emitir("recarga_de_tipos_caja_solicitada", tiposCaja.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="TipoCaja">
            <MaestroDetalle<TipoCaja>
                Maestro={
                    <>
                        <h2>{t("tipo_caja.tiposDeCaja")}</h2>
                        <div className="maestro-botones">
                            <span
                                className="cambio-modo-icono"
                                onClick={cambiarLayout}
                            >
                                <QIcono
                                    nombre={layout === "TABLA" ? "lista" : "tabla"}
                                    tamaño="md"
                                />
                            </span>
                        </div>
                        <Listado<TipoCaja>
                            metaTabla={metaTablaTipoCaja}
                            criteria={tiposCaja.criteria}
                            modo={layout === "TARJETA" ? "tarjetas" : "tabla"}
                            tarjeta={TarjetaTipoCaja}
                            entidades={tiposCaja.lista}
                            totalEntidades={tiposCaja.total}
                            seleccionada={tiposCaja.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_tipo_caja_solicitado")}>
                                        {t("tipo_caja.nuevoTipoDeCaja")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("tipo_caja_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleTipoCaja id={tiposCaja.activo} publicar={emitir} />}
                layout={layout}
                seleccionada={tiposCaja.activo}
                modoDisposicion="maestro-50"
            />

            {/* Modales condicionales: se activan según el estado de la máquina */}
            {estado === "CREANDO" && (
                <CrearTipoCaja
                    publicar={emitir}
                />
            )}
        </div>
    );
};

/**
 * Componente tarjeta para la vista de lista en modo tarjetas.
 * Se define fuera del componente principal para evitar re-renders.
 */
const TarjetaTipoCaja = (tipoCaja: TipoCaja) => {
    return (
        <div className="tarjeta-tipo-caja" key={tipoCaja.id}>
            <div className="tarjeta-tipo-caja-descripcion">{tipoCaja.descripcion}</div>
            <div className="tarjeta-tipo-caja-sku">{tipoCaja.sku ?? "—"}</div>
        </div>
    );
};
