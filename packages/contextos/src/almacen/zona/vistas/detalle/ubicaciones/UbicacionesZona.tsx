import { urlFicha } from "#/almacen/comun/fichas.ts";
import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { Criteria, EmitirEvento } from "@olula/lib/diseño.ts";
import { useState } from "react";
import { descripcionEstadoUbicacion } from "#/almacen/ubicacion/dominio.ts";
import { StockUbicacionItem, Ubicacion } from "#/almacen/ubicacion/diseño.ts";
import { getStocksUbicacion } from "#/almacen/ubicacion/infraestructura.ts";
import { StocksUbicacion } from "#/almacen/ubicacion/vistas/detalle/stocks/StocksUbicacion.tsx";
import { tAlmacen, useTAlmacen } from "../../../../i18n/index.ts";

const metaTablaUbicaciones: MetaTabla<Ubicacion> = [
    { id: "codigo", get cabecera() { return tAlmacen("zona.codigo"); }, enlace: (u) => urlFicha.ubicacion(u.id) },
    { id: "pasillo", get cabecera() { return tAlmacen("zona.pasillo"); } },
    { id: "modulo", get cabecera() { return tAlmacen("zona.modulo"); } },
    { id: "nivel", get cabecera() { return tAlmacen("zona.nivel"); } },
    { id: "hueco", get cabecera() { return tAlmacen("zona.hueco"); } },
    { id: "tipoUbicacion", get cabecera() { return tAlmacen("zona.tipo"); }, enlace: (u) => urlFicha.tipoUbicacion(u.tipoUbicacionId) },
    { id: "estado", get cabecera() { return tAlmacen("zona.estado"); }, render: (u) => descripcionEstadoUbicacion(u.estado) },
];

/** Ubicaciones de la zona, paginadas en el servidor: cada cambio de página u orden se publica
 *  como "criteria_ubicaciones_cambiada" para que el detalle pida esa página. */
export const UbicacionesZona = ({
    ubicaciones,
    total,
    criteria,
    publicar,
}: {
    ubicaciones: Ubicacion[];
    total: number;
    criteria: Criteria;
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<Ubicacion | null>(null);
    const [stocks, setStocks] = useState<StockUbicacionItem[]>([]);

    const seleccionarUbicacion = async (ubicacion: Ubicacion) => {
        setUbicacionSeleccionada(ubicacion);
        const stocksUbicacion = await getStocksUbicacion(ubicacion.id);
        setStocks(stocksUbicacion);
    };

    return (
        <div className="UbicacionesZona">
            <ListadoSemiControlado
                metaTabla={metaTablaUbicaciones}
                entidades={ubicaciones}
                totalEntidades={total}
                cargando={false}
                seleccionada={ubicacionSeleccionada}
                onSeleccion={seleccionarUbicacion}
                criteriaInicial={criteria}
                onCriteriaChanged={(c) => publicar("criteria_ubicaciones_cambiada", c)}
                modo="tabla"
            />
            {ubicacionSeleccionada && (
                <div className="UbicacionesZona-stocks">
                    <h4>{t("zona.stockDeLaUbicacion")}</h4>
                    <StocksUbicacion stocks={stocks} />
                </div>
            )}
        </div>
    );
};
