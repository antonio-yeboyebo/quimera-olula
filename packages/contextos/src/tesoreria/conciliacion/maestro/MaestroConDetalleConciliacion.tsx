import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import {
    filtroFechas,
    MetaFiltro,
} from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { ClausulaFiltro, Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto, formatearFechaDate, formatearMoneda } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { CuentaBancariaSelect } from "#/tesoreria/comun/componentes/cuenta_bancaria_select.tsx";
import { DetalleConciliacion } from "../detalle/DetalleConciliacion.js";
import { MovimientoBancario } from "../diseño.js";
import {
    ESTADOS_MOVIMIENTO_BANCARIO_DEFECTO,
    esIngresoMovimientoBancario,
    estadosMovimientoBancarioDesdeFiltro,
    etiquetaEstadoMovimientoBancario,
    filtroEstadoMovimientoBancario,
    opcionesEstadoMovimientoBancario,
    urlConciliacionCuentaBancaria,
    varianteEstadoMovimientoBancario,
} from "../dominio.js";
import "./MaestroConDetalleConciliacion.css";
import { getMaquina } from "./maquina.js";
import { metaTablaMovimientoBancario } from "./metatabla_conciliacion.js";
import { ResumenSincronizacionMovimientoBancario } from "./ResumenSincronizacionMovimientoBancario.js";
import { ConciliarAutomaticamenteMovimientos } from "./ConciliarAutomaticamenteMovimientos.js";
import { ResumenConciliacionAutomatica } from "./ResumenConciliacionAutomatica.js";
import { SincronizarMovimientoBancario } from "./SincronizarMovimientoBancario.js";
import { PanelCuadreBancario } from "./PanelCuadreBancario.js";
import { tTesoreria, useTTesoreria } from "../../i18n/index.ts";

/** Sin filtro de cuenta bancaria: va en la URL y se cambia con el selector de la cabecera. */
const metaFiltro: MetaFiltro = {
    estado: {
        id: "estado",
        get label() { return tTesoreria("conciliacion.estado"); },
        tipo: "multiseleccion",
        opciones: opcionesEstadoMovimientoBancario,
        filtro: filtroEstadoMovimientoBancario,
        fromFiltro: estadosMovimientoBancarioDesdeFiltro,
    },
    fecha: {
        id: "fecha",
        get label() { return tTesoreria("conciliacion.fecha"); },
        tipo: "intervalo_fechas",
        filtro: (v) => filtroFechas("fecha", v),
    },
    concepto: {
        id: "concepto",
        get label() { return tTesoreria("conciliacion.concepto"); },
        filtro: (v) => (v ? ["concepto", "~", v as string] : null),
    },
    contraparte: {
        id: "contraparte",
        get label() { return tTesoreria("conciliacion.contraparte"); },
        filtro: (v) => (v ? ["contraparte", "~", v as string] : null),
    },
};

/** Por defecto: no conciliados/ignorados, ordenados por fecha descendente. */
const criteriaMovimientosPendientes = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [
        ["estado", "in", ESTADOS_MOVIMIENTO_BANCARIO_DEFECTO as unknown as string],
    ] as ClausulaFiltro[],
    orden: ["fecha", "DESC"],
    paginacion: { ...criteriaDefecto.paginacion },
});

/**
 * Ruta `/tesoreria/cuentas_bancarias/<cuenta_id>/conciliacion`. La conciliación solo tiene
 * sentido sobre una cuenta bancaria, así que la cuenta va en la URL. Se monta con `key`
 * para que cambiar de cuenta con el selector empiece de cero (máquina, filtros, detalle).
 */
export const ConciliacionCuentaBancaria = () => {
    const { cuenta_id: cuentaBancoId } = useParams();
    if (!cuentaBancoId) return null;

    return <MaestroConDetalleConciliacion key={cuentaBancoId} cuentaBancoId={cuentaBancoId} />;
};

/**
 * Componente principal: listado de movimientos bancarios de una cuenta (conciliación) + detalle.
 * "Sincronizar" y "Conciliar automáticamente" actúan solo sobre esa cuenta.
 *
 * "Sincronizar" no abre un modal propio: dispara el estado SINCRONIZANDO, que
 * monta <SincronizarMovimientoBancario> — muestra el spinner de espera y llama
 * a /movimiento_bancario/sincronizar y publica el resumen al terminar (ver ese
 * fichero). El resumen se muestra en un modal aparte y recarga la lista.
 */
