import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { CrearPais } from "../crear/CrearPais.tsx";
import { DetallePais } from "../detalle/DetallePais.tsx";
import { Pais } from "../diseño.ts";
import { REGLA_PAIS } from "../dominio.ts";
import { criteriaPaisesDefecto, metaFiltroPais, metaTablaPais } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTComun } from "../../i18n/index.ts";

/** Países (Eneboo `paises.ui`), en Organización > Tablas generales. */
export const MaestroConDetallePais = () => {

    const t = useTComun();
    const criteriaInicial = useMemo(criteriaPaisesDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        paises: listaActivaEntidadesInicial<Pais>(undefined, criteriaInicial),
    });

    const { estado, paises } = ctx;

    const autorizado = puede(REGLA_PAIS);

    useEffect(() => {
        if (!autorizado) return;
        emitir("recarga_de_paiss_solicitada", paises.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!autorizado) {
        return <p>{t("paises.noTienesPermisoParaVerLos")}</p>;
    }

    return (
        <div className="Pais">
            <MaestroDetalle<Pais>
                seleccionada={paises.activo}
                Maestro={
                    <>
                        <h2>{t("paises.paises")}</h2>
                        <Listado<Pais>
                            metaTabla={metaTablaPais}
                            metaFiltro={metaFiltroPais}
                            criteria={paises.criteria}
                            modoInicial="tabla"
                            entidades={paises.lista}
                            totalEntidades={paises.total}
                            seleccionada={paises.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_pais_solicitado")}>
                                        {t("paises.nuevoPais")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("pais_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetallePais id={paises.activo} publicar={emitir} />}
            />

            {estado === "CREANDO" && <CrearPais publicar={emitir} />}
        </div>
    );
};
