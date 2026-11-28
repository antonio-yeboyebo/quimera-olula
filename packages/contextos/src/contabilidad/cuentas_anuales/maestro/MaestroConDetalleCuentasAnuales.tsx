import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { CrearCuentasAnuales } from "../crear/CrearCuentasAnuales.tsx";
import { DetalleCuentasAnuales } from "../detalle/DetalleCuentasAnuales.tsx";
import { CuentasAnuales } from "../diseño.ts";
import { ejercicioActual } from "../dominio.ts";
import {
    criteriaCuentasAnualesDefecto,
    metaFiltroCuentasAnuales,
    metaTablaCuentasAnuales,
} from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTContabilidad } from "../../i18n/index.ts";

/** Informes de cuentas anuales guardados: cada ficha son los criterios de un
 * balance, una cuenta de resultados o un estado de ingresos y gastos. Se
 * comparten con el ERP de escritorio, que usa la misma tabla. */
export const MaestroConDetalleCuentasAnuales = () => {
    const t = useTContabilidad();
    const criteriaInicial = useMemo(criteriaCuentasAnualesDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        informes: listaActivaEntidadesInicial<CuentasAnuales>(
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
        return <p>{t("cuentas_anuales.noTienesPermisoParaVerLas")}</p>;
    }

    return (
        <div className="CuentasAnuales">
            <MaestroDetalle<CuentasAnuales>
                seleccionada={informes.activo}
                Maestro={
                    <Listado<CuentasAnuales>
                        metaTabla={metaTablaCuentasAnuales}
                        metaFiltro={metaFiltroCuentasAnuales}
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
                                    {t("cuentas_anuales.nuevoInforme")}
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
                    <DetalleCuentasAnuales
                        id={informes.activo}
                        publicar={emitir}
                    />
                }
            />

            {estado === "CREANDO" && (
                <CrearCuentasAnuales
                    publicar={emitir}
                    ejercicioId={ejercicioActual()}
                />
            )}
        </div>
    );
};
