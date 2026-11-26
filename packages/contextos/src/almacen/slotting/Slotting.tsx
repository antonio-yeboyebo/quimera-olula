import { urlFicha } from "#/almacen/comun/fichas.ts";
import { useEffect, useState } from "react";
import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { Articulo } from "#/almacen/comun/componentes/Articulo.tsx";
import { Ubicacion } from "#/almacen/comun/componentes/Ubicacion.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/index.js";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Entidad } from "@olula/lib/diseño.ts";
import { AjusteMigracion, ArticuloAbc, ClaseAbc, FilaPickingFijo, PropuestaUbicacion, Recolocacion } from "./diseño.ts";
import {
    clasesPicking, COBERTURA_POR_DEFECTO, DIAS_POR_DEFECTO, enteroPositivo, errorValidacionFila,
    explicacionAbc, explicacionCantidadesPicking, filaPickingMarcable, filasPickingACrear,
    origenesRotacion, puedeUbicarMigracion, REPOSICION_POR_DEFECTO, resumenMigracion,
    textoDestinoRecolocacion, todasPickingMarcadas,
} from "./dominio.ts";
import "#/comun/estilos/pagina_proceso.css";
import "./Slotting.css";
import { contextoSlottingDeEntrada, preferenciasSlotting, getMaquina } from "./maquina.ts";
import { tAlmacen, useTAlmacen } from "../i18n/index.ts";

const varianteClase = { A: "exito", B: "advertencia", C: "error" } as const;

export const InsigniaClase = ({ clase }: { clase: ClaseAbc }) => (
    <QEtiqueta variante={varianteClase[clase]}>{clase}</QEtiqueta>
);

