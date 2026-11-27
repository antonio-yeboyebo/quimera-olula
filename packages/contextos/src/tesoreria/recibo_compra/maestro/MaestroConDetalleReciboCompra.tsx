import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla, QEtiqueta } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import {
    filtroFechas,
    MetaFiltro,
} from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { ClausulaFiltro, Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto, formatearMoneda, plugin } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { DetalleReciboCompra } from "../detalle/DetalleReciboCompra.js";
import { ReciboCompra } from "../diseño.js";
import {
    ESTADOS_RECIBO_COMPRA_DEFECTO,
    opcionesEstadoReciboCompra,
} from "../dominio.js";
import {
    estadosDesdeFiltro,
    filtroEstadoReciboVenta,
    varianteEstadoReciboVenta,
} from "../../recibo_venta/dominio.js";
import { recibosSeleccionados } from "./maestro.js";
import "./MaestroConDetalleReciboCompra.css";
import { getMaquina } from "./maquina.js";
import { RemesarRecibosCompra } from "./RemesarRecibosCompra.js";
import { tTesoreria, useTTesoreria } from "../../i18n/index.ts";
import { textoEstado } from "../../comun/estados.ts";

const metaTablaReciboCompra: MetaTabla<ReciboCompra> = [
    { id: 'codigo', get cabecera() { return tTesoreria("recibo_compra.codigo"); } },
    { id: 'nombreProveedor', get cabecera() { return tTesoreria("recibo_compra.proveedor"); } },
    { id: 'idFiscal', get cabecera() { return tTesoreria("recibo_compra.idFiscal"); } },
    { id: 'fechaEmision', get cabecera() { return tTesoreria("recibo_compra.fEmision"); }, tipo: 'fecha' },
    { id: 'fechaVencimiento', get cabecera() { return tTesoreria("recibo_compra.fVencimiento"); }, tipo: 'fecha' },
    {
        id: 'estado',
        get cabecera() { return tTesoreria("recibo_compra.estado"); },
        // Como en recibos de cobro: emitido neutro, pagado en verde, devuelto en rojo, remesado en ámbar.
        render: (recibo: ReciboCompra) => (
            <QEtiqueta variante={varianteEstadoReciboVenta(recibo.estado)}>
                {textoEstado(recibo.estado)}
            </QEtiqueta>
        ),
    },
    { id: 'importe', get cabecera() { return tTesoreria("recibo_compra.importe"); }, tipo: 'moneda' },
];

// Filtros como en recibos de cobro: el estado con una casilla por estado y, por defecto, los pendientes.
const metaFiltroReciboCompra: MetaFiltro = {
    codigo: {
        id: "codigo",
        get label() { return tTesoreria("recibo_compra.codigo"); },
        filtro: (v) => (v ? ["codigo", "~", v as string] : null),
    },
    nombre_proveedor: {
        id: "nombre_proveedor",
        get label() { return tTesoreria("recibo_compra.proveedor"); },
        filtro: (v) => (v ? ["nombre_proveedor", "~", v as string] : null),
    },
    id_fiscal: {
        id: "id_fiscal",
        get label() { return tTesoreria("recibo_compra.idFiscal"); },
        filtro: (v) => (v ? ["id_fiscal", "~", v as string] : null),
    },
    fecha_vencimiento: {
        id: "fecha_vencimiento",
        get label() { return tTesoreria("recibo_compra.fVencimiento"); },
        tipo: "intervalo_fechas",
        filtro: (v) => filtroFechas("fecha_vencimiento", v),
    },
    estado: {
        id: "estado",
        get label() { return tTesoreria("recibo_compra.estado"); },
        tipo: "multiseleccion",
        opciones: opcionesEstadoReciboCompra,
        filtro: filtroEstadoReciboVenta,
        fromFiltro: estadosDesdeFiltro,
    },
};

const criteriaRecibosPendientes = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [
        ["estado", "in", ESTADOS_RECIBO_COMPRA_DEFECTO as unknown as string],
    ] as ClausulaFiltro[],
    paginacion: { ...criteriaDefecto.paginacion },
});

export const MaestroConDetalleReciboCompra = () => {

    const t = useTTesoreria();
    const criteriaBase = useMemo(criteriaRecibosPendientes, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const navigate = useNavigate();

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        recibos: listaActivaEntidadesInicial<ReciboCompra>(id, criteriaInicial),
        seleccionados: [],
        remesaCreada: null,
    });

    const { estado, recibos, seleccionados, remesaCreada } = ctx;

    // Las remesas de pago solo se ofrecen con su plugin activo.
    const remesasActivas = plugin("remesa_pago") === "activo";
    const [multiseleccion, setMultiseleccion] = useState(false);
    const elegidos = recibosSeleccionados(seleccionados, recibos.lista);

    useEffect(() => {
        if (remesaCreada) navigate(`/tesoreria/remesa_pago?id=${remesaCreada}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remesaCreada]);

    useUrlParams(recibos.activo, recibos.criteria);

    useEffect(() => {
        emitir("recarga_de_recibos_solicitada", recibos.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="ReciboCompra">
            <MaestroDetalle<ReciboCompra>
                Maestro={
                    <>
                        <h2>{t("recibo_compra.recibosDePago")}</h2>
                        <Listado<ReciboCompra>
                            metaTabla={metaTablaReciboCompra}
                            metaFiltro={metaFiltroReciboCompra}
                            criteria={recibos.criteria}
                            modoInicial="tabla"
                            tarjeta={TarjetaReciboCompra}
                            entidades={recibos.lista}
                            totalEntidades={recibos.total}
                            seleccionada={recibos.activo}
                            {...(remesasActivas && {
                                seleccionadas: seleccionados,
                                onMultiSeleccion: (ids: string[]) => emitir("seleccionados_cambiados", ids),
                                modoMultiseleccion: multiseleccion,
                                onModoMultiseleccionChanged: setMultiseleccion,
                            })}
                            renderAcciones={() =>
                                remesasActivas && multiseleccion && (
                                    <div className="maestro-botones">
                                        <QBoton
                                            onClick={() => emitir("remesado_solicitado")}
                                            deshabilitado={elegidos.length === 0}
                                        >
                                            {t("recibo_compra.remesarLength", { length: elegidos.length })}
                                        </QBoton>
                                    </div>
                                )
                            }
                            onSeleccion={(payload) => emitir("recibo_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleReciboCompra id={recibos.activo} publicar={emitir} />}
                seleccionada={recibos.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "REMESANDO" && (
                <RemesarRecibosCompra recibos={elegidos} publicar={emitir} />
            )}
        </div>
    );
};

const TarjetaReciboCompra = (recibo: ReciboCompra) => {
    return (
        <div className="tarjeta-recibo-compra" key={recibo.id}>
            <div className="tarjeta-recibo-compra-codigo">{recibo.codigo}</div>
            <div className="tarjeta-recibo-compra-importe">
                {formatearMoneda(recibo.importe, "EUR")}
            </div>
            <div className={`tarjeta-recibo-compra-estado estado-${textoEstado(recibo.estado)}`}>
                {textoEstado(recibo.estado)}
            </div>
        </div>
    );
};
