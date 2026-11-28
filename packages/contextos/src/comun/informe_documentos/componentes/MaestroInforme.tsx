import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { FichaInforme, PestañaInforme } from "../diseño.ts";
import { CrearInforme } from "./CrearInforme.tsx";
import { DetalleInforme } from "./DetalleInforme.tsx";
import { getMaquinaMaestro } from "./maestro.ts";
import { tComun, useTComun } from "../../i18n/index.ts";

const metaTabla: MetaTabla<FichaInforme> = [{ id: "descripcion", get cabecera() { return tComun("informeDocumentos.descripcion"); } }];

const metaFiltro: MetaFiltro = {
    descripcion: {
        id: "descripcion",
        campo: "descripcion",
        get label() { return tComun("informeDocumentos.descripcion"); },
        filtro: (valor) => (!valor || valor === "" ? null : ["descripcion", "~", valor as string]),
    },
};

/** Fichas guardadas de una pestaña (comparten tabla con Eneboo) y su detalle. */
export const MaestroInforme = ({ pestaña }: { pestaña: PestañaInforme }) => {
    const t = useTComun();
    const getMaquina = useMemo(() => getMaquinaMaestro(pestaña), [pestaña]);
    const criteriaInicial = useMemo(() => ({ ...criteriaDefecto, orden: ["id", "DESC"] as [string, string] }), []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        fichas: listaActivaEntidadesInicial<FichaInforme>(undefined, criteriaInicial),
    });

    const { estado, fichas } = ctx;

    useEffect(() => {
        emitir("recarga_de_informes_solicitada", fichas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={`MaestroInformeDocumentos MaestroInforme-${pestaña.clave}`}>
            <MaestroDetalle<FichaInforme>
                seleccionada={fichas.activo}
                Maestro={
                    <Listado<FichaInforme>
                        metaTabla={metaTabla}
                        metaFiltro={metaFiltro}
                        criteria={fichas.criteria}
                        modoInicial="tabla"
                        entidades={fichas.lista}
                        totalEntidades={fichas.total}
                        seleccionada={fichas.activo}
                        renderAcciones={() => (
                            <div className="maestro-botones">
                                <QBoton onClick={() => emitir("crear_informe_solicitado")}>{t("informeDocumentos.nuevoInforme")}</QBoton>
                            </div>
                        )}
                        onSeleccion={(payload) => emitir("informe_seleccionado", payload)}
                        onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                        onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                    />
                }
                Detalle={<DetalleInforme pestaña={pestaña} id={fichas.activo} publicar={emitir} />}
            />

            {estado === "CREANDO" && <CrearInforme pestaña={pestaña} publicar={emitir} />}
        </div>
    );
};
