import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { CrearAmortizacion } from "../crear/CrearAmortizacion.tsx";
import { DetalleAmortizacion } from "../detalle/DetalleAmortizacion.tsx";
import { Amortizacion } from "../diseño.ts";
import { DeshacerDotaciones } from "../generar/DeshacerDotaciones.tsx";
import { GenerarDotaciones } from "../generar/GenerarDotaciones.tsx";
import {
    criteriaAmortizacionesDefecto,
    metaFiltroAmortizacion,
    metaTablaAmortizacion,
} from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTContabilidad } from "../../i18n/index.ts";

/**
 * Amortizaciones (Eneboo `co_amortizaciones`, maestro
 * `co_masteramortizaciones`): fichas de los elementos de inmovilizado, botón
 * «Generar dotaciones» (con su asiento de amortización) y deshacerlas.
 */
export const MaestroConDetalleAmortizacion = () => {

    const t = useTContabilidad();
    const criteriaInicial = useMemo(criteriaAmortizacionesDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        amortizaciones: listaActivaEntidadesInicial<Amortizacion>(undefined, criteriaInicial),
    });

    const { estado, amortizaciones } = ctx;

    const autorizado = puede("contabilidad.asiento");

    useEffect(() => {
        if (!autorizado) return;
        emitir("recarga_de_amortizaciones_solicitada", amortizaciones.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!autorizado) {
        return <p>{t("amortizacion.noTienesPermisoParaVerLas")}</p>;
    }

    return (
        <div className="Amortizacion">
            <MaestroDetalle<Amortizacion>
                seleccionada={amortizaciones.activo}
                Maestro={
                    <>
                        <h2>{t("amortizacion.amortizaciones")}</h2>
                        <Listado<Amortizacion>
                            metaTabla={metaTablaAmortizacion}
                            metaFiltro={metaFiltroAmortizacion}
                            criteria={amortizaciones.criteria}
                            modoInicial="tabla"
                            entidades={amortizaciones.lista}
                            totalEntidades={amortizaciones.total}
                            seleccionada={amortizaciones.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_amortizacion_solicitado")}>
                                        {t("amortizacion.nuevaAmortizacion")}
                                    </QBoton>
                                    <QBoton variante="borde"
                                        onClick={() => emitir("generar_dotaciones_solicitado")}>
                                        {t("amortizacion.generarDotaciones")}
                                    </QBoton>
                                    <QBoton variante="borde"
                                        onClick={() => emitir("deshacer_dotaciones_solicitado")}>
                                        {t("amortizacion.deshacerDotaciones")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("amortizacion_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={
                    <DetalleAmortizacion id={amortizaciones.activo} publicar={emitir} />
                }
            />

            {estado === "CREANDO" && <CrearAmortizacion publicar={emitir} />}
            {estado === "GENERANDO" && <GenerarDotaciones publicar={emitir} />}
            {estado === "DESHACIENDO" && <DeshacerDotaciones publicar={emitir} />}
        </div>
    );
};
