import { ValorConEnlace } from "@olula/componentes/atomos/qenlace_ficha.tsx";
import { urlFicha } from "#/almacen/comun/fichas.ts";
import { useEffect } from "react";
import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Entidad } from "@olula/lib/diseño.ts";
import { Link } from "react-router";
import { NecesidadReposicion } from "./diseño.ts";
import {
    necesidadSeleccionable, ParteSituacion, puedeGenerarSeleccion, puedeGenerarTraspaso, situacion,
    textoArticulo, todasSeleccionadas,
} from "./dominio.ts";
import { contextoReposicionDeEntrada, getMaquina } from "./maquina.ts";
import "#/comun/estilos/pagina_proceso.css";
import "./ReposicionPicking.css";
import { tAlmacen, useTAlmacen } from "../i18n/index.ts";

export const ReposicionPicking = () => {
    const t = useTAlmacen();
    const { ctx, emitir } = useMaquina(getMaquina, contextoReposicionDeEntrada());

    // Con almacén de trabajo o un enlace, se calcula de entrada (es una simulación: no crea nada).
    useEffect(() => {
        if (ctx.almacenId) emitir("calculo_solicitado");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const { estado, almacenId, reposicion, seleccion } = ctx;

    return (
        <div className="ReposicionPicking PaginaProceso">
            <h2>{t("reposicion.reposicionDePicking")}</h2>

            <quimera-formulario>
                <Almacen
                    label={t("reposicion.almacen")}
                    nombre="almacenId"
                    valor={almacenId}
                    onChange={(opcion) => emitir("almacen_cambiado", opcion?.valor ?? "")}
                />
            </quimera-formulario>

            <div className="botones maestro-botones">
                <QBoton deshabilitado={!almacenId} onClick={() => emitir("calculo_solicitado")}>
                    {t("reposicion.calcular")}
                </QBoton>
                {estado === "CALCULADO" && puedeGenerarTraspaso(reposicion) && (
                    <QBoton
                        variante="texto"
                        onClick={() => emitir("seleccion_todas_cambiada", !todasSeleccionadas(reposicion, seleccion))}
                    >
                        {todasSeleccionadas(reposicion, seleccion) ? t("reposicion.desmarcarTodos") : t("reposicion.marcarTodos")}
                    </QBoton>
                )}
                {estado === "CALCULADO" && (
                    <QBoton
                        deshabilitado={!puedeGenerarSeleccion(reposicion, seleccion)}
                        onClick={() => emitir("generacion_solicitada")}
                    >
                        {t("reposicion.generarTraspaso")}
                    </QBoton>
                )}
            </div>

            {estado === "CALCULADO" && reposicion.necesidades.length > 0 && !puedeGenerarTraspaso(reposicion) && (
                <p className="mensaje">
                    {t("reposicion.noSePuedeGenerarElTraspaso")}
                </p>
            )}

            {estado === "GENERADO" && (
                <div className="mensaje">
                    {reposicion.ordenId ? (
                        <>
                            {t("reposicion.traspasoGenerado")}{" "}
                            <Link to={`/almacen/ordenes?id=${reposicion.ordenId}`}>
                                {t("reposicion.ordenOrdenid", { ordenId: reposicion.ordenId })}
                            </Link>
                        </>
                    ) : (
                        t("reposicion.noHabiaNadaQueReponerCon")
                    )}
                </div>
            )}

            {estado !== "INICIAL" &&
                (reposicion.necesidades.length === 0 ? (
                    <p>{t("reposicion.noHayNecesidadesDeReposicion")}</p>
                ) : (
                    <TablaNecesidades
                        necesidades={reposicion.necesidades}
                        seleccion={estado === "CALCULADO" ? seleccion : null}
                        onMarcar={(id, marcada) => emitir("necesidad_marcada", { id, marcada })}
                    />
                ))}
        </div>
    );
};

type FilaNecesidad = Entidad & NecesidadReposicion;

const flechaSituacion: Record<ParteSituacion["tipo"], string> = { fisico: "", entrante: "↓", saliente: "↑" };
const nombreSituacion: Record<ParteSituacion["tipo"], string> = {
    get fisico() { return tAlmacen("reposicion.fisico"); }, get entrante() { return tAlmacen("reposicion.entrante"); }, get saliente() { return tAlmacen("reposicion.saliente"); },
};

const Situacion = ({ necesidad }: { necesidad: NecesidadReposicion }) => (
    <span className="situacion">
        {situacion(necesidad).map((p, i) => (
            <span key={p.tipo} className={`situacion-${p.tipo}`} title={nombreSituacion[p.tipo]}>
                {i > 0 && <span className="situacion-separador" aria-hidden="true"> / </span>}
                {flechaSituacion[p.tipo] && <span aria-hidden="true">{flechaSituacion[p.tipo]} </span>}
                <span className="sr-only">{nombreSituacion[p.tipo]} </span>
                {p.cantidad.toLocaleString("es-ES")}
            </span>
        ))}
    </span>
);

const columnasNecesidades: MetaTabla<FilaNecesidad> = [
    {
        id: "articuloId",
        get cabecera() { return tAlmacen("reposicion.articulo"); },
        estilo: "destacado",
        render: (n) => textoArticulo(n),
        enlace: (n) => urlFicha.articulo(n.articuloId),
    },
    { id: "ubicacion", get cabecera() { return tAlmacen("reposicion.ubicacionDePicking"); }, enlace: (n) => urlFicha.pickingFijo(n.pickingFijoId) },
    {
        id: "situacion",
        get cabecera() { return tAlmacen("reposicion.situacion"); },
        render: (n) => <Situacion necesidad={n} />,
    },
    { id: "disponible", get cabecera() { return tAlmacen("reposicion.disponible"); }, tipo: "numero", estilo: "destacado" },
    { id: "minimo", get cabecera() { return tAlmacen("reposicion.minimo"); }, tipo: "numero" },
    { id: "maximo", get cabecera() { return tAlmacen("reposicion.maximo"); }, tipo: "numero" },
    { id: "cantidad", get cabecera() { return tAlmacen("reposicion.aReponer"); }, tipo: "numero", estilo: "destacado" },
    { id: "falta", get cabecera() { return tAlmacen("reposicion.falta"); }, tipo: "numero" },
    {
        id: "origenes",
        get cabecera() { return tAlmacen("reposicion.origenes"); },
        ancho: "25%",
        render: (n) => (n.origenes.length
            ? n.origenes.map((o, i) => (
                <span key={o.ubicacionId}>
                    {i > 0 && ", "}
                    <ValorConEnlace href={urlFicha.ubicacion(o.ubicacionId)} etiqueta={tAlmacen("reposicion.abrirUbicacionUbicacion", { ubicacion: o.ubicacion })}>
                        {o.ubicacion} ({o.cantidad.toLocaleString("es-ES")})
                    </ValorConEnlace>
                </span>
            ))
            : tAlmacen("reposicion.sinStockEnReserva")),
    },
];

const TablaNecesidades = ({ necesidades, seleccion, onMarcar }: {
    necesidades: NecesidadReposicion[];
    /** null: sin casillas (p. ej. tras generar el traspaso). */
    seleccion: string[] | null;
    onMarcar: (id: string, marcada: boolean) => void;
}) => {
    const casilla: MetaTabla<FilaNecesidad>[number] = {
        id: "seleccionada", cabecera: "", ancho: "40px",
        render: (n) => (
            <input
                type="checkbox"
                checked={!!seleccion?.includes(n.pickingFijoId)}
                disabled={!necesidadSeleccionable(n)}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onMarcar(n.pickingFijoId, e.target.checked)}
            />
        ),
    };
    return (
        <QTabla<FilaNecesidad>
            metaTabla={seleccion ? [casilla, ...columnasNecesidades] : columnasNecesidades}
            datos={necesidades.map((n) => ({ ...n, id: n.pickingFijoId }))}
            cargando={false}
            orden={[]}
        />
    );
};
