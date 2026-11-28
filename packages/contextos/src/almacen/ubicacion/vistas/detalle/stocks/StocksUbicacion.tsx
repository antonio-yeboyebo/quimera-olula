import { urlFicha } from "#/almacen/comun/fichas.ts";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { MovimientosStockUbicacion } from "#/almacen/comun/componentes/MovimientosStockUbicacion.tsx";
import { StockUbicacionItem } from "../../../diseño.ts";
import { tAlmacen } from "../../../../i18n/index.ts";

const ExpansionMovimientos = ({ entidad }: { entidad: StockUbicacionItem }) => (
    <MovimientosStockUbicacion stockUbicacionId={entidad.id} />
);

const metaTablaStocks: MetaTabla<StockUbicacionItem> = {
    cols: [
        { id: "articulo", get cabecera() { return tAlmacen("ubicacion.articulo"); }, enlace: (s) => urlFicha.articulo(s.articuloId) },
        { id: "cantidadFisica", get cabecera() { return tAlmacen("ubicacion.cantidadFisica"); }, tipo: "numero" },
    ],
    expansion: ExpansionMovimientos,
};

export const StocksUbicacion = ({ stocks }: { stocks: StockUbicacionItem[] }) => {
    return (
        <ListadoSemiControlado
            metaTabla={metaTablaStocks}
            entidades={stocks}
            totalEntidades={stocks.length}
            cargando={false}
            seleccionada={null}
            onSeleccion={() => {}}
            criteriaInicial={criteriaDefecto}
            onCriteriaChanged={() => null}
            modo="tabla"
        />
    );
};