export const Slotting = () => {
    const tx = useTAlmacen();
    const { ctx, emitir } = useMaquina(getMaquina, contextoSlottingDeEntrada());
    const { almacenId } = ctx;
    const [pestana] = useState(() => preferenciasSlotting.obtener().pestana);

    // Con almacén de trabajo o un enlace, el ABC se calcula de entrada.
    useEffect(() => {
        if (almacenId) emitir("abc_solicitado");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Slotting PaginaProceso">
            <h2>{tx("slotting.slotting")}</h2>

            <quimera-formulario>
                <Almacen
                    label={tx("slotting.almacen")}
                    nombre="almacenId"
                    valor={almacenId}
                    onChange={(opcion) => emitir("almacen_cambiado", opcion?.valor ?? "")}
                />
                <QSelect
                    label={tx("slotting.rotacionSegun")}
                    nombre="origen"
                    valor={ctx.origen}
                    opciones={origenesRotacion}
                    onChange={(opcion) => emitir("origen_cambiado", opcion?.valor ?? "")}
                />
            </quimera-formulario>

            <Tabs
                tabInicial={pestana}
                onCambio={(indice) => preferenciasSlotting.guardar({ pestana: indice })}
                children={[
                    <Tab key="abc" label="ABC">
                        <div className="slotting-explicacion">
                            <strong>{tx("slotting.comoSeCalcula")}</strong>
                            <ul>
                                {explicacionAbc(ctx.origen, enteroPositivo(ctx.diasAbc, DIAS_POR_DEFECTO)).map((t) => (
                                    <li key={t}>{t}</li>
                                ))}
                            </ul>
                        </div>
                        <quimera-formulario>
                            <QInput
                                label={tx("slotting.dias")} nombre="diasAbc" tipo="numero" valor={ctx.diasAbc}
                                onChange={(v: string) => emitir("dias_abc_cambiados", v)}
                            />
                        </quimera-formulario>
                        <div className="botones maestro-botones">
                            <QBoton deshabilitado={!almacenId} onClick={() => emitir("abc_solicitado")}>
                                {tx("slotting.calcular")}
                            </QBoton>
                        </div>
                        {ctx.abc && (ctx.abc.length === 0 ? <p>{tx("slotting.noHayMovimientoEnElPeriodo")}</p> : <TablaAbc abc={ctx.abc} />)}
                    </Tab>,
                    <Tab key="picking" label={tx("slotting.asignarPickingFijo")}>
                        <div className="slotting-explicacion">
                            <strong>{tx("slotting.comoSeCalculanLasCantidades")}</strong>
                            <ul>
                                {explicacionCantidadesPicking(
                                    enteroPositivo(ctx.coberturaPicking, COBERTURA_POR_DEFECTO),
                                    enteroPositivo(ctx.reposicionPicking, REPOSICION_POR_DEFECTO)
                                ).map((t) => <li key={t}>{t}</li>)}
                            </ul>
                        </div>
                        <quimera-formulario>
                            <QInput
                                label={tx("slotting.dias")} nombre="diasPicking" tipo="numero" valor={ctx.diasPicking}
                                onChange={(v: string) => emitir("dias_picking_cambiados", v)}
                            />
                            <QSelect
                                label={tx("slotting.clases")} nombre="clasesPicking" valor={ctx.clasesPicking}
                                opciones={clasesPicking}
                                onChange={(opcion) => emitir("clases_picking_cambiadas", opcion?.valor ?? "")}
                            />
                            <QInput
                                label={tx("slotting.coberturaDias")} nombre="coberturaPicking" tipo="numero"
                                valor={ctx.coberturaPicking}
                                onChange={(v: string) => emitir("cobertura_picking_cambiada", v)}
                            />
                            <QInput
                                label={tx("slotting.reposicionDias")} nombre="reposicionPicking" tipo="numero"
                                valor={ctx.reposicionPicking}
                                onChange={(v: string) => emitir("reposicion_picking_cambiada", v)}
                            />
                        </quimera-formulario>
                        <div className="botones maestro-botones">
                            <QBoton deshabilitado={!almacenId} onClick={() => emitir("picking_solicitado")}>
                                {tx("slotting.proponer")}
                            </QBoton>
                            {ctx.filasPicking && ctx.filasPicking.some(filaPickingMarcable) && (
                                <QBoton
                                    variante="texto"
                                    onClick={() => emitir(
                                        "seleccion_picking_cambiada",
                                        !todasPickingMarcadas(ctx.filasPicking ?? [])
                                    )}
                                >
                                    {todasPickingMarcadas(ctx.filasPicking) ? tx("slotting.desmarcarTodos") : tx("slotting.marcarTodos")}
                                </QBoton>
                            )}
                            {ctx.filasPicking && (
                                <QBoton
                                    deshabilitado={filasPickingACrear(ctx.filasPicking).length === 0}
                                    onClick={() => emitir("picking_fijo_creacion_solicitada")}
                                >
                                    {tx("slotting.crearPickingFijoSeleccionados")}
                                </QBoton>
                            )}
                        </div>
                        {ctx.resumenPicking && <p className="resumen-picking">{ctx.resumenPicking}</p>}
                        {ctx.filasPicking && (ctx.filasPicking.length === 0
                            ? <p>{tx("slotting.noHayArticulosSinPickingFijo")}</p>
                            : <TablaPickingFijo
                                filas={ctx.filasPicking}
                                onCambio={(articuloId, cambios) => emitir("fila_picking_cambiada", { articuloId, cambios })}
                            />)}
                    </Tab>,
                    <Tab key="propuesta" label={tx("slotting.propuestaDeUbicacion")}>
                        <quimera-formulario>
                            <Articulo
                                valor={ctx.articuloId}
                                onChange={(opcion) => emitir("articulo_cambiado", opcion?.valor ?? "")}
                            />
                            <QInput
                                label={tx("slotting.limite")} nombre="limitePropuesta" tipo="numero" valor={ctx.limitePropuesta}
                                onChange={(v: string) => emitir("limite_propuesta_cambiado", v)}
                            />
                        </quimera-formulario>
                        <div className="botones maestro-botones">
                            <QBoton
                                deshabilitado={!almacenId || !ctx.articuloId}
                                onClick={() => emitir("propuesta_solicitada")}
                            >
                                {tx("slotting.proponer")}
                            </QBoton>
                        </div>
                        {ctx.propuesta && <ResultadoPropuesta propuesta={ctx.propuesta} />}
                    </Tab>,
                    <Tab key="recolocacion" label={tx("slotting.recolocacion")}>
                        <quimera-formulario>
                            <QInput
                                label={tx("slotting.dias")} nombre="diasRecolocacion" tipo="numero" valor={ctx.diasRecolocacion}
                                onChange={(v: string) => emitir("dias_recolocacion_cambiados", v)}
                            />
                            <QInput
                                label={tx("slotting.limite")} nombre="limiteRecolocacion" tipo="numero" valor={ctx.limiteRecolocacion}
                                onChange={(v: string) => emitir("limite_recolocacion_cambiado", v)}
                            />
                        </quimera-formulario>
                        <div className="botones maestro-botones">
                            <QBoton deshabilitado={!almacenId} onClick={() => emitir("recolocacion_solicitada")}>
                                {tx("slotting.calcular")}
                            </QBoton>
                        </div>
                        {ctx.recolocaciones &&
                            (ctx.recolocaciones.length === 0
                                ? <p>{tx("slotting.noHayRecolocacionesQueProponer")}</p>
                                : <TablaRecolocacion recolocaciones={ctx.recolocaciones} />)}
                    </Tab>,
                    <Tab key="migracion" label={tx("slotting.migracion")}>
                        <div className="slotting-explicacion">
                            <strong>{tx("slotting.ubicarElStockSinUbicar")}</strong>
                            <ul>
                                <li>{tx("slotting.mueveALaUbicacionElegidaP")}</li>
                                <li>{tx("slotting.porCadaArticuloCreaUnPar")}</li>
                                <li>{tx("slotting.articulosPorLotesPorLoteCon")}</li>
                                <li>{tx("slotting.sePuedeRepetirUbicaLoNuevo")}</li>
                            </ul>
                        </div>
                        <quimera-formulario>
                            <Ubicacion
                                label={tx("slotting.ubicacionDestino")} nombre="ubicacionMigracion"
                                valor={ctx.ubicacionMigracionId} descripcion={ctx.ubicacionMigracion}
                                onChange={(opcion) => emitir("ubicacion_migracion_cambiada", opcion)}
                            />
                        </quimera-formulario>
                        <div className="botones maestro-botones">
                            <QBoton
                                variante="texto"
                                deshabilitado={!almacenId || !ctx.ubicacionMigracionId}
                                onClick={() => emitir("migracion_simulada")}
                            >
                                {tx("slotting.simular")}
                            </QBoton>
                            <QBoton
                                deshabilitado={!puedeUbicarMigracion(ctx.resultadoMigracion)}
                                onClick={() => emitir("migracion_solicitada")}
                            >
                                {tx("slotting.ubicar")}
                            </QBoton>
                        </div>
                        {ctx.resultadoMigracion && (
                            <>
                                <p className="resumen-picking">{resumenMigracion(ctx.resultadoMigracion)}</p>
                                {ctx.resultadoMigracion.ajustes.length > 0 && (
                                    <TablaMigracion ajustes={ctx.resultadoMigracion.ajustes} />
                                )}
                            </>
                        )}
                    </Tab>,
                ]}
            />
        </div>
    );
};

type Fila<T> = Entidad & T;

const conId = <T,>(filas: T[], id: (f: T, i: number) => string): Fila<T>[] =>
    filas.map((f, i) => ({ ...f, id: id(f, i) }) as Fila<T>);

const metaTablaAbc: MetaTabla<Fila<ArticuloAbc>> = [
    { id: "articuloId", get cabecera() { return tAlmacen("slotting.articulo"); }, estilo: "destacado", enlace: (a) => urlFicha.articulo(a.articuloId) },
    { id: "descripcion", get cabecera() { return tAlmacen("slotting.descripcion"); }, ancho: "40%" },
    { id: "lineas", get cabecera() { return tAlmacen("slotting.lineas"); }, tipo: "numero" },
    { id: "unidades", get cabecera() { return tAlmacen("slotting.unidades"); }, tipo: "numero" },
    { id: "porcentajeAcumulado", get cabecera() { return tAlmacen("slotting.acumulado"); }, tipo: "numero" },
    { id: "clase", get cabecera() { return tAlmacen("slotting.clase"); }, render: (a) => <InsigniaClase clase={a.clase} /> },
];

const TablaAbc = ({ abc }: { abc: ArticuloAbc[] }) => (
    <QTabla<Fila<ArticuloAbc>>
        metaTabla={metaTablaAbc}
        datos={conId(abc, (a) => a.articuloId)}
        cargando={false}
        orden={[]}
    />
);

type UbicacionPropuestaFila = PropuestaUbicacion["ubicaciones"][number];

const metaTablaPropuesta: MetaTabla<Fila<UbicacionPropuestaFila>> = [
    { id: "ubicacion", get cabecera() { return tAlmacen("slotting.ubicacion"); }, estilo: "destacado", enlace: (u) => urlFicha.ubicacion(u.ubicacionId) },
    { id: "zona", get cabecera() { return tAlmacen("slotting.zona"); } },
    { id: "accesibilidad", get cabecera() { return tAlmacen("slotting.accesibilidad"); }, tipo: "numero" },
    { id: "claseUbicacion", get cabecera() { return tAlmacen("slotting.clase"); }, render: (u) => <InsigniaClase clase={u.claseUbicacion} /> },
];

const ResultadoPropuesta = ({ propuesta }: { propuesta: PropuestaUbicacion }) => (
    <div className="resultado-propuesta">
        <p>{tAlmacen("slotting.claseDelArticulo")}{" "}<InsigniaClase clase={propuesta.clase} /></p>
        {propuesta.ubicaciones.length === 0 ? (
            <p>{tAlmacen("slotting.noHayUbicacionesVaciasDisponibles")}</p>
        ) : (
            <QTabla<Fila<UbicacionPropuestaFila>>
                metaTabla={metaTablaPropuesta}
                datos={conId(propuesta.ubicaciones, (u) => u.ubicacionId)}
                cargando={false}
                orden={[]}
            />
        )}
    </div>
);

const metaTablaRecolocacion: MetaTabla<Fila<Recolocacion>> = [
    { id: "articuloId", get cabecera() { return tAlmacen("slotting.articulo"); }, estilo: "destacado", enlace: (r) => urlFicha.articulo(r.articuloId) },
    { id: "clase", get cabecera() { return tAlmacen("slotting.clase"); }, render: (r) => <InsigniaClase clase={r.clase} /> },
    { id: "ubicacion", get cabecera() { return tAlmacen("slotting.ubicacionActual"); } },
    { id: "claseUbicacion", get cabecera() { return tAlmacen("slotting.claseUbicacion"); }, render: (r) => <InsigniaClase clase={r.claseUbicacion} /> },
    { id: "accion", get cabecera() { return tAlmacen("slotting.accion"); }, render: (r) => (r.accion === "INTERCAMBIAR" ? tAlmacen("slotting.intercambiar") : tAlmacen("slotting.mover")) },
    { id: "destino", get cabecera() { return tAlmacen("slotting.destino"); }, render: (r) => textoDestinoRecolocacion(r) },
    { id: "beneficio", get cabecera() { return tAlmacen("slotting.beneficio"); }, tipo: "numero" },
];

const TablaRecolocacion = ({ recolocaciones }: { recolocaciones: Recolocacion[] }) => (
    <QTabla<Fila<Recolocacion>>
        metaTabla={metaTablaRecolocacion}
        datos={conId(recolocaciones, (r, i) => `${r.articuloId}-${r.ubicacion}-${i}`)}
        cargando={false}
        orden={[]}
    />
);

const InputNumero = ({ valor, deshabilitado, onCambio }: {
    valor: number; deshabilitado: boolean; onCambio: (n: number) => void;
}) => (
    <input
        type="number" className="slotting-input-numero" value={Number.isNaN(valor) ? "" : valor}
        disabled={deshabilitado}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onCambio(e.target.value === "" ? NaN : Number(e.target.value))}
    />
);

