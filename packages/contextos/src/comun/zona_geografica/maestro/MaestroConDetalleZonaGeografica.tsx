import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { CrearZonaGeografica } from "../crear/CrearZonaGeografica.tsx";
import { DetalleZonaGeografica } from "../detalle/DetalleZonaGeografica.tsx";
import { ZonaGeografica } from "../diseño.ts";
import { REGLA_ZONA_GEOGRAFICA } from "../dominio.ts";
import { criteriaZonasGeograficasDefecto, metaFiltroZonaGeografica, metaTablaZonaGeografica } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTComun } from "../../i18n/index.ts";

/** Zonas geográficas (Eneboo `zonasgeo.ui`), en Organización > Tablas generales. */
export const MaestroConDetalleZonaGeografica = () => {

    const t = useTComun();
    const criteriaInicial = useMemo(criteriaZonasGeograficasDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        zonasGeograficas: listaActivaEntidadesInicial<ZonaGeografica>(undefined, criteriaInicial),
    });

    const { estado, zonasGeograficas } = ctx;

    const autorizado = puede(REGLA_ZONA_GEOGRAFICA);

    useEffect(() => {
        if (!autorizado) return;
        emitir("recarga_de_zona_geograficas_solicitada", zonasGeograficas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!autorizado) {
        return <p>{t("zonaGeografica.noTienesPermisoParaVerLas")}</p>;
    }

    return (
        <div className="ZonaGeografica">
            <MaestroDetalle<ZonaGeografica>
                seleccionada={zonasGeograficas.activo}
                Maestro={
                    <>
                        <h2>{t("zonaGeografica.zonasGeograficas")}</h2>
                        <Listado<ZonaGeografica>
                            metaTabla={metaTablaZonaGeografica}
                            metaFiltro={metaFiltroZonaGeografica}
                            criteria={zonasGeograficas.criteria}
                            modoInicial="tabla"
                            entidades={zonasGeograficas.lista}
                            totalEntidades={zonasGeograficas.total}
                            seleccionada={zonasGeograficas.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_zona_geografica_solicitado")}>
                                        {t("zonaGeografica.nuevaZonaGeografica")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("zona_geografica_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleZonaGeografica id={zonasGeograficas.activo} publicar={emitir} />}
            />

            {estado === "CREANDO" && <CrearZonaGeografica publicar={emitir} />}
        </div>
    );
};
