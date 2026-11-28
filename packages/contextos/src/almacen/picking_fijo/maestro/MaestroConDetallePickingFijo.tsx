import { urlFicha } from "#/almacen/comun/fichas.ts";
import { filtroAlmacen } from "#/almacen/comun/componentes/FiltroAlmacen.tsx";
import { criteriaInicialSga } from "#/almacen/comun/preferencias.ts";
import { getMetaFiltroDefecto, MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { CrearPickingFijo } from "../crear/CrearPickingFijo.tsx";
import { DetallePickingFijo } from "../detalle/DetallePickingFijo.tsx";
import { PickingFijo } from "../diseño.ts";
import { getMaquina } from "./maquina.ts";
import { tAlmacen, useTAlmacen } from "../../i18n/index.ts";

const metaTablaPickingFijo: MetaTabla<PickingFijo> = [
    { id: "articulo", get cabecera() { return tAlmacen("picking_fijo.articulo"); }, render: (p) => `${p.articuloId} - ${p.articulo}`, enlace: (p) => urlFicha.articulo(p.articuloId) },
    { id: "ubicacion", get cabecera() { return tAlmacen("picking_fijo.ubicacion"); }, enlace: (p) => urlFicha.ubicacion(p.ubicacionId) },
    { id: "minimo", get cabecera() { return tAlmacen("picking_fijo.minimo"); }, tipo: "numero" },
    { id: "maximo", get cabecera() { return tAlmacen("picking_fijo.maximo"); }, tipo: "numero" },
    { id: "unidadReposicion", get cabecera() { return tAlmacen("picking_fijo.unidad"); }, tipo: "numero" },
    { id: "stock", get cabecera() { return tAlmacen("picking_fijo.stock"); }, tipo: "numero" },
];

const metaFiltroPickingFijo: MetaFiltro = {
    almacen: filtroAlmacen(),
    ...getMetaFiltroDefecto(metaTablaPickingFijo),
};

export const MaestroConDetallePickingFijo = () => {
    const t = useTAlmacen();
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteriaInicialSga(criteria, criteriaBase);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        pickings: listaActivaEntidadesInicial<PickingFijo>(id, criteriaInicial),
    });

    const { estado, pickings } = ctx;

    useUrlParams(pickings.activo, pickings.criteria);

    useEffect(() => {
        emitir("recarga_de_pickings_solicitada", pickings.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="PickingFijo">
            <MaestroDetalle<PickingFijo>
                Maestro={
                    <>
                        <h2>{t("picking_fijo.pickingFijo")}</h2>
                        <Listado<PickingFijo>
                            metaTabla={metaTablaPickingFijo}
                            metaFiltro={metaFiltroPickingFijo}
                            criteria={pickings.criteria}
                            modoInicial="tarjetas"
                            tarjeta={TarjetaPickingFijo}
                            entidades={pickings.lista}
                            totalEntidades={pickings.total}
                            seleccionada={pickings.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_picking_fijo_solicitado")}>
                                        {t("picking_fijo.nuevoPickingFijo")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("picking_fijo_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetallePickingFijo id={pickings.activo} publicar={emitir} />}
                seleccionada={pickings.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && <CrearPickingFijo publicar={emitir} />}
        </div>
    );
};

const TarjetaPickingFijo = (p: PickingFijo) => (
    <div className="tarjeta-picking-fijo" key={p.id}>
        <div>{p.articuloId} - {p.articulo}</div>
        <div>{p.ubicacion}</div>
        <div>{tAlmacen("picking_fijo.minMinimoMaxMaximoUnidadUnidadreposicion", { minimo: p.minimo, maximo: p.maximo, unidadReposicion: p.unidadReposicion })}</div>
        <div>{tAlmacen("picking_fijo.stockStock", { stock: p.stock })}</div>
    </div>
);
