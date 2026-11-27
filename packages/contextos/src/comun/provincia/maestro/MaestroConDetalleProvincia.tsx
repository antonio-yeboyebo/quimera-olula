import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { CrearProvincia } from "../crear/CrearProvincia.tsx";
import { DetalleProvincia } from "../detalle/DetalleProvincia.tsx";
import { Provincia } from "../diseño.ts";
import { REGLA_PROVINCIA } from "../dominio.ts";
import { criteriaProvinciasDefecto, metaFiltroProvincia, metaTablaProvincia } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTComun } from "../../i18n/index.ts";

/** Provincias (Eneboo `provincias.ui`), en Organización > Tablas generales. */
export const MaestroConDetalleProvincia = () => {

    const t = useTComun();
    const criteriaInicial = useMemo(criteriaProvinciasDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        provincias: listaActivaEntidadesInicial<Provincia>(undefined, criteriaInicial),
    });

    const { estado, provincias } = ctx;

    const autorizado = puede(REGLA_PROVINCIA);

    useEffect(() => {
        if (!autorizado) return;
        emitir("recarga_de_provincias_solicitada", provincias.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!autorizado) {
        return <p>{t("provincia.noTienesPermisoParaVerLas")}</p>;
    }

    return (
        <div className="Provincia">
            <MaestroDetalle<Provincia>
                seleccionada={provincias.activo}
                Maestro={
                    <>
                        <h2>{t("provincia.provincias")}</h2>
                        <Listado<Provincia>
                            metaTabla={metaTablaProvincia}
                            metaFiltro={metaFiltroProvincia}
                            criteria={provincias.criteria}
                            modoInicial="tabla"
                            entidades={provincias.lista}
                            totalEntidades={provincias.total}
                            seleccionada={provincias.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_provincia_solicitado")}>
                                        {t("provincia.nuevaProvincia")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("provincia_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleProvincia id={provincias.activo} publicar={emitir} />}
            />

            {estado === "CREANDO" && <CrearProvincia publicar={emitir} />}
        </div>
    );
};
