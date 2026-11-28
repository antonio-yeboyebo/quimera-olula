import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { CrearLibroFacturasRecibidas } from "../crear/CrearLibroFacturasRecibidas.tsx";
import { DetalleLibroFacturasRecibidas } from "../detalle/DetalleLibroFacturasRecibidas.tsx";
import { LibroFacturasRecibidas } from "../diseño.ts";
import { ejercicioActual } from "../dominio.ts";
import {
    criteriaLibroFacturasRecibidasDefecto,
    metaFiltroLibroFacturasRecibidas,
    metaTablaLibroFacturasRecibidas,
} from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTContabilidad } from "../../i18n/index.ts";

/** Libros de facturas recibidas guardados: cada ficha son los criterios de un
 * informe de I.V.A. soportado. Se comparten con el ERP de escritorio, que
 * usa la misma tabla. */
export const MaestroConDetalleLibroFacturasRecibidas = () => {
    const t = useTContabilidad();
    const criteriaInicial = useMemo(criteriaLibroFacturasRecibidasDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        informes: listaActivaEntidadesInicial<LibroFacturasRecibidas>(
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
        return <p>{t("libro_facturas_recibidas.noTienesPermisoParaVerEl")}</p>;
    }

    return (
        <div className="LibroFacturasRecibidas">
            <MaestroDetalle<LibroFacturasRecibidas>
                seleccionada={informes.activo}
                Maestro={
                    <Listado<LibroFacturasRecibidas>
                        metaTabla={metaTablaLibroFacturasRecibidas}
                        metaFiltro={metaFiltroLibroFacturasRecibidas}
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
                                    {t("libro_facturas_recibidas.nuevoInforme")}
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
                    <DetalleLibroFacturasRecibidas
                        id={informes.activo}
                        publicar={emitir}
                    />
                }
            />

            {estado === "CREANDO" && (
                <CrearLibroFacturasRecibidas
                    publicar={emitir}
                    ejercicioId={ejercicioActual()}
                />
            )}
        </div>
    );
};
