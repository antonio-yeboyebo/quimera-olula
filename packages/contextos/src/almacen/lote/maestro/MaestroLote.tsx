import { Articulo } from "#/almacen/comun/componentes/Articulo.tsx";
import { MaestroSimple } from "#/produccion/comun/maestro_simple/MaestroSimple.tsx";
import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { filtroFechas, MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto, plugin, puede } from "@olula/lib/dominio.ts";
import { DetalleLote } from "../detalle/DetalleLote.tsx";
import { Lote } from "../diseño.ts";
import { ESTADOS_LOTE, etiquetaEstadoLote, fechaDdMmAaaa, formatearCantidad, textoArticulo } from "../dominio.ts";
import { getLote, getLotes } from "../infraestructura.ts";
import { RevisarTodosLotes } from "../revisar/RevisarTodosLotes.tsx";
import "./MaestroLote.css";
import { tAlmacen } from "../../i18n/index.ts";

const conProduccion = () => plugin("produccion") === "activo";

// Los id de columna son los campos de la API: con ellos se ordena.
const columnasBase: MetaTabla<Lote> = [
    { id: "id", get cabecera() { return tAlmacen("lote.codigo"); }, estilo: "secundario", prioridad: "alta" },
    { id: "sku", get cabecera() { return tAlmacen("lote.articulo"); }, estilo: "destacado", render: (l) => textoArticulo(l), prioridad: "alta" },
    { id: "caducidad", get cabecera() { return tAlmacen("lote.caducidad"); }, render: (l) => fechaDdMmAaaa(l.caducidad) },
    { id: "en_almacen", get cabecera() { return tAlmacen("lote.enAlmacen"); }, render: (l) => formatearCantidad(l.enAlmacen) },
];

const columnasProduccion: MetaTabla<Lote> = [
    {
        id: "estado",
        get cabecera() { return tAlmacen("lote.estado"); },
        render: (l) => (l.produccion ? <EtiquetaEstado {...etiquetaEstadoLote(l.produccion.estado)} /> : ""),
        prioridad: "alta",
    },
    { id: "cantidad_disponible", get cabecera() { return tAlmacen("lote.disponible"); }, render: (l) => formatearCantidad(l.produccion?.cantidadDisponible) },
    { id: "orden_id", get cabecera() { return tAlmacen("lote.orden"); }, render: (l) => l.produccion?.ordenId ?? "", prioridad: "baja" },
];

const metaTabla = (): MetaTabla<Lote> => (conProduccion() ? [...columnasBase, ...columnasProduccion] : columnasBase);

const filtrosBase: MetaFiltro = {
    id: {
        id: "id",
        get label() { return tAlmacen("lote.codigo"); },
        tipo: "texto",
        filtro: (v) => (v ? ["id", "~", v as string] : null),
    },
    sku: {
        id: "sku",
        get label() { return tAlmacen("lote.articulo"); },
        filtro: (v) => (v ? ["sku", "=", v as string] : null),
        render: (valor, onChange) => (
            <Articulo valor={(valor as string) ?? ""} nombre="sku" onChange={(opcion) => onChange(opcion?.valor ?? "")} />
        ),
    },
    caducidad: {
        id: "caducidad",
        get label() { return tAlmacen("lote.caducidad"); },
        tipo: "intervalo_fechas",
        filtro: (v) => filtroFechas("caducidad", v),
    },
};

// Estado y orden son columnas de producción: sin el plugin no existen.
const filtrosProduccion: MetaFiltro = {
    estado: {
        id: "estado",
        get label() { return tAlmacen("lote.estado"); },
        tipo: "multiseleccion",
        opciones: ESTADOS_LOTE,
        filtro: (valor) => {
            const elegidos = (valor as string[]) ?? [];
            if (elegidos.length === 0 || elegidos.length === ESTADOS_LOTE.length) return null;
            return ["estado", "in", elegidos as unknown as string];
        },
    },
    orden_id: {
        id: "orden_id",
        get label() { return tAlmacen("lote.ordenDeProduccion"); },
        tipo: "texto",
        filtro: (v) => (v ? ["orden_id", "~", v as string] : null),
    },
};

const metaFiltro = (): MetaFiltro => (conProduccion() ? { ...filtrosBase, ...filtrosProduccion } : filtrosBase);

/** Los más recientes primero (el código crece con el contador). */
const criteriaBase: Criteria = { ...criteriaDefecto, orden: ["id", "DESC"] };

const consultas = { getUno: getLote, getLista: getLotes };

/**
 * Almacén > Lotes (`lotes`): listado en modo tabla y ficha de solo lectura. Con el plugin
 * `produccion`, también su ficha de producción y su trazabilidad. «Revisar todos» recalcula las
 * cantidades de todos los lotes.
 */
export const MaestroLote = () => (
    <MaestroSimple<Lote>
        clase="MaestroLote"
        titulo={tAlmacen("lote.lotes")}
        metaTabla={metaTabla()}
        metaFiltro={metaFiltro()}
        consultas={consultas}
        criteriaBase={criteriaBase}
        accionesExtra={puede("almacen.lote.revisar") ? (recargar) => <RevisarTodosLotes recargar={recargar} /> : undefined}
        tarjeta={(l) => (
            <div key={l.id}>
                <div>
                    {l.id} · {textoArticulo(l)}{" "}
                    {l.produccion && <EtiquetaEstado {...etiquetaEstadoLote(l.produccion.estado)} />}
                </div>
                <div>
                    {formatearCantidad(l.enAlmacen)}{" "}{tAlmacen("lote.enAlmacen2")}
                    {l.caducidad ? tAlmacen("lote.caducaCaducidad", { caducidad: fechaDdMmAaaa(l.caducidad) }) : ""}
                </div>
            </div>
        )}
        detalle={(id, publicar) => <DetalleLote id={id} publicar={publicar} />}
    />
);
