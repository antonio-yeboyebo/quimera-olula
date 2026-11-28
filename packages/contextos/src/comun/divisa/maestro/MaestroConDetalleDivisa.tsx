import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { CrearDivisa } from "../crear/CrearDivisa.tsx";
import { DetalleDivisa } from "../detalle/DetalleDivisa.tsx";
import { Divisa } from "../diseño.ts";
import { REGLA_DIVISA } from "../dominio.ts";
import { criteriaDivisasDefecto, metaFiltroDivisa, metaTablaDivisa } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTComun } from "../../i18n/index.ts";

/** Divisas (Eneboo `divisas.ui`), en Organización > Tablas generales. */
export const MaestroConDetalleDivisa = () => {

    const t = useTComun();
    const criteriaInicial = useMemo(criteriaDivisasDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        divisas: listaActivaEntidadesInicial<Divisa>(undefined, criteriaInicial),
    });

    const { estado, divisas } = ctx;

    const autorizado = puede(REGLA_DIVISA);

    useEffect(() => {
        if (!autorizado) return;
        emitir("recarga_de_divisas_solicitada", divisas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!autorizado) {
        return <p>{t("divisas.noTienesPermisoParaVerLas")}</p>;
    }

    return (
        <div className="Divisa">
            <MaestroDetalle<Divisa>
                seleccionada={divisas.activo}
                Maestro={
                    <>
                        <h2>{t("divisas.divisas")}</h2>
                        <Listado<Divisa>
                            metaTabla={metaTablaDivisa}
                            metaFiltro={metaFiltroDivisa}
                            criteria={divisas.criteria}
                            modoInicial="tabla"
                            entidades={divisas.lista}
                            totalEntidades={divisas.total}
                            seleccionada={divisas.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_divisa_solicitado")}>
                                        {t("divisas.nuevaDivisa")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("divisa_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleDivisa id={divisas.activo} publicar={emitir} />}
            />

            {estado === "CREANDO" && <CrearDivisa publicar={emitir} />}
        </div>
    );
};
