import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ArticuloTarifa } from "../../diseño.js";
import { tVentas } from "../../../i18n/index.ts";

export const ArticulosTarifaLista = ({
    articulos,
    divisa,
    seleccionado,
    publicar,
}: {
    articulos: ArticuloTarifa[];
    divisa: string;
    seleccionado?: string;
    publicar: EmitirEvento;
}) => {
    const setSeleccionado = (articulo: ArticuloTarifa) => {
        publicar("articulo_seleccionado", articulo);
    };

    return (
        <ListadoSemiControlado
            metaTabla={getMetaTablaArticulos(divisa)}
            entidades={articulos}
            totalEntidades={articulos.length}
            cargando={false}
            seleccionada={articulos.find((a) => a.id === seleccionado) ?? null}
            onSeleccion={setSeleccionado}
            criteriaInicial={criteriaDefecto}
            onCriteriaChanged={() => null}
            modo="tabla"
        />
    );
};

const getMetaTablaArticulos = (divisa: string): MetaTabla<ArticuloTarifa> => [
    { id: "articuloId", cabecera: tVentas("tarifa.articulos.referencia") },
    { id: "descripcionArticulo", cabecera: tVentas("tarifa.articulos.descripcion"), esTitulo: true },
    { id: "precio", cabecera: tVentas("tarifa.articulos.precio"), tipo: "moneda", divisa: divisa || "EUR" },
];
