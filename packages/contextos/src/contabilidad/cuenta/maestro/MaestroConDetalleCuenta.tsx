import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { ejercicioActual, ejercicioIdEnCriteria } from "#/contabilidad/asiento/dominio.ts";
import { CrearCuenta } from "../crear/CrearCuenta.tsx";
import { DetalleCuenta } from "../detalle/DetalleCuenta.tsx";
import { Cuenta } from "../diseño.ts";
import { criteriaCuentasDefecto, metaFiltroCuenta, metaTablaCuenta } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTContabilidad } from "../../i18n/index.ts";

/**
 * Maestro de cuentas del PGC.
 *
 * No usa url-params a propósito: vive dentro de las pestañas de PGC junto al
 * maestro de subcuentas, y ambos compartirían el mismo query string (`id`,
 * `orden`, filtros), contaminándose al cambiar de pestaña. Mismo criterio que
 * en crm/otros/Config.tsx. Si algún día hay que conservar la selección al
 * cambiar de pestaña, la solución es subir la lista al contenedor PGC.
 */
export const MaestroConDetalleCuenta = () => {

    const t = useTContabilidad();
    const criteriaInicial = useMemo(criteriaCuentasDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        cuentas: listaActivaEntidadesInicial<Cuenta>(undefined, criteriaInicial),
    });

    const { estado, cuentas } = ctx;

    const autorizado = puede("contabilidad.asiento");

    useEffect(() => {
        if (!autorizado) return;
        emitir("recarga_de_cuentas_solicitada", cuentas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!autorizado) {
        return <p>{t("cuenta.noTienesPermisoParaVerLas")}</p>;
    }

    const ejercicioId = ejercicioIdEnCriteria(cuentas.criteria) ?? ejercicioActual();

    return (
        <div className="Cuenta">
            <MaestroDetalle<Cuenta>
                seleccionada={cuentas.activo}
                Maestro={
                    <>
                        <Listado<Cuenta>
                            metaTabla={metaTablaCuenta}
                            metaFiltro={metaFiltroCuenta}
                            criteria={cuentas.criteria}
                            modoInicial="tabla"
                            entidades={cuentas.lista}
                            totalEntidades={cuentas.total}
                            seleccionada={cuentas.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_cuenta_solicitada")}>
                                        {t("cuenta.nuevaCuenta")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("cuenta_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleCuenta id={cuentas.activo} publicar={emitir} />}
            />

            {estado === "CREANDO" && (
                <CrearCuenta publicar={emitir} ejercicioId={ejercicioId} />
            )}
        </div>
    );
};
