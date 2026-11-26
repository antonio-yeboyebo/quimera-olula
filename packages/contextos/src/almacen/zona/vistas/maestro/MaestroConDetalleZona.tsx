import { NombreAlmacen } from "#/almacen/comun/componentes/NombreAlmacen.tsx";
import { urlFicha } from "#/almacen/comun/fichas.ts";
import { filtroAlmacen } from "#/almacen/comun/componentes/FiltroAlmacen.tsx";
import { criteriaInicialSga } from "#/almacen/comun/preferencias.ts";
import { getMetaFiltroDefecto, MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { Zona } from "../../diseño.ts";
import { descripcionFuncionZona } from "../../dominio.ts";
import { CrearZona } from "../crear/CrearZona.js";
import { DetalleZona } from "../detalle/DetalleZona.js";
import { getMaquina } from "./maquina.js";
import { tAlmacen, useTAlmacen } from "../../../i18n/index.ts";

const metaTablaZona: MetaTabla<Zona> = [
    { id: "codigo", get cabecera() { return tAlmacen("zona.codigo"); } },
    {
        id: "almacenId", get cabecera() { return tAlmacen("zona.almacen"); },
        render: (z) => <NombreAlmacen id={z.almacenId} />,
        enlace: (z) => urlFicha.almacen(z.almacenId),
    },
    { id: "funcion", get cabecera() { return tAlmacen("zona.funcion"); }, render: (z) => descripcionFuncionZona(z.funcion) },
    { id: "descripcion", get cabecera() { return tAlmacen("zona.descripcion"); } },
];

// El almacén con su selector (el de por defecto filtraría por el texto de la columna).
const { almacenId: _sinFiltroTexto, ...filtrosZona } = getMetaFiltroDefecto(metaTablaZona);
const metaFiltroZona: MetaFiltro = { almacen: filtroAlmacen(), ...filtrosZona };

export const MaestroConDetalleZona = () => {
    const t = useTAlmacen();
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteriaInicialSga(criteria, criteriaBase);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        zonas: listaActivaEntidadesInicial<Zona>(id, criteriaInicial),
    });

    const { estado, zonas } = ctx;

    useUrlParams(zonas.activo, zonas.criteria);

    useEffect(() => {
        emitir("recarga_de_zonas_solicitada", zonas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Zona">
            <MaestroDetalle<Zona>
                Maestro={
                    <>
                        <h2>{t("zona.zonas")}</h2>
                        <Listado<Zona>
                            metaTabla={metaTablaZona}
                            metaFiltro={metaFiltroZona}
                            criteria={zonas.criteria}
                            modoInicial="tarjetas"
                            tarjeta={TarjetaZona}
                            entidades={zonas.lista}
                            totalEntidades={zonas.total}
                            seleccionada={zonas.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_zona_solicitado")}>
                                        {t("zona.nuevaZona")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("zona_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleZona id={zonas.activo} publicar={emitir} />}
                seleccionada={zonas.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && (
                <CrearZona publicar={emitir} />
            )}
        </div>
    );
};

const TarjetaZona = (zona: Zona) => (
    <div className="tarjeta-zona" key={zona.id}>
        <div className="tarjeta-zona-codigo">{zona.codigo}</div>
        <div className="tarjeta-zona-descripcion">{zona.descripcion}</div>
    </div>
);
