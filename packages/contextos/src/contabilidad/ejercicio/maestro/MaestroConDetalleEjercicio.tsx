import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { ComponentType, useEffect, useMemo } from "react";
import { CrearEjercicio } from "../crear/CrearEjercicio.tsx";
import { DetalleEjercicio, PropsDetalleEjercicio } from "../detalle/DetalleEjercicio.tsx";
import { Ejercicio } from "../diseño.ts";
import { criteriaEjerciciosDefecto, metaTablaEjercicio } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { tContabilidad, useTContabilidad } from "../../i18n/index.ts";

/** Listado de la tabla `ejercicios`. En Contabilidad > «Apertura y Cierre de
 * Ejercicio» (co_cerrarejer) no se crean ni se borran ejercicios; en
 * Fiscalidad > «Ejercicios fiscales» (ejercicios.ui) sí se crean (`conAlta`). */
export const MaestroConDetalleEjercicio = ({
    titulo = tContabilidad("ejercicio.aperturaYCierreDeEjercicio"),
    conAlta = false,
    Detalle = DetalleEjercicio,
}: {
    titulo?: string;
    conAlta?: boolean;
    Detalle?: ComponentType<PropsDetalleEjercicio>;
} = {}) => {

    const t = useTContabilidad();
    const criteriaInicial = useMemo(criteriaEjerciciosDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        ejercicios: listaActivaEntidadesInicial<Ejercicio>(undefined, criteriaInicial),
    });

    const { estado, ejercicios } = ctx;
    const autorizado = puede("contabilidad.asiento");

    useEffect(() => {
        if (!autorizado) return;
        emitir("recarga_de_ejercicios_solicitada", ejercicios.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!autorizado) {
        return <p>{t("ejercicio.noTienesPermisoParaVerLos")}</p>;
    }

    return (
        <div className="Ejercicio">
            <MaestroDetalle<Ejercicio>
                seleccionada={ejercicios.activo}
                Maestro={
                    <>
                        <h2>{titulo}</h2>
                        <Listado<Ejercicio>
                            metaTabla={metaTablaEjercicio}
                            criteria={ejercicios.criteria}
                            modoInicial="tabla"
                            entidades={ejercicios.lista}
                            totalEntidades={ejercicios.total}
                            seleccionada={ejercicios.activo}
                            renderAcciones={conAlta ? () => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_ejercicio_solicitado")}>
                                        {t("ejercicio.nuevoEjercicio")}
                                    </QBoton>
                                </div>
                            ) : undefined}
                            onSeleccion={(payload) => emitir("ejercicio_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={
                    <Detalle
                        id={ejercicios.activo}
                        ejercicios={ejercicios.lista}
                        publicar={emitir}
                    />
                }
            />

            {conAlta && estado === "CREANDO" && (
                <CrearEjercicio publicar={emitir} ejercicios={ejercicios.lista} />
            )}
        </div>
    );
};
