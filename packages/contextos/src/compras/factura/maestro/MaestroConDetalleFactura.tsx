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
import { CargarFichero } from "../vistas/cargar_fichero/CargarFichero.tsx";
import { CrearFactura } from "../crear/CrearFactura.tsx";
import { DetalleFactura } from "../detalle/DetalleFactura.tsx";
import { Factura } from "../diseño.ts";
import "./MaestroConDetalleFactura.css";
import { getMaquina } from "./maquina.ts";
import { metaTablaFactura } from "./metatabla_factura.tsx";
import { TarjetaFactura } from "./TarjetaFactura.tsx";


const criteriaFacturas = {
    ...criteriaDefecto,
    orden: ["fecha", "DESC"],
};

export const MaestroConDetalleFactura = () => {
    const t = useTCompras();
    // Columnas, filtros y widgets en el idioma activo: se rehacen al cambiarlo.
    const metaTabla = useMemo(() => metaTablaFactura(t), [t]);
    // Filtros con el nombre de campo de la API (snake_case): el modelo va en camelCase.
    const metaFiltro = useMemo(() => getMetaFiltroDefecto(metaTabla, { campoApi: camelASnake }), [metaTabla]);
    const widgets = useMemo(
        () => widgetsDocumentoCompra("compras.factura", {
            plural: t("factura.maestro.titulo"),
            total: t("factura.maestro.totalFacturado"),
            medio: t("factura.maestro.media"),
        }, t),
        [t]
    );
    const criteriaBase = useMemo(() => criteriaFacturas, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        facturas: listaActivaEntidadesInicial<Factura>(id, criteriaInicial),
    });

    const { estado, facturas } = ctx;

    useUrlParams(facturas.activo, facturas.criteria);

    useEffect(() => {
        emitir("recarga_de_facturas_solicitada", facturas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="ComprasFactura">
            <MaestroDetalle<Factura>
                Maestro={
                    <>
                        <h2>{t("factura.maestro.titulo")}</h2>
                        <Listado<Factura>
                            metaTabla={metaTabla}
                            metaFiltro={metaFiltro}
                            widgets={widgets}
                            criteria={facturas.criteria}
                            tarjeta={TarjetaFactura}
                            entidades={facturas.lista}
                            totalEntidades={facturas.total}
                            seleccionada={facturas.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_factura_solicitada")}>
                                        {t("factura.maestro.nueva")}
                                    </QBoton>
                                    <QBoton onClick={() => emitir("cargar_fichero_solicitado")} variante="borde">
                                        {t("factura.maestro.cargarFichero")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("factura_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleFactura id={facturas.activo} publicar={emitir} />}
                seleccionada={facturas.activo}
            />

            {estado === "CREANDO" && <CrearFactura publicar={emitir} />}
            {estado === "CARGANDO_FICHERO" && <CargarFichero publicar={emitir} />}
        </div>
    );
};
