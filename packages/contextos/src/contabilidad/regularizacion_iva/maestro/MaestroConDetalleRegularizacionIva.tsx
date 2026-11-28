import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { CrearRegularizacionIva } from "../crear/CrearRegularizacionIva.tsx";
import { DetalleRegularizacionIva } from "../detalle/DetalleRegularizacionIva.tsx";
import { RegularizacionIva } from "../diseño.ts";
import {
    criteriaRegularizacionesIvaDefecto,
    metaFiltroRegularizacionIva,
    metaTablaRegularizacionIva,
} from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTContabilidad } from "../../i18n/index.ts";

/** Regularizaciones de I.V.A. (Eneboo co_masterregiva). */
export const MaestroConDetalleRegularizacionIva = () => {

    const t = useTContabilidad();
    const criteriaInicial = useMemo(criteriaRegularizacionesIvaDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        regularizaciones: listaActivaEntidadesInicial<RegularizacionIva>(
            undefined,
            criteriaInicial
        ),
    });

    const { estado, regularizaciones } = ctx;

    const autorizado = puede("contabilidad.asiento");

    useEffect(() => {
        if (!autorizado) return;
        emitir(
            "recarga_de_regularizaciones_iva_solicitada",
            regularizaciones.criteria
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!autorizado) {
        return <p>{t("regularizacion_iva.noTienesPermisoParaVerLas")}</p>;
    }

    return (
        <div className="RegularizacionIva">
            <MaestroDetalle<RegularizacionIva>
                seleccionada={regularizaciones.activo}
                Maestro={
                    <>
                        <h2>{t("regularizacion_iva.regularizacionDeIva")}</h2>
                        <Listado<RegularizacionIva>
                            metaTabla={metaTablaRegularizacionIva}
                            metaFiltro={metaFiltroRegularizacionIva}
                            criteria={regularizaciones.criteria}
                            modoInicial="tabla"
                            entidades={regularizaciones.lista}
                            totalEntidades={regularizaciones.total}
                            seleccionada={regularizaciones.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton
                                        onClick={() =>
                                            emitir("crear_regularizacion_iva_solicitada")
                                        }
                                    >
                                        {t("regularizacion_iva.nuevaRegularizacion")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) =>
                                emitir("regularizacion_iva_seleccionada", payload)
                            }
                            onCriteriaChanged={(payload) =>
                                emitir("criteria_cambiado", payload)
                            }
                            onSiguientePagina={(payload) =>
                                emitir("siguiente_pagina", payload)
                            }
                        />
                    </>
                }
                Detalle={
                    <DetalleRegularizacionIva
                        id={regularizaciones.activo}
                        publicar={emitir}
                    />
                }
            />

            {estado === "CREANDO" && (
                <CrearRegularizacionIva
                    publicar={emitir}
                    regularizaciones={regularizaciones.lista}
                />
            )}
        </div>
    );
};
