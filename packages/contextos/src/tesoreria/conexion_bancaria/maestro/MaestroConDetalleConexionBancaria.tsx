import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto, formatearFechaHora } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { ColumnaEstadoTabla } from "#/comun/componentes/ColumnaEstadoTabla.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { ConectarBancoConexionBancaria } from "../conectar_banco/ConectarBancoConexionBancaria.js";
import { DetalleConexionBancaria } from "../detalle/DetalleConexionBancaria.js";
import { ConexionBancaria } from "../diseño.js";
import { nombreInstitucion, requiereReautenticacion } from "../dominio.js";
import { ReautenticarBancoConexionBancaria } from "../reautenticar/ReautenticarBancoConexionBancaria.js";
import "./MaestroConDetalleConexionBancaria.css";
import { getMaquina } from "./maquina.js";
import { TarjetasSaldosConexionBancaria } from "./TarjetasSaldosConexionBancaria.js";
import { tTesoreria, useTTesoreria } from "../../i18n/index.ts";

const metaTablaConexionBancaria = (emitir: EmitirEvento): MetaTabla<ConexionBancaria> => [
    {
        id: 'estado',
        cabecera: '',
        render: (c: ConexionBancaria) => (
            <ColumnaEstadoTabla
                estados={{
                    activa: (
                        <QIcono nombre="circulo_relleno" tamaño="sm" color="var(--color-exito-oscuro)" />
                    ),
                    requiere_reautenticacion: (
                        <QIcono nombre="circulo_relleno" tamaño="sm" color="var(--color-advertencia-oscuro)" />
                    ),
                }}
                estadoActual={c.estado}
            />
        ),
    },
    { id: 'institucionNombre', cabecera: tTesoreria("conexion_bancaria.institucion"), render: (c: ConexionBancaria) => nombreInstitucion(c) },
    {
        id: 'estadoTexto',
        cabecera: tTesoreria("conexion_bancaria.estado"),
        render: (c: ConexionBancaria) => (
            c.estado === 'requiere_reautenticacion' ? tTesoreria("conexion_bancaria.requiereReautenticacion") : tTesoreria("conexion_bancaria.activa")
        ),
    },
    { id: 'cuentas', cabecera: tTesoreria("conexion_bancaria.cuentas"), render: (c: ConexionBancaria) => c.cuentas.length },
    {
        id: 'ultimaSincronizacion',
        cabecera: tTesoreria("conexion_bancaria.ultimaSincronizacion"),
        render: (c: ConexionBancaria) => (c.ultimaSincronizacion ? formatearFechaHora(c.ultimaSincronizacion) : '-'),
    },
    {
        id: 'acciones',
        cabecera: '',
        render: (c: ConexionBancaria) => (requiereReautenticacion(c) ? (
            <QBoton
                tamaño="pequeño"
                onClick={(evento) => {
                    // Sin stopPropagation el clic también seleccionaría la fila.
                    evento.stopPropagation();
                    emitir("reautenticar_conexion_solicitada", c.id);
                }}
            >
                {tTesoreria("conexion_bancaria.reautenticar")}
            </QBoton>
        ) : null),
    },
];

/**
 * Componente principal: listado de conexiones bancarias + detalle.
 *
 * "Conectar banco" no abre un modal propio: dispara el estado CONECTANDO, que
 * monta <ConectarBancoConexionBancaria> — un componente sin UI propia que pide
 * los datos de inicio al backend y abre el widget del proveedor bancario
 * activo (ver ese fichero y comun/proveedor_bancario/). Una conexión que hay
 * que reautenticar (token caducado…) tiene su botón en la fila y en su tarjeta
 * de saldos, sin tener que abrir el detalle.
 */
export const MaestroConDetalleConexionBancaria = () => {

    const t = useTTesoreria();
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        conexiones: listaActivaEntidadesInicial<ConexionBancaria>(id, criteriaInicial),
        conexionReautenticando: null,
        refresco: 0,
    });

    const { estado, conexiones, conexionReautenticando, refresco } = ctx;
    const metaTabla = useMemo(() => metaTablaConexionBancaria(emitir), [emitir]);

    useUrlParams(conexiones.activo, conexiones.criteria);

    useEffect(() => {
        emitir("recarga_de_conexiones_bancarias_solicitada", conexiones.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="ConexionBancaria">
            <MaestroDetalle<ConexionBancaria>
                Maestro={
                    <>
                        <h2>{t("conexion_bancaria.conexionesBancarias")}</h2>
                        <TarjetasSaldosConexionBancaria
                            refrescarClave={conexiones.total + refresco}
                            onReautenticar={(conexionId) => emitir("reautenticar_conexion_solicitada", conexionId)}
                        />
                        <Listado<ConexionBancaria>
                            metaTabla={metaTabla}
                            criteria={conexiones.criteria}
                            modoInicial="tabla"
                            tarjeta={TarjetaConexionBancaria}
                            entidades={conexiones.lista}
                            totalEntidades={conexiones.total}
                            seleccionada={conexiones.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("conectar_banco_solicitado")}>
                                        {t("conexion_bancaria.conectarBanco")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("conexion_bancaria_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={
                    <DetalleConexionBancaria
                        key={`${conexiones.activo}-${refresco}`}
                        id={conexiones.activo}
                        publicar={emitir}
                    />
                }
                seleccionada={conexiones.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CONECTANDO" && (
                <ConectarBancoConexionBancaria publicar={emitir} />
            )}

            {estado === "REAUTENTICANDO" && conexionReautenticando && (
                <ReautenticarBancoConexionBancaria conexion={conexionReautenticando} publicar={emitir} />
            )}
        </div>
    );
};

const TarjetaConexionBancaria = (conexion: ConexionBancaria) => {
    return (
        <div className="tarjeta-conexion-bancaria" key={conexion.id}>
            <div className="tarjeta-conexion-bancaria-institucion">{nombreInstitucion(conexion)}</div>
            <div className={`tarjeta-conexion-bancaria-estado estado-${conexion.estado}`}>
                {conexion.estado === 'requiere_reautenticacion' ? tTesoreria("conexion_bancaria.requiereReautenticacion") : tTesoreria("conexion_bancaria.activa")}
            </div>
            <div className="tarjeta-conexion-bancaria-cuentas">
                {conexion.cuentas.length}{" "}{tTesoreria("conexion_bancaria.cuenta")}{conexion.cuentas.length === 1 ? '' : 's'}
            </div>
        </div>
    );
};
