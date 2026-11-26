import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { CrearLibroMayor } from "../crear/CrearLibroMayor.tsx";
import { DetalleLibroMayor } from "../detalle/DetalleLibroMayor.tsx";
import { LibroMayor } from "../diseño.ts";
import { ejercicioActual } from "../dominio.ts";
import {
    criteriaLibroMayorDefecto,
    metaFiltroLibroMayor,
    metaTablaLibroMayor,
} from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTContabilidad } from "../../i18n/index.ts";

/** Libros mayores guardados: cada ficha son los criterios de un informe. Se
 * comparten con el ERP de escritorio, que usa la misma tabla. */
export const MaestroConDetalleLibroMayor = () => {
    const t = useTContabilidad();
    const criteriaInicial = useMemo(criteriaLibroMayorDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        informes: listaActivaEntidadesInicial<LibroMayor>(
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
        return <p>{t("libro_mayor.noTienesPermisoParaVerEl")}</p>;
    }

    return (
        <div className="LibroMayor">
            <MaestroDetalle<LibroMayor>
                seleccionada={informes.activo}
                Maestro={
                    <Listado<LibroMayor>
                        metaTabla={metaTablaLibroMayor}
                        metaFiltro={metaFiltroLibroMayor}
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
                                    {t("libro_mayor.nuevoInforme")}
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
                    <DetalleLibroMayor id={informes.activo} publicar={emitir} />
                }
            />

            {estado === "CREANDO" && (
                <CrearLibroMayor
                    publicar={emitir}
                    ejercicioId={ejercicioActual()}
                />
            )}
        </div>
    );
};
