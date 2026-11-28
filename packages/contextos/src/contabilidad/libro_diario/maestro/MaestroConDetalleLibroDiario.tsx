import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { CrearLibroDiario } from "../crear/CrearLibroDiario.tsx";
import { DetalleLibroDiario } from "../detalle/DetalleLibroDiario.tsx";
import { LibroDiario } from "../diseño.ts";
import { ejercicioActual } from "../dominio.ts";
import {
    criteriaLibroDiarioDefecto,
    metaFiltroLibroDiario,
    metaTablaLibroDiario,
} from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTContabilidad } from "../../i18n/index.ts";

/** Libros diarios guardados: cada ficha son los criterios de un informe. Se
 * comparten con el ERP de escritorio, que usa la misma tabla. */
export const MaestroConDetalleLibroDiario = () => {
    const t = useTContabilidad();
    const criteriaInicial = useMemo(criteriaLibroDiarioDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        informes: listaActivaEntidadesInicial<LibroDiario>(
            undefined,
            criteriaInicial
        ),
    });

    const { estado, informes } = ctx;

    const autorizado = puede("contabilidad.asiento");

    useEffect(() => {
        if (!autorizado) return;
        emitir("recarga_de_informes_solicitada", informes.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!autorizado) {
        return <p>{t("libro_diario.noTienesPermisoParaVerEl")}</p>;
    }

    return (
        <div className="LibroDiario">
            <MaestroDetalle<LibroDiario>
                seleccionada={informes.activo}
                Maestro={
                    <Listado<LibroDiario>
                        metaTabla={metaTablaLibroDiario}
                        metaFiltro={metaFiltroLibroDiario}
                        criteria={informes.criteria}
                        modoInicial="tabla"
                        entidades={informes.lista}
                        totalEntidades={informes.total}
                        seleccionada={informes.activo}
                        renderAcciones={() => (
                            <div className="maestro-botones">
                                <QBoton
                                    onClick={() =>
                                        emitir("crear_informe_solicitado")
                                    }
                                >
                                    {t("libro_diario.nuevoInforme")}
                                </QBoton>
                            </div>
                        )}
                        onSeleccion={(payload) =>
                            emitir("informe_seleccionado", payload)
                        }
                        onCriteriaChanged={(payload) =>
                            emitir("criteria_cambiado", payload)
                        }
                        onSiguientePagina={(payload) =>
                            emitir("siguiente_pagina", payload)
                        }
                    />
                }
                Detalle={
                    <DetalleLibroDiario
                        id={informes.activo}
                        publicar={emitir}
                    />
                }
            />

            {estado === "CREANDO" && (
                <CrearLibroDiario
                    publicar={emitir}
                    ejercicioId={ejercicioActual()}
                />
            )}
        </div>
    );
};
