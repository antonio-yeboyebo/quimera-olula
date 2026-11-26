import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { CrearClaseAlmacenamiento } from "../crear/CrearClaseAlmacenamiento.js";
import { DetalleClaseAlmacenamiento } from "../detalle/DetalleClaseAlmacenamiento.js";
import { ClaseAlmacenamiento } from "../diseño.ts";
import { getMaquina } from "./maquina.js";
import { tAlmacen, useTAlmacen } from "../../i18n/index.ts";

const metaTablaClaseAlmacenamiento: MetaTabla<ClaseAlmacenamiento> = [
    { id: "codigo", get cabecera() { return tAlmacen("clase_almacenamiento.codigo"); } },
    { id: "descripcion", get cabecera() { return tAlmacen("clase_almacenamiento.descripcion"); } },
];

export const MaestroConDetalleClaseAlmacenamiento = () => {
    const t = useTAlmacen();
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        clases: listaActivaEntidadesInicial<ClaseAlmacenamiento>(id, criteriaInicial),
    });

    const { estado, clases } = ctx;

    useUrlParams(clases.activo, clases.criteria);

    useEffect(() => {
        emitir("recarga_de_clases_solicitada", clases.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="ClaseAlmacenamiento">
            <MaestroDetalle<ClaseAlmacenamiento>
                Maestro={
                    <>
                        <h2>{t("clase_almacenamiento.clasesDeAlmacenamiento")}</h2>
                        <Listado<ClaseAlmacenamiento>
                            metaTabla={metaTablaClaseAlmacenamiento}
                            criteria={clases.criteria}
                            modoInicial="tarjetas"
                            tarjeta={TarjetaClaseAlmacenamiento}
                            entidades={clases.lista}
                            totalEntidades={clases.total}
                            seleccionada={clases.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_clase_almacenamiento_solicitado")}>
                                        {t("clase_almacenamiento.nuevaClaseDeAlmacenamiento")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("clase_almacenamiento_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleClaseAlmacenamiento id={clases.activo} publicar={emitir} />}
                seleccionada={clases.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && <CrearClaseAlmacenamiento publicar={emitir} />}
        </div>
    );
};

const TarjetaClaseAlmacenamiento = (clase: ClaseAlmacenamiento) => (
    <div className="tarjeta-clase-almacenamiento" key={clase.id}>
        <div>{clase.codigo}</div>
        <div>{clase.descripcion}</div>
    </div>
);
