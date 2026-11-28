import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto, formatearMoneda } from "@olula/lib/dominio.js";
import { PrecioArticulo } from "../diseño.ts";
import { pvpIgnorado, textoTramo } from "../dominio.ts";
import { localeActual } from "@olula/lib/i18n/i18n.ts";
import { tVentas } from "../../i18n/index.ts";

// Con anchos fijos la descripción ocupa el resto y se recorta con "…": sin
// ellos una descripción larga empuja las columnas de importes fuera de la vista.
// QTablaControlada pinta tal cual lo que devuelve `render`, así que los importes
// se formatean aquí; `tipo` solo sirve para alinearlos a la derecha.
const metaTabla = (): MetaTabla<PrecioArticulo> => [
    { id: "articuloId", cabecera: tVentas("precioArticulo.lista.referencia"), estilo: "secundario", ancho: "7rem" },
    { id: "descripcionArticulo", cabecera: tVentas("precioArticulo.lista.descripcion"), esTitulo: true },
    { id: "tramo", cabecera: tVentas("precioArticulo.lista.cantidad"), render: textoTramo, ancho: "8rem" },
    {
        id: "dtoPorcentual",
        cabecera: tVentas("precioArticulo.lista.dto"),
        tipo: "numero",
        ancho: "5rem",
        render: (p) => (p.dtoPorcentual ? `${p.dtoPorcentual.toLocaleString(localeActual())} %` : ""),
    },
    {
        id: "pvp",
        cabecera: tVentas("precioArticulo.lista.precioNeto"),
        tipo: "moneda",
        divisa: "EUR",
        ancho: "7rem",
        // Con descuento el pvp de la fila no se usa: no se enseña.
        render: (p) => (pvpIgnorado(p) || !p.pvp ? "" : formatearMoneda(p.pvp, "EUR")),
    },
];

export const PreciosArticuloLista = ({
    precios,
    seleccionado,
    publicar,
}: {
    precios: PrecioArticulo[];
    seleccionado?: string;
    publicar: EmitirEvento;
}) => (
    <ListadoSemiControlado
        metaTabla={metaTabla()}
        entidades={precios}
        totalEntidades={precios.length}
        cargando={false}
        seleccionada={precios.find((p) => p.id === seleccionado) ?? null}
        onSeleccion={(precio: PrecioArticulo) => publicar("precio_seleccionado", precio)}
        criteriaInicial={criteriaDefecto}
        onCriteriaChanged={() => null}
        modo="tabla"
    />
);
