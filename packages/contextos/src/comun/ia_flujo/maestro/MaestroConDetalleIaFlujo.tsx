import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto, puede } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useLayout } from "@olula/lib/useLayout.js";
import { useEffect, useMemo } from "react";
import { CrearIaFlujo } from "../crear/CrearIaFlujo.js";
import { DetalleIaFlujo } from "../detalle/DetalleIaFlujo.js";
import { IaFlujo } from "../diseño.js";
import "./MaestroConDetalleIaFlujo.css";
import { getMaquina } from "./maquina.js";
import { tComun, useTComun } from "../../i18n/index.ts";

/**
 * Metadatos para renderizar la tabla del listado de flujos.
 */
const metaTablaIaFlujo: MetaTabla<IaFlujo> = [
    { id: 'nombre', get cabecera() { return tComun("iaFlujo.nombre"); } },
    { id: 'descripcionCorta', get cabecera() { return tComun("iaFlujo.descripcion"); } },
    { id: 'activo', get cabecera() { return tComun("iaFlujo.activo"); }, tipo: 'booleano' },
    { id: 'actualizadoEn', get cabecera() { return tComun("iaFlujo.actualizado"); }, tipo: 'fecha' },
];

/**
 * Componente principal: listado (maestro) + detalle de flujos de trabajo.
 */
export const MaestroConDetalleIaFlujo = () => {

    const t = useTComun();
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { layout, cambiarLayout } = useLayout("TARJETA");

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        iaFlujos: listaActivaEntidadesInicial<IaFlujo>(id, criteriaInicial),
    });

    const { estado, iaFlujos } = ctx;

    useUrlParams(iaFlujos.activo, iaFlujos.criteria);

    useEffect(() => {
        emitir("recarga_solicitada", iaFlujos.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="IaFlujo">
            <MaestroDetalle<IaFlujo>
                Maestro={
                    <>
                        <h2>{t("iaFlujo.flujosDeTrabajo")}</h2>
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
                        <Listado<IaFlujo>
                            metaTabla={metaTablaIaFlujo}
                            criteria={iaFlujos.criteria}
                            modo={layout === "TARJETA" ? "tarjetas" : "tabla"}
                            tarjeta={TarjetaIaFlujo}
                            entidades={iaFlujos.lista}
                            totalEntidades={iaFlujos.total}
                            seleccionada={iaFlujos.activo}
                            renderAcciones={() => (
                                puede("comun.ia_flujo") && (
                                    <div className="maestro-botones">
                                        <QBoton onClick={() => emitir("creacion_solicitada")}>
                                            {t("iaFlujo.nuevoFlujo")}
                                        </QBoton>
                                    </div>
                                )
                            )}
                            onSeleccion={(payload) => emitir("ia_flujo_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleIaFlujo id={iaFlujos.activo} publicar={emitir} />}
                layout={layout}
                seleccionada={iaFlujos.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && (
                <CrearIaFlujo
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
const TarjetaIaFlujo = (iaFlujo: IaFlujo) => {
    return (
        <div className="tarjeta-ia-flujo" key={iaFlujo.id}>
            <div className="tarjeta-ia-flujo-nombre">{iaFlujo.nombre}</div>
            <div className="tarjeta-ia-flujo-descripcion">{iaFlujo.descripcionCorta}</div>
            <div className={`tarjeta-ia-flujo-estado ${iaFlujo.activo ? "estado-activo" : "estado-inactivo"}`}>
                {iaFlujo.activo ? tComun("iaFlujo.activo") : tComun("iaFlujo.inactivo")}
            </div>
        </div>
    );
};
