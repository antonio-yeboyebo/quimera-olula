import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto, puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { CrearPlantillaAsiento } from "../crear/CrearPlantillaAsiento.tsx";
import { DetallePlantillaAsiento } from "../detalle/DetallePlantillaAsiento.tsx";
import { ItemPlantillaAsiento } from "../diseño.ts";
import { getMaquina } from "./maquina.ts";
import { tContabilidad, useTContabilidad } from "../../i18n/index.ts";

const metaTablaPlantilla: MetaTabla<ItemPlantillaAsiento> = [
    { id: "id", get cabecera() { return tContabilidad("plantilla_asiento.codigo"); }, prioridad: "alta" },
    { id: "descripcion", get cabecera() { return tContabilidad("plantilla_asiento.descripcion"); }, prioridad: "alta" },
    { id: "concatenar", get cabecera() { return tContabilidad("plantilla_asiento.concatenarCon"); }, prioridad: "baja" },
];

const criteriaPlantillasDefecto = (): Criteria => ({
    ...criteriaDefecto,
    orden: ["id", "ASC"],
});

/** Plantillas de asiento / asientos predefinidos (Eneboo "Plantillas"). */
export const MaestroConDetallePlantillaAsiento = () => {
    const t = useTContabilidad();
    const criteriaBase = useMemo(criteriaPlantillasDefecto, []);
    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        plantillas: listaActivaEntidadesInicial<ItemPlantillaAsiento>(id, criteriaInicial),
    });

    const { estado, plantillas } = ctx;

    useUrlParams(plantillas.activo, plantillas.criteria);

    const autorizado = puede("contabilidad.asiento");

    useEffect(() => {
        if (!autorizado) return;
        emitir("recarga_de_plantillas_solicitada", plantillas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!autorizado) {
        return <p>{t("plantilla_asiento.noTienesPermisoParaVerLas")}</p>;
    }

    return (
        <div className="PlantillaAsiento">
            <MaestroDetalle<ItemPlantillaAsiento>
                Maestro={
                    <>
                        <h2>{t("plantilla_asiento.plantillasDeAsiento")}</h2>
                        <Listado<ItemPlantillaAsiento>
                            metaTabla={metaTablaPlantilla}
                            criteria={plantillas.criteria}
                            modoInicial="tabla"
                            entidades={plantillas.lista}
                            totalEntidades={plantillas.total}
                            seleccionada={plantillas.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_plantilla_solicitada")}>
                                        {t("plantilla_asiento.nuevaPlantilla")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("plantilla_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetallePlantillaAsiento id={plantillas.activo} publicar={emitir} />}
                seleccionada={plantillas.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && <CrearPlantillaAsiento publicar={emitir} />}
        </div>
    );
};
