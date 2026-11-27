import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { CrearImpresora } from "../crear/CrearImpresora.js";
import { DetalleImpresora } from "../detalle/DetalleImpresora.js";
import { Impresora } from "../diseño.ts";
import { tamañoEtiqueta } from "../dominio.ts";
import { getMaquina } from "./maquina.js";

const metaTablaImpresora: MetaTabla<Impresora> = [
    { id: "codigo", cabecera: "Código" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "host", cabecera: "Dirección" },
    { id: "anchoMm", cabecera: "Etiqueta", render: (i: Impresora) => tamañoEtiqueta(i) },
];

/** Mantenimiento de las impresoras de etiquetas de red (plugin impresion). */
export const MaestroConDetalleImpresora = () => {
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        impresoras: listaActivaEntidadesInicial<Impresora>(id, criteriaInicial),
    });

    const { estado, impresoras } = ctx;

    useUrlParams(impresoras.activo, impresoras.criteria);

    useEffect(() => {
        emitir("recarga_de_impresoras_solicitada", impresoras.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Impresora">
            <MaestroDetalle<Impresora>
                Maestro={
                    <>
                        <h2>Impresoras de etiquetas</h2>
                        <Listado<Impresora>
                            metaTabla={metaTablaImpresora}
                            criteria={impresoras.criteria}
                            modoInicial="tarjetas"
                            tarjeta={TarjetaImpresora}
                            entidades={impresoras.lista}
                            totalEntidades={impresoras.total}
                            seleccionada={impresoras.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_impresora_solicitado")}>
                                        Nueva impresora
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("impresora_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleImpresora id={impresoras.activo} publicar={emitir} />}
                seleccionada={impresoras.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && <CrearImpresora publicar={emitir} />}
        </div>
    );
};

const TarjetaImpresora = (impresora: Impresora) => (
    <div className="tarjeta-impresora" key={impresora.id}>
        <div>{impresora.codigo} {impresora.descripcion && `· ${impresora.descripcion}`}</div>
        <div>{impresora.host} · {tamañoEtiqueta(impresora)}</div>
    </div>
);
