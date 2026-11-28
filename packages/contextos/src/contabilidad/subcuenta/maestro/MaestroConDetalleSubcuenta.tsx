import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { ejercicioActual, ejercicioIdEnCriteria } from "#/contabilidad/asiento/dominio.ts";
import { CrearSubcuenta } from "../crear/CrearSubcuenta.tsx";
import { DetalleSubcuenta } from "../detalle/DetalleSubcuenta.tsx";
import { Subcuenta } from "../diseño.ts";
import {
    criteriaSubcuentasDefecto,
    metaFiltroSubcuenta,
    metaTablaSubcuenta,
} from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTContabilidad } from "../../i18n/index.ts";

/**
 * Maestro de subcuentas (plan de cuentas).
 *
 * No usa url-params a propósito: vive dentro de las pestañas de PGC junto al
 * maestro de cuentas, y ambos compartirían el mismo query string (`id`,
 * `orden`, filtros), contaminándose al cambiar de pestaña. Mismo criterio que
 * en crm/otros/Config.tsx.
 */
export const MaestroConDetalleSubcuenta = () => {

    const t = useTContabilidad();
    const criteriaInicial = useMemo(criteriaSubcuentasDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        subcuentas: listaActivaEntidadesInicial<Subcuenta>(undefined, criteriaInicial),
    });

    const { estado, subcuentas } = ctx;

    const autorizado = puede("contabilidad.asiento");

    useEffect(() => {
        if (!autorizado) return;
        emitir("recarga_de_subcuentas_solicitada", subcuentas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!autorizado) {
        return <p>{t("subcuenta.noTienesPermisoParaVerEl")}</p>;
    }

    const ejercicioId =
        ejercicioIdEnCriteria(subcuentas.criteria) ?? ejercicioActual();

    return (
        <div className="Subcuenta">
            <MaestroDetalle<Subcuenta>
                seleccionada={subcuentas.activo}
                Maestro={
                    <>
                        <Listado<Subcuenta>
                            metaTabla={metaTablaSubcuenta}
                            metaFiltro={metaFiltroSubcuenta}
                            criteria={subcuentas.criteria}
                            modoInicial="tabla"
                            entidades={subcuentas.lista}
                            totalEntidades={subcuentas.total}
                            seleccionada={subcuentas.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_subcuenta_solicitada")}>
                                        {t("subcuenta.nuevaSubcuenta")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("subcuenta_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleSubcuenta id={subcuentas.activo} publicar={emitir} />}
            />

            {estado === "CREANDO" && (
                <CrearSubcuenta publicar={emitir} ejercicioId={ejercicioId} />
            )}
        </div>
    );
};
