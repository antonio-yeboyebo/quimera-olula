import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto, formatearFechaString } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { Inventario } from "../diseño.ts";
import { CrearInventario } from "../crear/CrearInventario.tsx";
import { DetalleInventario } from "../detalle/DetalleInventario.tsx";
import { getMaquina } from "./maquina.ts";
import { tAlmacen, useTAlmacen } from "../../i18n/index.ts";

const metaTablaInventario: MetaTabla<Inventario> = [
    { id: "id", get cabecera() { return tAlmacen("inventario.codigo"); }, estilo: "secundario" },
    { id: "almacen", get cabecera() { return tAlmacen("inventario.almacen"); }, esTitulo: true, render: (i: Inventario) => i.almacen ?? i.almacenId },
    { id: "fecha", get cabecera() { return tAlmacen("inventario.fecha"); }, tipo: "fecha" },
    { id: "hora", get cabecera() { return tAlmacen("inventario.hora"); }, prioridad: "baja", render: (i: Inventario) => i.hora?.slice(0, 8) ?? "" },
    { id: "observaciones", get cabecera() { return tAlmacen("inventario.descripcion"); }, prioridad: "media", render: (i: Inventario) => i.observaciones ?? "" },
];

export const MaestroConDetalleInventario = () => {
    const t = useTAlmacen();
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        inventarios: listaActivaEntidadesInicial<Inventario>(id, criteriaInicial),
    });

    const { estado, inventarios } = ctx;

    useUrlParams(inventarios.activo, inventarios.criteria);

    useEffect(() => {
        emitir("recarga_de_inventarios_solicitada", inventarios.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Inventario">
            <MaestroDetalle<Inventario>
                Maestro={
                    <>
                        <h2>{t("inventario.inventarios")}</h2>
                        <Listado<Inventario>
                            metaTabla={metaTablaInventario}
                            criteria={inventarios.criteria}
                            modoInicial="tabla"
                            tarjeta={TarjetaInventario}
                            entidades={inventarios.lista}
                            totalEntidades={inventarios.total}
                            seleccionada={inventarios.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_inventario_solicitado")}>
                                        {t("inventario.nuevoInventario")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("inventario_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleInventario id={inventarios.activo} publicar={emitir} />}
                seleccionada={inventarios.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && <CrearInventario publicar={emitir} />}
        </div>
    );
};

const TarjetaInventario = (inventario: Inventario) => (
    <div className="tarjeta-inventario" key={inventario.id}>
        <div className="tarjeta-inventario-codigo">
            {inventario.id} · {inventario.almacen ?? inventario.almacenId}
        </div>
        <div className="tarjeta-inventario-fecha">
            {formatearFechaString(inventario.fecha)} {inventario.hora?.slice(0, 8)}
        </div>
        {inventario.observaciones && (
            <div className="tarjeta-inventario-descripcion">{inventario.observaciones}</div>
        )}
    </div>
);
