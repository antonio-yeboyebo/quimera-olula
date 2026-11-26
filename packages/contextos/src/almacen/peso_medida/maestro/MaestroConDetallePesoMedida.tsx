import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { CrearPesoMedida } from "../crear/CrearPesoMedida.js";
import { DetallePesoMedida } from "../detalle/DetallePesoMedida.js";
import { PesoMedida } from "../diseño.ts";
import { descripcionMagnitud } from "../dominio.ts";
import { getMaquina } from "./maquina.js";
import { tAlmacen, useTAlmacen } from "../../i18n/index.ts";

const metaTablaPesoMedida: MetaTabla<PesoMedida> = [
    { id: "id", get cabecera() { return tAlmacen("peso_medida.abreviatura"); } },
    { id: "descripcion", get cabecera() { return tAlmacen("peso_medida.descripcion"); } },
    { id: "magnitud", get cabecera() { return tAlmacen("peso_medida.magnitud"); }, render: (p) => descripcionMagnitud(p.magnitud) },
    { id: "factorConversion", get cabecera() { return tAlmacen("peso_medida.factorDeConversion"); }, tipo: "numero" },
];

export const MaestroConDetallePesoMedida = () => {
    const t = useTAlmacen();
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        pesosMedidas: listaActivaEntidadesInicial<PesoMedida>(id, criteriaInicial),
    });

    const { estado, pesosMedidas } = ctx;

    useUrlParams(pesosMedidas.activo, pesosMedidas.criteria);

    useEffect(() => {
        emitir("recarga_de_pesos_medidas_solicitada", pesosMedidas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="PesoMedida">
            <MaestroDetalle<PesoMedida>
                Maestro={
                    <>
                        <h2>{t("peso_medida.unidadesDePesosYMedidas")}</h2>
                        <Listado<PesoMedida>
                            metaTabla={metaTablaPesoMedida}
                            criteria={pesosMedidas.criteria}
                            modoInicial="tabla"
                            tarjeta={TarjetaPesoMedida}
                            entidades={pesosMedidas.lista}
                            totalEntidades={pesosMedidas.total}
                            seleccionada={pesosMedidas.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_peso_medida_solicitado")}>
                                        {t("peso_medida.nuevaUnidad")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("peso_medida_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetallePesoMedida id={pesosMedidas.activo} publicar={emitir} />}
                seleccionada={pesosMedidas.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && <CrearPesoMedida publicar={emitir} />}
        </div>
    );
};

const TarjetaPesoMedida = (pesoMedida: PesoMedida) => (
    <div className="tarjeta-peso-medida" key={pesoMedida.id}>
        <div>{pesoMedida.id}</div>
        <div>{pesoMedida.descripcion}</div>
    </div>
);
