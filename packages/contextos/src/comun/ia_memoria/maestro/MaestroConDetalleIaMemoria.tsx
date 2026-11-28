import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto, puede } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useLayout } from "@olula/lib/useLayout.js";
import { useEffect, useMemo, useState } from "react";
import { CrearIaMemoria } from "../crear/CrearIaMemoria.js";
import { DetalleIaMemoria } from "../detalle/DetalleIaMemoria.js";
import { IaMemoria } from "../diseño.js";
import { getEstadoRagIaMemoria } from "../infraestructura.js";
import "./MaestroConDetalleIaMemoria.css";
import { getMaquina } from "./maquina.js";
import { tComun, useTComun } from "../../i18n/index.ts";

/**
 * Metadatos para renderizar la tabla del listado de memorias.
 */
const etiquetaOrigen = (iaMemoria: IaMemoria) =>
    iaMemoria.origen === 'fichero'
        ? <QEtiqueta variante="primario">{tComun("iaMemoria.fichero")}</QEtiqueta>
        : <QEtiqueta variante="exito">{tComun("iaMemoria.texto")}</QEtiqueta>;

const metaTablaIaMemoria: MetaTabla<IaMemoria> = [
    { id: 'titulo', get cabecera() { return tComun("iaMemoria.titulo"); } },
    { id: 'origen', get cabecera() { return tComun("iaMemoria.origen"); }, render: etiquetaOrigen },
    { id: 'activo', get cabecera() { return tComun("iaMemoria.activo"); }, tipo: 'booleano' },
    { id: 'actualizadoEn', get cabecera() { return tComun("iaMemoria.actualizado"); }, tipo: 'fecha' },
];

/**
 * Componente principal: listado (maestro) + detalle de memorias del asistente.
 */
export const MaestroConDetalleIaMemoria = () => {

    const t = useTComun();
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { layout, cambiarLayout } = useLayout("TARJETA");

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        iaMemorias: listaActivaEntidadesInicial<IaMemoria>(id, criteriaInicial),
    });

    const { estado, iaMemorias } = ctx;

    useUrlParams(iaMemorias.activo, iaMemorias.criteria);

    useEffect(() => {
        emitir("recarga_solicitada", iaMemorias.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [ragDisponible, setRagDisponible] = useState(true);

    useEffect(() => {
        getEstadoRagIaMemoria()
            .then((estado) => setRagDisponible(estado.disponible))
            .catch(() => {});
    }, []);

    return (
        <div className="IaMemoria">
            {!ragDisponible && (
                <QAviso variante="advertencia">
                    {t("iaMemoria.laBusquedaSemanticaNoEstaDisponible")}
                </QAviso>
            )}
            <MaestroDetalle<IaMemoria>
                Maestro={
                    <>
                        <h2>{t("iaMemoria.memoriaDelAsistente")}</h2>
                        <div className="maestro-botones">
                            <span
                                className="cambio-modo-icono"
                                onClick={cambiarLayout}
                            >
                                <QIcono
                                    nombre={layout === "TABLA" ? "lista" : "tabla"}
                                    tamaño="md"
                                />
                            </span>
                        </div>
                        <Listado<IaMemoria>
                            metaTabla={metaTablaIaMemoria}
                            criteria={iaMemorias.criteria}
                            modo={layout === "TARJETA" ? "tarjetas" : "tabla"}
                            tarjeta={TarjetaIaMemoria}
                            entidades={iaMemorias.lista}
                            totalEntidades={iaMemorias.total}
                            seleccionada={iaMemorias.activo}
                            renderAcciones={() => (
                                puede("comun.ia_memoria") && (
                                    <div className="maestro-botones">
                                        <QBoton onClick={() => emitir("creacion_solicitada")}>
                                            {t("iaMemoria.nuevaMemoria")}
                                        </QBoton>
                                    </div>
                                )
                            )}
                            onSeleccion={(payload) => emitir("ia_memoria_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleIaMemoria id={iaMemorias.activo} publicar={emitir} />}
                layout={layout}
                seleccionada={iaMemorias.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && (
                <CrearIaMemoria
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
const TarjetaIaMemoria = (iaMemoria: IaMemoria) => {
    return (
        <div className="tarjeta-ia-memoria" key={iaMemoria.id}>
            <div className="tarjeta-ia-memoria-titulo">{iaMemoria.titulo}</div>
            <div className="tarjeta-ia-memoria-badges">
                {etiquetaOrigen(iaMemoria)}
                <div className={`tarjeta-ia-memoria-estado ${iaMemoria.activo ? "estado-activo" : "estado-inactivo"}`}>
                    {iaMemoria.activo ? tComun("iaMemoria.activo") : tComun("iaMemoria.inactivo")}
                </div>
            </div>
        </div>
    );
};
