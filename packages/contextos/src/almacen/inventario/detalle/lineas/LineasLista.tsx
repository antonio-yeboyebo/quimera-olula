import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto, formatearNumero } from "@olula/lib/dominio.ts";
import { LineaInventario } from "../../diseño.ts";
import { tAlmacen } from "../../../i18n/index.ts";

const diferencia = (linea: LineaInventario) => linea.cantidadFinal - linea.cantidadInicial;

const metaTablaLineas: MetaTabla<LineaInventario> = [
    { id: "articuloId", get cabecera() { return tAlmacen("inventario.referencia"); }, estilo: "secundario" },
    { id: "descripcion", get cabecera() { return tAlmacen("inventario.descripcion"); }, esTitulo: true, render: (l) => l.descripcion ?? "" },
    { id: "cantidadFinal", get cabecera() { return tAlmacen("inventario.contado2"); }, tipo: "numero", estilo: "destacado" },
    { id: "cantidadInicial", get cabecera() { return tAlmacen("inventario.stockAnterior"); }, tipo: "numero", prioridad: "media" },
    {
        id: "diferencia",
        get cabecera() { return tAlmacen("inventario.diferencia2"); },
        prioridad: "media",
        render: (l) => {
            const d = diferencia(l);
            return d > 0 ? `+${formatearNumero(d)}` : formatearNumero(d);
        },
    },
    { id: "motivo", get cabecera() { return tAlmacen("inventario.motivo"); }, prioridad: "baja", render: (l) => l.motivo ?? "" },
    { id: "ubicacion", get cabecera() { return tAlmacen("inventario.ubicacion"); }, prioridad: "baja", render: (l) => l.ubicacion ?? "" },
];

/** Líneas del inventario en modo tabla: cada una regulariza un artículo. */
export const LineasLista = ({
    lineas,
    seleccionada,
    publicar,
}: {
    lineas: LineaInventario[];
    seleccionada?: string;
    publicar: EmitirEvento;
}) => (
    <ListadoSemiControlado
        metaTabla={metaTablaLineas}
        entidades={lineas}
        totalEntidades={lineas.length}
        cargando={false}
        seleccionada={lineas.find((l) => l.id === seleccionada) ?? null}
        onSeleccion={(linea: LineaInventario) => publicar("linea_seleccionada", linea)}
        criteriaInicial={criteriaDefecto}
        onCriteriaChanged={() => null}
        modo="tabla"
        mensajeSinDatos={tAlmacen("inventario.elInventarioNoTieneLineasAnadalas")}
    />
);
