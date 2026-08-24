import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { ItemMaquina } from "../../diseño.ts";
import { DetalleMaquina } from "../detalle/DetalleMaquina.tsx";
import "./MaestroConDetalleMaquina.css";
import { getMaquina } from "./maquina.ts";
import { TarjetaMaquina } from "./TarjetaMaquina.tsx";

const metaTablaMaquina: MetaTabla<ItemMaquina> = [
    { id: "referencia", cabecera: "Referencia" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "cliente", cabecera: "Cliente" },
];

export const MaestroConDetalleMaquina = () => {
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        maquinas: listaActivaEntidadesInicial<ItemMaquina>(id, criteriaInicial),
    });

    const { maquinas } = ctx;

    useUrlParams(maquinas.activo, maquinas.criteria);

    useEffect(() => {
        emitir("recarga_de_maquinas_solicitada", maquinas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="MaestroConDetalleMaquina">
            <MaestroDetalle<ItemMaquina>
                Maestro={
                    <>
                        <h2>Máquinas</h2>
                        <Listado<ItemMaquina>
                            metaTabla={metaTablaMaquina}
                            criteria={maquinas.criteria}
                            modoInicial="tarjetas"
                            tarjeta={TarjetaMaquina}
                            entidades={maquinas.lista}
                            totalEntidades={maquinas.total}
                            seleccionada={maquinas.activo}
                            onSeleccion={(payload) => emitir("maquina_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleMaquina id={maquinas.activo} publicar={emitir} />}
                seleccionada={maquinas.activo}
                modoDisposicion="maestro-50"
            />
        </div>
    );
};
