import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { CrearLibroFacturasEmitidas } from "../crear/CrearLibroFacturasEmitidas.tsx";
import { DetalleLibroFacturasEmitidas } from "../detalle/DetalleLibroFacturasEmitidas.tsx";
import { LibroFacturasEmitidas } from "../diseño.ts";
import { ejercicioActual } from "../dominio.ts";
import {
    criteriaLibroFacturasEmitidasDefecto,
    metaFiltroLibroFacturasEmitidas,
    metaTablaLibroFacturasEmitidas,
} from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTContabilidad } from "../../i18n/index.ts";

/** Libros de facturas emitidas guardados: cada ficha son los criterios de un
 * informe de I.V.A. repercutido. Se comparten con el ERP de escritorio, que
 * usa la misma tabla. */
export const MaestroConDetalleLibroFacturasEmitidas = () => {
    const t = useTContabilidad();
    const criteriaInicial = useMemo(criteriaLibroFacturasEmitidasDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        informes: listaActivaEntidadesInicial<LibroFacturasEmitidas>(
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
        return <p>{t("libro_facturas_emitidas.noTienesPermisoParaVerEl")}</p>;
    }

    return (
        <div className="LibroFacturasEmitidas">
            <MaestroDetalle<LibroFacturasEmitidas>
                seleccionada={informes.activo}
                Maestro={
                    <Listado<LibroFacturasEmitidas>
                        metaTabla={metaTablaLibroFacturasEmitidas}
                        metaFiltro={metaFiltroLibroFacturasEmitidas}
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
                                    {t("libro_facturas_emitidas.nuevoInforme")}
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
                    <DetalleLibroFacturasEmitidas
                        id={informes.activo}
                        publicar={emitir}
                    />
                }
            />

            {estado === "CREANDO" && (
                <CrearLibroFacturasEmitidas
                    publicar={emitir}
                    ejercicioId={ejercicioActual()}
                />
            )}
        </div>
    );
};
