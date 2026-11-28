import { widgetsDocumentoCompra } from "#/compras/comun/dominio.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { getMetaFiltroDefecto } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { camelASnake } from "@olula/componentes/maestro/maestroFiltros/dominio.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.ts";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.ts";
import { useEffect, useMemo } from "react";
import { useTCompras } from "#/compras/i18n/index.ts";
import { CrearAlbaran } from "../crear/CrearAlbaran.tsx";
import { DetalleAlbaran } from "../detalle/DetalleAlbaran.tsx";
import { Albaran } from "../diseño.ts";
import "./MaestroConDetalleAlbaran.css";
import { getMaquina } from "./maquina.ts";
import { metaTablaAlbaran } from "./metatabla_albaran.tsx";
import { TarjetaAlbaran } from "./TarjetaAlbaran.tsx";


const criteriaAlbaranes = {
    ...criteriaDefecto,
    orden: ["fecha", "DESC"],
};

export const MaestroConDetalleAlbaran = () => {
    const t = useTCompras();
    // Columnas, filtros y widgets en el idioma activo: se rehacen al cambiarlo.
    const metaTabla = useMemo(() => metaTablaAlbaran(t), [t]);
    // Filtros con el nombre de campo de la API (snake_case): el modelo va en camelCase.
    const metaFiltro = useMemo(() => getMetaFiltroDefecto(metaTabla, { campoApi: camelASnake }), [metaTabla]);
    const widgets = useMemo(
        () => widgetsDocumentoCompra("compras.albaran", {
            plural: t("albaran.maestro.titulo"),
            total: t("albaran.maestro.importeTotal"),
            medio: t("albaran.maestro.medio"),
        }, t),
        [t]
    );
    const criteriaBase = useMemo(() => criteriaAlbaranes, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        albaranes: listaActivaEntidadesInicial<Albaran>(id, criteriaInicial),
    });

    const { estado, albaranes } = ctx;

    useUrlParams(albaranes.activo, albaranes.criteria);

    useEffect(() => {
        emitir("recarga_de_albaranes_solicitada", albaranes.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="ComprasAlbaran">
            <MaestroDetalle<Albaran>
                Maestro={
                    <>
                        <h2>{t("albaran.maestro.titulo")}</h2>
                        <Listado<Albaran>
                            metaTabla={metaTabla}
                            metaFiltro={metaFiltro}
                            widgets={widgets}
                            criteria={albaranes.criteria}
                            tarjeta={TarjetaAlbaran}
                            entidades={albaranes.lista}
                            totalEntidades={albaranes.total}
                            seleccionada={albaranes.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_albaran_solicitado")}>
                                        {t("albaran.maestro.nuevo")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("albaran_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleAlbaran id={albaranes.activo} publicar={emitir} />}
                seleccionada={albaranes.activo}
            />

            {estado === "CREANDO" && <CrearAlbaran publicar={emitir} />}

        </div>
    );
};
