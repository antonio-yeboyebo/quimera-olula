import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { ejercicioActual, ejercicioIdEnCriteria } from "#/contabilidad/asiento/dominio.ts";
import { CrearEpigrafe } from "../crear/CrearEpigrafe.tsx";
import { DetalleEpigrafe } from "../detalle/DetalleEpigrafe.tsx";
import { Epigrafe } from "../diseño.ts";
import {
    criteriaEpigrafesDefecto,
    metaFiltroEpigrafe,
    metaTablaEpigrafe,
} from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTContabilidad } from "../../i18n/index.ts";

/**
 * Maestro de subgrupos del plan contable (`co_epigrafes`).
 *
 * No usa url-params a propósito: vive dentro de las pestañas de PGC junto al
 * resto de maestros, y todos compartirían el mismo query string. Mismo
 * criterio que en crm/otros/Config.tsx.
 */
export const MaestroConDetalleEpigrafe = () => {

    const t = useTContabilidad();
    const criteriaInicial = useMemo(criteriaEpigrafesDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        epigrafes: listaActivaEntidadesInicial<Epigrafe>(
            undefined,
            criteriaInicial
        ),
    });

    const { estado, epigrafes } = ctx;

    const autorizado = puede("contabilidad.asiento");

    useEffect(() => {
        if (!autorizado) return;
        emitir("recarga_de_epigrafes_solicitada", epigrafes.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!autorizado) {
        return <p>{t("epigrafe.noTienesPermisoParaVerLos")}</p>;
    }

    const ejercicioId =
        ejercicioIdEnCriteria(epigrafes.criteria) ?? ejercicioActual();

    return (
        <div className="Epigrafe">
            <MaestroDetalle<Epigrafe>
                seleccionada={epigrafes.activo}
                Maestro={
                    <>
                        <Listado<Epigrafe>
                            metaTabla={metaTablaEpigrafe}
                            metaFiltro={metaFiltroEpigrafe}
                            criteria={epigrafes.criteria}
                            modoInicial="tabla"
                            entidades={epigrafes.lista}
                            totalEntidades={epigrafes.total}
                            seleccionada={epigrafes.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton
                                        onClick={() =>
                                            emitir("crear_epigrafe_solicitado")
                                        }
                                    >
                                        {t("epigrafe.nuevoSubgrupo")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) =>
                                emitir("epigrafe_seleccionado", payload)
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
                    <DetalleEpigrafe id={epigrafes.activo} publicar={emitir} />
                }
            />

            {estado === "CREANDO" && (
                <CrearEpigrafe publicar={emitir} ejercicioId={ejercicioId} />
            )}
        </div>
    );
};
