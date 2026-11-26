import { filtroAlmacen } from "#/almacen/comun/componentes/FiltroAlmacen.tsx";
import { criteriaInicialSga } from "#/almacen/comun/preferencias.ts";
import { getMetaFiltroDefecto, MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado } from "@olula/componentes/maestro/Listado.tsx";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { Ubicacion } from "../../diseño.ts";
import { CrearUbicacion } from "../crear/CrearUbicacion.tsx";
import { DetalleUbicacion } from "../detalle/DetalleUbicacion.tsx";
import { metaTablaUbicacion } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTAlmacen } from "../../../i18n/index.ts";

const metaFiltroUbicacion: MetaFiltro = {
    almacen: filtroAlmacen(),
    ...getMetaFiltroDefecto(metaTablaUbicacion),
};

export const MaestroConDetalleUbicacion = () => {
    const t = useTAlmacen();
    const { id, criteria } = getUrlParams();

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        ubicaciones: listaActivaEntidadesInicial<Ubicacion>(id, criteriaInicialSga(criteria, criteriaDefecto)),
    });

    useUrlParams(ctx.ubicaciones.activo, ctx.ubicaciones.criteria);

    useEffect(() => {
        emitir("recarga_de_ubicaciones_solicitada", ctx.ubicaciones.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Ubicacion">
            <MaestroDetalle<Ubicacion>
                Maestro={
                    <>
                        <h2>{t("ubicacion.ubicaciones")}</h2>
                        <Listado<Ubicacion>
                            metaTabla={metaTablaUbicacion}
                            metaFiltro={metaFiltroUbicacion}
                            criteria={ctx.ubicaciones.criteria}
                            modoInicial="tabla"
                            tarjeta={TarjetaUbicacion}
                            entidades={ctx.ubicaciones.lista}
                            totalEntidades={ctx.ubicaciones.total}
                            seleccionada={ctx.ubicaciones.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear")}>{t("ubicacion.nueva")}</QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("ubicacion_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={
                    <DetalleUbicacion
                        id={ctx.ubicaciones.activo}
                        publicar={emitir}
                    />
                }
                seleccionada={ctx.ubicaciones.activo}
                modoDisposicion="maestro-50"
            />
            {ctx.estado === "CREANDO" && (
                <CrearUbicacion publicar={emitir} activo={true} />
            )}
        </div>
    );
};

const TarjetaUbicacion = (ubicacion: Ubicacion) => {
    return (
        <div className="tarjeta-ubicacion" key={ubicacion.id}>
            <div>{ubicacion.codigo}</div>
            <div>{ubicacion.zona}</div>
        </div>
    );
};
