import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { CrearCuentaEspecial } from "../crear/CrearCuentaEspecial.tsx";
import { DetalleCuentaEspecial } from "../detalle/DetalleCuentaEspecial.tsx";
import { CuentaEspecial } from "../diseño.ts";
import {
    criteriaCuentasEspecialesDefecto,
    metaFiltroCuentaEspecial,
    metaTablaCuentaEspecial,
} from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTContabilidad } from "../../i18n/index.ts";

/**
 * Maestro de cuentas especiales (`co_cuentasesp`).
 *
 * No usa url-params a propósito: vive dentro de las pestañas de PGC junto a
 * los maestros de subcuentas y cuentas, y los tres compartirían el mismo query
 * string. Mismo criterio que en crm/otros/Config.tsx.
 *
 * A diferencia de cuentas y subcuentas, no se filtra por ejercicio: la tabla
 * no lo tiene, el catálogo es único para toda la contabilidad.
 */
export const MaestroConDetalleCuentaEspecial = () => {

    const t = useTContabilidad();
    const criteriaInicial = useMemo(criteriaCuentasEspecialesDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        cuentasEspeciales: listaActivaEntidadesInicial<CuentaEspecial>(
            undefined,
            criteriaInicial
        ),
    });

    const { estado, cuentasEspeciales } = ctx;

    const autorizado = puede("contabilidad.asiento");

    useEffect(() => {
        if (!autorizado) return;
        emitir(
            "recarga_de_cuentas_especiales_solicitada",
            cuentasEspeciales.criteria
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!autorizado) {
        return <p>{t("cuenta_especial.noTienesPermisoParaVerLas")}</p>;
    }

    return (
        <div className="CuentaEspecial">
            <MaestroDetalle<CuentaEspecial>
                seleccionada={cuentasEspeciales.activo}
                Maestro={
                    <>
                        <Listado<CuentaEspecial>
                            metaTabla={metaTablaCuentaEspecial}
                            metaFiltro={metaFiltroCuentaEspecial}
                            criteria={cuentasEspeciales.criteria}
                            modoInicial="tabla"
                            entidades={cuentasEspeciales.lista}
                            totalEntidades={cuentasEspeciales.total}
                            seleccionada={cuentasEspeciales.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton
                                        onClick={() =>
                                            emitir("crear_cuenta_especial_solicitada")
                                        }
                                    >
                                        {t("cuenta_especial.nuevaCuentaEspecial")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) =>
                                emitir("cuenta_especial_seleccionada", payload)
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
                    <DetalleCuentaEspecial
                        id={cuentasEspeciales.activo}
                        publicar={emitir}
                    />
                }
            />

            {estado === "CREANDO" && (
                <CrearCuentaEspecial publicar={emitir} />
            )}
        </div>
    );
};
