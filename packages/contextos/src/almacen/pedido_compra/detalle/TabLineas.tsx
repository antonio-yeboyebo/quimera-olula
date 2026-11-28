import { urlFicha } from "#/almacen/comun/fichas.ts";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { LineaPedidoCompra } from "../diseño.ts";
import "./TabLineas.css";
import { tAlmacen } from "../../i18n/index.ts";

const metaTablaLineas: MetaTabla<LineaPedidoCompra> = {
    cols: [
        { id: "sku", cabecera: "SKU", enlace: (l) => urlFicha.articulo(l.sku) },
        { id: "descripcion", get cabecera() { return tAlmacen("pedido_compra.descripcion"); }, tipo: "texto" },
        { id: "cantidad", get cabecera() { return tAlmacen("pedido_compra.cantidad"); }, tipo: "numero" },
        { id: "cantidadRecibida", get cabecera() { return tAlmacen("pedido_compra.recibida"); }, tipo: "numero" },
        { id: "cerrada", get cabecera() { return tAlmacen("pedido_compra.cerrada"); }, tipo: "booleano" },
    ],
};

export const TabLineas = ({ lineas }: { lineas: LineaPedidoCompra[] }) => {
    return (
        <div className="TabLineas">
            <ListadoSemiControlado
                metaTabla={metaTablaLineas}
                entidades={lineas}
                totalEntidades={lineas.length}
                cargando={false}
                seleccionada={null}
                onSeleccion={() => {}}
                criteriaInicial={criteriaDefecto}
                onCriteriaChanged={() => null}
                modo="tabla"
            />
        </div>
    );
};
