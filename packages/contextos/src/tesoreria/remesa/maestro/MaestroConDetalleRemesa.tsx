import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla, QEtiqueta } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto, formatearMoneda } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { DetalleRemesa } from "../detalle/DetalleRemesa.js";
import { Remesa } from "../diseño.js";
import { varianteEstadoRemesa } from "../dominio.js";
import "./MaestroConDetalleRemesa.css";
import { getMaquina } from "./maquina.js";
import { tTesoreria, useTTesoreria } from "../../i18n/index.ts";
import { textoEstado } from "../../comun/estados.ts";

const metaTablaRemesa: MetaTabla<Remesa> = [
    { id: 'id', cabecera: 'ID' },
    { id: 'fecha', get cabecera() { return tTesoreria("remesa.fecha"); }, tipo: 'fecha' },
    { id: 'fechaCargo', get cabecera() { return tTesoreria("remesa.fCargo"); }, tipo: 'fecha' },
    { id: 'cuentaId', get cabecera() { return tTesoreria("remesa.cuenta"); } },
    { id: 'descripcionCuenta', get cabecera() { return tTesoreria("remesa.descripcionCuenta"); } },
    {
        id: 'estado',
        get cabecera() { return tTesoreria("remesa.estado"); },
        render: (remesa: Remesa) => (
            <QEtiqueta variante={varianteEstadoRemesa(remesa.estado)}>
                {textoEstado(remesa.estado)}
            </QEtiqueta>
        ),
    },
    {
        id: 'total',
        get cabecera() { return tTesoreria("remesa.total"); },
        tipo: 'moneda',
        divisa: (r: Remesa) => r.divisaId,
    },
];

export const MaestroConDetalleRemesa = () => {

    const t = useTTesoreria();
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        remesas: listaActivaEntidadesInicial<Remesa>(id, criteriaInicial),
    });

    const { remesas } = ctx;

    useUrlParams(remesas.activo, remesas.criteria);

    useEffect(() => {
        emitir("recarga_de_remesas_solicitada", remesas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Remesa">
            <MaestroDetalle<Remesa>
                Maestro={
                    <>
                        <h2>{t("remesa.remesasDeCobro")}</h2>
                        <Listado<Remesa>
                            metaTabla={metaTablaRemesa}
                            criteria={remesas.criteria}
                            modoInicial="tabla"
                            tarjeta={TarjetaRemesa}
                            entidades={remesas.lista}
                            totalEntidades={remesas.total}
                            seleccionada={remesas.activo}
                            onSeleccion={(payload) => emitir("remesa_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleRemesa id={remesas.activo} publicar={emitir} />}
                seleccionada={remesas.activo}
                modoDisposicion="maestro-50"
            />
        </div>
    );
};

const TarjetaRemesa = (remesa: Remesa) => {
    return (
        <div className="tarjeta-remesa" key={remesa.id}>
            <div className="tarjeta-remesa-cuenta">
                {remesa.descripcionCuenta || remesa.cuentaId}
            </div>
            <div className="tarjeta-remesa-total">
                {formatearMoneda(remesa.total, remesa.divisaId)}
            </div>
            <QEtiqueta variante={varianteEstadoRemesa(remesa.estado)}>
                {textoEstado(remesa.estado)}
            </QEtiqueta>
        </div>
    );
};