const MaestroConDetalleConciliacion = ({ cuentaBancoId }: { cuentaBancoId: string }) => {

    const t = useTTesoreria();
    const criteriaBase = useMemo(criteriaMovimientosPendientes, []);
    const navigate = useNavigate();

    /**
     * Detecta si el usuario llega desde un badge del panel de cuadre bancario.
     * Si hay `_label` en la URL, los filtros son del cuadre (no del usuario):
     *   - `filtrosCuadreInicial` se guarda en el contexto de la máquina y se aplica
     *     siempre a la consulta, independientemente de los filtros manuales.
     *   - `criteriaInicial` del Listado empieza limpio (solo criteriaBase).
     * Si no hay `_label`, comportamiento previo: filtros de URL o criteriaBase.
     */
    const { id, filtrosCuadreInicial, criteriaInicial, etiquetaCuadreInicial } = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        const label = params.get("_label");
        const { id: urlId, criteria } = getUrlParams();

        if (label) {
            return {
                id: urlId,
                filtrosCuadreInicial: criteria.filtro as ClausulaFiltro[],
                criteriaInicial: { ...criteriaBase, filtro: [] as ClausulaFiltro[] },
                etiquetaCuadreInicial: label,
            };
        }
        return {
            id: urlId,
            filtrosCuadreInicial: [] as ClausulaFiltro[],
            criteriaInicial: criteria.filtro.length > 0 ? criteria : criteriaBase,
            etiquetaCuadreInicial: null as string | null,
        };
    }, [criteriaBase]);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        movimientos: listaActivaEntidadesInicial<MovimientoBancario>(id, criteriaInicial),
        cuentaBancoId,
        resumenSincronizacion: null,
        resumenConciliacionAutomatica: null,
        versionCuadre: 0,
        filtrosCuadre: filtrosCuadreInicial,
        etiquetaCuadre: etiquetaCuadreInicial,
    });

    const { estado, movimientos, resumenSincronizacion, resumenConciliacionAutomatica, versionCuadre, etiquetaCuadre } = ctx;

    useUrlParams(movimientos.activo, movimientos.criteria);

    const location = useLocation();
    /**
     * Se usa para saltar el primer disparo del efecto (el montaje ya está
     * inicializado desde useMemo, no hace falta volver a emitir).
     */
    const esPrimerRenderRef = useRef(true);

    /**
     * Detecta navegaciones de badge dentro de la misma ruta montada
     * (e.g. el usuario ya está en /cuentas/X/movimientos y clica otro badge).
     *
     * Por qué location.key y no location.search:
     *   useUrlParams llama a window.history.replaceState directamente, sin pasar
     *   por React Router. React Router no detecta esos cambios, así que
     *   location.search queda como la URL del badge original aunque la barra de
     *   direcciones del navegador ya muestre otra cosa. Si dependiéramos de
     *   location.search nunca veríamos el cambio cuando el usuario vuelve a clicar
     *   el mismo badge (React Router cree que ya está en esa URL).
     *
     *   location.key sí cambia en cada pushState de <Link> (React Router lo gestiona
     *   internamente aunque la URL "parezca" la misma), y NO cambia con replaceState
     *   de useUrlParams. Es el dep correcto.
     *
     *   Leemos window.location.search (URL real del navegador) para obtener _label,
     *   no location.search (URL interna stale de React Router).
     */
    useEffect(() => {
        if (esPrimerRenderRef.current) {
            esPrimerRenderRef.current = false;
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const label = params.get("_label");
        if (!label) return;

        const { criteria } = getUrlParams();
        emitir("filtro_cuadre_establecido", {
            filtrosCuadre: criteria.filtro as ClausulaFiltro[],
            etiquetaCuadre: label,
            criteriaBase,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.key]);

    useEffect(() => {
        emitir("recarga_de_movimientos_solicitada", movimientos.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Conciliacion">
            <MaestroDetalle<MovimientoBancario>
                Maestro={
                    <>
                        <div className="CabeceraConciliacion">
                            <h2>{t("conciliacion.conciliacionBancaria")}</h2>
                            <CuentaBancariaSelect
                                nombre="cuenta_conciliacion"
                                label=""
                                valor={cuentaBancoId}
                                onChange={(op) => op && op.valor !== cuentaBancoId
                                    && navigate(urlConciliacionCuentaBancaria(op.valor))}
                            />
                        </div>
                        <PanelCuadreBancario cuentaBancoId={cuentaBancoId} version={versionCuadre} />
                        {etiquetaCuadre && (
                            <div className="FiltroCuadreActivo">
                                <span>{t("conciliacion.mostrando")}{" "}<strong>{etiquetaCuadre}</strong></span>
                                <QBoton
                                    variante="borde"
                                    onClick={() => emitir("filtro_cuadre_limpiado", criteriaBase)}
                                >
                                    {t("conciliacion.verTodos")}
                                </QBoton>
                            </div>
                        )}
                        <Listado<MovimientoBancario>
                            metaTabla={metaTablaMovimientoBancario}
                            metaFiltro={etiquetaCuadre ? {} : metaFiltro}
                            criteria={movimientos.criteria}
                            modoInicial="tabla"
                            tarjeta={TarjetaMovimientoBancario}
                            entidades={movimientos.lista}
                            totalEntidades={movimientos.total}
                            seleccionada={movimientos.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton
                                        variante="borde"
                                        onClick={() => emitir("conciliacion_automatica_solicitada")}
                                        deshabilitado={estado !== "INICIAL"}
                                    >
                                        {estado === "CONCILIANDO_AUTOMATICAMENTE"
                                            ? t("conciliacion.conciliando")
                                            : t("conciliacion.conciliarAutomaticamente")}
                                    </QBoton>
                                    <QBoton
                                        onClick={() => emitir("sincronizacion_solicitada")}
                                        deshabilitado={estado !== "INICIAL"}
                                    >
                                        {estado === "SINCRONIZANDO" ? t("conciliacion.sincronizando") : t("conciliacion.sincronizar")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("movimiento_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleConciliacion id={movimientos.activo} publicar={emitir} />}
                seleccionada={movimientos.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "SINCRONIZANDO" && (
                <SincronizarMovimientoBancario cuentaBancoId={cuentaBancoId} publicar={emitir} />
            )}

            {estado === "CONCILIANDO_AUTOMATICAMENTE" && (
                <ConciliarAutomaticamenteMovimientos cuentaBancoId={cuentaBancoId} publicar={emitir} />
            )}

            {resumenSincronizacion && (
                <ResumenSincronizacionMovimientoBancario
                    resumen={resumenSincronizacion}
                    publicar={emitir}
                />
            )}

            {resumenConciliacionAutomatica && (
                <ResumenConciliacionAutomatica
                    resumen={resumenConciliacionAutomatica}
                    publicar={emitir}
                />
            )}
        </div>
    );
};

/**
 * Componente tarjeta para la vista en modo tarjetas (pantallas estrechas).
 * Se define fuera del componente principal para evitar re-renders.
 */
const TarjetaMovimientoBancario = (movimiento: MovimientoBancario) => (
    <div className="tarjeta-movimiento-bancario" key={movimiento.id}>
        <div className="tarjeta-movimiento-bancario-linea">
            <span className="tarjeta-movimiento-bancario-concepto">{movimiento.concepto}</span>
            <span className={`tarjeta-movimiento-bancario-importe ${esIngresoMovimientoBancario(movimiento) ? "importe-ingreso" : "importe-cargo"}`}>
                {formatearMoneda(movimiento.importe, movimiento.divisa ?? "EUR")}
            </span>
        </div>
        <div className="tarjeta-movimiento-bancario-linea">
            <QEtiqueta variante={varianteEstadoMovimientoBancario(movimiento.estado)}>
                {etiquetaEstadoMovimientoBancario(movimiento.estado)}
            </QEtiqueta>
            <span className="tarjeta-movimiento-bancario-fecha">{formatearFechaDate(movimiento.fecha)}</span>
        </div>
    </div>
);