const estadoFila = (f: FilaPickingFijo) => {
    if (f.estado === "CREADO") return <QEtiqueta variante="exito">{tAlmacen("slotting.creado")}</QEtiqueta>;
    if (f.estado === "ERROR") return <span className="slotting-error">{f.errorCreacion}</span>;
    const error = f.ubicacionId ? errorValidacionFila(f) : null;
    return error ? <span className="slotting-error">{error}</span> : null;
};

const TablaPickingFijo = ({ filas, onCambio }: {
    filas: FilaPickingFijo[];
    onCambio: (articuloId: string, cambios: Partial<FilaPickingFijo>) => void;
}) => {
    const metaTabla: MetaTabla<Fila<FilaPickingFijo>> = [
        {
            id: "seleccionada", cabecera: "", ancho: "40px",
            render: (f) => (
                <input
                    type="checkbox" checked={f.seleccionada} disabled={!filaPickingMarcable(f)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onCambio(f.articuloId, { seleccionada: e.target.checked })}
                />
            ),
        },
        { id: "articuloId", cabecera: tAlmacen("slotting.articulo"), estilo: "destacado", enlace: (f) => urlFicha.articulo(f.articuloId) },
        { id: "descripcion", cabecera: tAlmacen("slotting.descripcion"), ancho: "25%" },
        { id: "clase", cabecera: tAlmacen("slotting.clase"), render: (f) => <InsigniaClase clase={f.clase} /> },
        { id: "lineas", cabecera: tAlmacen("slotting.lineas"), tipo: "numero" },
        {
            id: "ubicacion", cabecera: tAlmacen("slotting.ubicacion"),
            render: (f) => f.ubicacion ?? <span className="slotting-sin-hueco">{tAlmacen("slotting.sinHuecoLibre")}</span>,
            enlace: (f) => urlFicha.ubicacion(f.ubicacionId),
        },
        { id: "zona", cabecera: tAlmacen("slotting.zona"), render: (f) => f.zona ?? "" },
        ...(["minimo", "maximo", "unidadReposicion"] as const).map((campo) => ({
            id: campo,
            cabecera: { minimo: tAlmacen("slotting.minimo"), maximo: tAlmacen("slotting.maximo"), unidadReposicion: tAlmacen("slotting.unidad") }[campo],
            render: (f: Fila<FilaPickingFijo>) => (
                <InputNumero
                    valor={f[campo]} deshabilitado={!filaPickingMarcable(f)}
                    onCambio={(n) => onCambio(f.articuloId, { [campo]: n, estado: "PENDIENTE", errorCreacion: null })}
                />
            ),
        })),
        { id: "estado", cabecera: tAlmacen("slotting.estado"), ancho: "20%", render: estadoFila },
    ];
    return (
        <QTabla<Fila<FilaPickingFijo>>
            metaTabla={metaTabla}
            datos={conId(filas, (f) => f.articuloId)}
            cargando={false}
            orden={[]}
        />
    );
};

const metaTablaMigracion: MetaTabla<Fila<AjusteMigracion>> = [
    { id: "articuloId", get cabecera() { return tAlmacen("slotting.articulo"); }, estilo: "destacado", enlace: (a) => urlFicha.articulo(a.articuloId) },
    { id: "loteId", get cabecera() { return tAlmacen("slotting.lote"); }, render: (a) => a.loteId ?? "" },
    { id: "cantidad", get cabecera() { return tAlmacen("slotting.cantidad"); }, tipo: "numero" },
    { id: "accion", cabecera: "", render: (a) => (a.cantidad > 0 ? tAlmacen("slotting.ubicar") : tAlmacen("slotting.retirar")) },
];

const TablaMigracion = ({ ajustes }: { ajustes: AjusteMigracion[] }) => (
    <QTabla<Fila<AjusteMigracion>>
        metaTabla={metaTablaMigracion}
        datos={conId(ajustes, (a) => `${a.stockId}-${a.loteId ?? ""}`)}
        cargando={false}
        orden={[]}
    />
);
