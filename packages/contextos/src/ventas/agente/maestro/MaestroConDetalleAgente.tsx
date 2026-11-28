import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { CrearAgente } from "../crear/CrearAgente.js";
import { DetalleAgente } from "../detalle/DetalleAgente.js";
import { Agente } from "../diseño.js";
import { getMaquina } from "./maquina.js";
import { TarjetaAgente } from "./TarjetaAgente.tsx";
import { tVentas, useTVentas } from "../../i18n/index.ts";

const metaTablaAgente = (): MetaTabla<Agente> => [
    { id: 'id', cabecera: tVentas("agente.maestro.id") },
    { id: 'nombre', cabecera: tVentas("agente.maestro.nombre") },
    { id: 'id_fiscal', cabecera: tVentas("agente.maestro.idFiscal") },
    { id: 'por_comision', cabecera: tVentas("agente.maestro.comision"), tipo: 'numero' },
    { id: 'telefono', cabecera: tVentas("agente.maestro.telefono") },
    { id: 'email', cabecera: tVentas("agente.maestro.email") },
    { id: 'ciudad', cabecera: tVentas("agente.maestro.ciudad") },
];

export const MaestroConDetalleAgente = () => {
    const t = useTVentas();

    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        agentes: listaActivaEntidadesInicial<Agente>(id, criteriaInicial),
    });

    const { estado, agentes } = ctx;

    useUrlParams(agentes.activo, agentes.criteria);

    useEffect(() => {
        emitir("recarga_de_agentes_solicitada", agentes.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Agente">
            <MaestroDetalle<Agente>
                Maestro={
                    <>
                        <h2>{t("agente.maestro.titulo")}</h2>
                        <Listado<Agente>
                            metaTabla={metaTablaAgente()}
                            criteria={agentes.criteria}
                            modoInicial="tabla"
                            tarjeta={TarjetaAgente}
                            entidades={agentes.lista}
                            totalEntidades={agentes.total}
                            seleccionada={agentes.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_agente_solicitado")}>
                                        {t("agente.maestro.nuevo")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("agente_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleAgente id={agentes.activo} publicar={emitir} />}
                seleccionada={agentes.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && (
                <CrearAgente
                    publicar={emitir}
                />
            )}
        </div>
    );
};
