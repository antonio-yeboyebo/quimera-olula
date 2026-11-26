import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { ejercicioActual, ejercicioIdEnCriteria } from "#/contabilidad/asiento/dominio.ts";
import { CrearGrupoEpigrafe } from "../crear/CrearGrupoEpigrafe.tsx";
import { DetalleGrupoEpigrafe } from "../detalle/DetalleGrupoEpigrafe.tsx";
import { GrupoEpigrafe } from "../diseño.ts";
import {
    criteriaGruposEpigrafesDefecto,
    metaFiltroGrupoEpigrafe,
    metaTablaGrupoEpigrafe,
} from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTContabilidad } from "../../i18n/index.ts";

/**
 * Maestro de grupos de epígrafes (`co_gruposepigrafes`).
 *
 * No usa url-params a propósito: vive dentro de las pestañas de PGC junto al
 * resto de maestros, y todos compartirían el mismo query string. Mismo
 * criterio que en crm/otros/Config.tsx.
 */
export const MaestroConDetalleGrupoEpigrafe = () => {

    const t = useTContabilidad();
    const criteriaInicial = useMemo(criteriaGruposEpigrafesDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        grupos: listaActivaEntidadesInicial<GrupoEpigrafe>(
            undefined,
            criteriaInicial
        ),
    });

    const { estado, grupos } = ctx;

    const autorizado = puede("contabilidad.asiento");

    useEffect(() => {
        if (!autorizado) return;
        emitir("recarga_de_grupos_solicitada", grupos.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!autorizado) {
        return <p>{t("grupo_epigrafe.noTienesPermisoParaVerLos")}</p>;
    }

    const ejercicioId =
        ejercicioIdEnCriteria(grupos.criteria) ?? ejercicioActual();

    return (
        <div className="GrupoEpigrafe">
            <MaestroDetalle<GrupoEpigrafe>
                seleccionada={grupos.activo}
                Maestro={
                    <>
                        <Listado<GrupoEpigrafe>
                            metaTabla={metaTablaGrupoEpigrafe}
                            metaFiltro={metaFiltroGrupoEpigrafe}
                            criteria={grupos.criteria}
                            modoInicial="tabla"
                            entidades={grupos.lista}
                            totalEntidades={grupos.total}
                            seleccionada={grupos.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton
                                        onClick={() =>
                                            emitir("crear_grupo_epigrafe_solicitado")
                                        }
                                    >
                                        {t("grupo_epigrafe.nuevoGrupo")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) =>
                                emitir("grupo_epigrafe_seleccionado", payload)
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
                    <DetalleGrupoEpigrafe
                        id={grupos.activo}
                        publicar={emitir}
                    />
                }
            />

            {estado === "CREANDO" && (
                <CrearGrupoEpigrafe publicar={emitir} ejercicioId={ejercicioId} />
            )}
        </div>
    );
};
