import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { TipoUbicacion } from "../diseño.ts";
import { descripcionFormatoUbicacion } from "../dominio.ts";
import { CrearTipoUbicacion } from "../crear/CrearTipoUbicacion.js";
import { DetalleTipoUbicacion } from "../detalle/DetalleTipoUbicacion.js";
import { getMaquina } from "./maquina.js";
import { tAlmacen, useTAlmacen } from "../../i18n/index.ts";

const metaTablaTipoUbicacion: MetaTabla<TipoUbicacion> = [
    { id: "codigo", get cabecera() { return tAlmacen("tipo_ubicacion.codigo"); } },
    { id: "descripcion", get cabecera() { return tAlmacen("tipo_ubicacion.descripcion"); } },
    { id: "formato", get cabecera() { return tAlmacen("tipo_ubicacion.formato"); }, render: (t) => descripcionFormatoUbicacion(t.formato) },
    { id: "capacidadPalets", get cabecera() { return tAlmacen("tipo_ubicacion.pales"); } },
];

export const MaestroConDetalleTipoUbicacion = () => {
    const tx = useTAlmacen();
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        tiposUbicacion: listaActivaEntidadesInicial<TipoUbicacion>(id, criteriaInicial),
    });

    const { estado, tiposUbicacion } = ctx;

    useUrlParams(tiposUbicacion.activo, tiposUbicacion.criteria);

    useEffect(() => {
        emitir("recarga_de_tipos_ubicacion_solicitada", tiposUbicacion.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="TipoUbicacion">
            <MaestroDetalle<TipoUbicacion>
                Maestro={
                    <>
                        <h2>{tx("tipo_ubicacion.tiposDeUbicacion")}</h2>
                        <Listado<TipoUbicacion>
                            metaTabla={metaTablaTipoUbicacion}
                            criteria={tiposUbicacion.criteria}
                            modoInicial="tarjetas"
                            tarjeta={TarjetaTipoUbicacion}
                            entidades={tiposUbicacion.lista}
                            totalEntidades={tiposUbicacion.total}
                            seleccionada={tiposUbicacion.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_tipo_ubicacion_solicitado")}>
                                        {tx("tipo_ubicacion.nuevoTipoDeUbicacion")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("tipo_ubicacion_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleTipoUbicacion id={tiposUbicacion.activo} publicar={emitir} />}
                seleccionada={tiposUbicacion.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && <CrearTipoUbicacion publicar={emitir} />}
        </div>
    );
};

const TarjetaTipoUbicacion = (tipo: TipoUbicacion) => (
    <div className="tarjeta-tipo-ubicacion" key={tipo.id}>
        <div>{tipo.codigo}</div>
        <div>{tipo.descripcion}</div>
        <div>{descripcionFormatoUbicacion(tipo.formato)}</div>
    </div>
);
