import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { DetalleMandato } from "../detalle/DetalleMandato.js";
import { Mandato } from "../diseño.js";
import "./MaestroConDetalleMandato.css";
import { getMaquina } from "./maquina.js";
import { tTesoreria, useTTesoreria } from "../../i18n/index.ts";

const metaTablaMandato: MetaTabla<Mandato> = [
    { id: 'referencia', get cabecera() { return tTesoreria("mandato.referencia"); } },
    { id: 'descripcion', get cabecera() { return tTesoreria("mandato.descripcion"); } },
    { id: 'clienteId', get cabecera() { return tTesoreria("mandato.cliente"); } },
    { id: 'tipo', get cabecera() { return tTesoreria("mandato.tipo"); } },
    { id: 'tipoPago', get cabecera() { return tTesoreria("mandato.tPago"); } },
    { id: 'numEfectos', get cabecera() { return tTesoreria("mandato.efectos"); }, tipo: 'numero' },
    { id: 'fechaFirma', get cabecera() { return tTesoreria("mandato.fFirma"); }, tipo: 'fecha' },
    { id: 'fechaCaducidad', get cabecera() { return tTesoreria("mandato.fCaducidad"); }, tipo: 'fecha' },
];

export const MaestroConDetalleMandato = () => {

    const t = useTTesoreria();
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        mandatos: listaActivaEntidadesInicial<Mandato>(id, criteriaInicial),
    });

    const { mandatos } = ctx;

    useUrlParams(mandatos.activo, mandatos.criteria);

    useEffect(() => {
        emitir("recarga_de_mandatos_solicitada", mandatos.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Mandato">
            <MaestroDetalle<Mandato>
                Maestro={
                    <>
                        <h2>{t("mandato.mandatos")}</h2>
                        <Listado<Mandato>
                            metaTabla={metaTablaMandato}
                            criteria={mandatos.criteria}
                            modoInicial="tabla"
                            tarjeta={TarjetaMandato}
                            entidades={mandatos.lista}
                            totalEntidades={mandatos.total}
                            seleccionada={mandatos.activo}
                            onSeleccion={(payload) => emitir("mandato_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleMandato id={mandatos.activo} publicar={emitir} />}
                seleccionada={mandatos.activo}
                modoDisposicion="maestro-50"
            />
        </div>
    );
};

const TarjetaMandato = (mandato: Mandato) => {
    return (
        <div className="tarjeta-mandato" key={mandato.id}>
            <div className="tarjeta-mandato-referencia">{mandato.referencia}</div>
            <div className="tarjeta-mandato-descripcion">{mandato.descripcion}</div>
            <div className={`tarjeta-mandato-tipo tipo-${mandato.tipo}`}>
                {mandato.tipo}
            </div>
        </div>
    );
};
