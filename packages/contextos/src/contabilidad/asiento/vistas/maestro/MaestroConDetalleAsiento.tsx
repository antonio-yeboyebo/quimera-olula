import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado, MaestroDetalle } from "@olula/componentes/index.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto, plugin, puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { ItemAsiento } from "../../diseño.ts";
import { ejercicioActual, ejercicioIdParaRenumerar } from "../../dominio.ts";
import { CrearAsientoManual } from "../crear/CrearAsientoManual.tsx";
import { CrearAsientoDesdePlantilla } from "../desde_plantilla/CrearAsientoDesdePlantilla.tsx";
import { DetalleAsiento } from "../detalle/DetalleAsiento.tsx";
import { RenumerarAsientos } from "../renumerar/RenumerarAsientos.tsx";
import { metaTablaAsiento } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTContabilidad } from "../../../i18n/index.ts";

const criteriaAsientosDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [["ejercicio_id", "eq", ejercicioActual()]],
    orden: ["numero", "DESC"],
});

export const MaestroConDetalleAsiento = () => {
    const t = useTContabilidad();
    const criteriaBase = useMemo(criteriaAsientosDefecto, []);
    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        asientos: listaActivaEntidadesInicial<ItemAsiento>(id, criteriaInicial),
    });

    useUrlParams(ctx.asientos.activo, ctx.asientos.criteria);

    // crearRouter no comprueba permisos, así que la pantalla se monta aunque se
    // llegue por URL: la guarda tiene que estar aquí.
    const autorizado = puede("contabilidad.asiento");

    useEffect(() => {
        if (!autorizado) return;
        emitir("recarga_de_asientos_solicitada", ctx.asientos.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Opcional por instalación: el backend publica el plugin en /whoami.
    const renumerable = plugin("renumerar_asientos") === "activo";
    const ejercicioRenumerar = ejercicioIdParaRenumerar(ctx.asientos.criteria);

    if (!autorizado) {
        return <p>{t("asiento.noTienesPermisoParaVerLos")}</p>;
    }

    return (
        <div className="Asiento">
            <MaestroDetalle<ItemAsiento>
                seleccionada={ctx.asientos.activo}
                Maestro={
                    <>
                        <h2>{t("asiento.diarioDeAsientos")}</h2>
                        <Listado<ItemAsiento>
                            metaTabla={metaTablaAsiento}
                            criteria={ctx.asientos.criteria}
                            entidades={ctx.asientos.lista}
                            totalEntidades={ctx.asientos.total}
                            seleccionada={ctx.asientos.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_asiento_solicitado")}>
                                        {t("asiento.nuevoAsientoManual")}
                                    </QBoton>
                                    <QBoton
                                        variante="borde"
                                        onClick={() => emitir("crear_asiento_desde_plantilla_solicitado")}
                                    >
                                        {t("asiento.desdePlantilla")}
                                    </QBoton>
                                    {renumerable && (
                                        <QBoton
                                            variante="borde"
                                            onClick={() => emitir("renumerar_asientos_solicitado")}
                                        >
                                            {t("asiento.renumerarAsientos")}
                                        </QBoton>
                                    )}
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("asiento_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleAsiento id={ctx.asientos.activo} publicar={emitir} />}
            />
            {ctx.estado === "CREANDO" && <CrearAsientoManual publicar={emitir} ejercicioId={ejercicioActual()} />}
            {ctx.estado === "CREANDO_DESDE_PLANTILLA" && (
                <CrearAsientoDesdePlantilla publicar={emitir} ejercicioId={ejercicioActual()} />
            )}
            {ctx.estado === "RENUMERANDO" && (
                <RenumerarAsientos ejercicioId={ejercicioRenumerar} publicar={emitir} />
            )}
        </div>
    );
};
