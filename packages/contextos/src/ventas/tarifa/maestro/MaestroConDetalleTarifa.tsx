import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { CrearTarifa } from "../crear/CrearTarifa.js";
import { DetalleTarifa } from "../detalle/DetalleTarifa.js";
import { Tarifa } from "../diseño.js";
import "./MaestroConDetalleTarifa.css";
import { getMaquina } from "./maquina.js";
import { tVentas, useTVentas } from "../../i18n/index.ts";

const metaTablaTarifa = (): MetaTabla<Tarifa> => [
    { id: 'id', cabecera: tVentas("tarifa.maestro.codigo") },
    { id: 'nombre', cabecera: tVentas("tarifa.maestro.nombre"), esTitulo: true },
    { id: 'divisa', cabecera: tVentas("tarifa.maestro.divisa") },
];

/**
 * El listado se ordena por código ascendente: el id de tarifa es un contador
 * corto y legible, y es el orden con el que se manejan en el ERP.
 */
const criteriaBase: Criteria = { ...criteriaDefecto, orden: ["id", "ASC"] };

export const MaestroConDetalleTarifa = () => {
    const t = useTVentas();

    const criteriaPorDefecto = useMemo(() => criteriaBase, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaPorDefecto;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        tarifas: listaActivaEntidadesInicial<Tarifa>(id, criteriaInicial),
    });

    const { estado, tarifas } = ctx;

    useUrlParams(tarifas.activo, tarifas.criteria);

    useEffect(() => {
        emitir("recarga_de_tarifas_solicitada", tarifas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Tarifa">
            <MaestroDetalle<Tarifa>
                Maestro={
                    <>
                        <h2>{t("tarifa.maestro.titulo")}</h2>
                        <Listado<Tarifa>
                            metaTabla={metaTablaTarifa()}
                            criteria={tarifas.criteria}
                            modoInicial="tabla"
                            tarjeta={TarjetaTarifa}
                            entidades={tarifas.lista}
                            totalEntidades={tarifas.total}
                            seleccionada={tarifas.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_tarifa_solicitado")}>
                                        {t("tarifa.maestro.nueva")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("tarifa_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleTarifa id={tarifas.activo} publicar={emitir} />}
                seleccionada={tarifas.activo}
                modoDisposicion="maestro-50"
            />

            {/* Modales condicionales: se activan según el estado de la máquina */}
            {estado === "CREANDO" && (
                <CrearTarifa
                    publicar={emitir}
                />
            )}
        </div>
    );
};

/**
 * Componente tarjeta para la vista de lista en modo tarjetas.
 * Se define fuera del componente principal para evitar re-renders.
 */
const TarjetaTarifa = (tarifa: Tarifa) => {
    return (
        <div className="tarjeta-tarifa" key={tarifa.id}>
            <div className="tarjeta-tarifa-nombre">{tarifa.nombre}</div>
            <div className="tarjeta-tarifa-datos">
                <span className="tarjeta-tarifa-codigo">{tarifa.id}</span>
                {tarifa.divisa && (
                    <span className="tarjeta-tarifa-divisa">{tarifa.divisa}</span>
                )}
            </div>
        </div>
    );
};
