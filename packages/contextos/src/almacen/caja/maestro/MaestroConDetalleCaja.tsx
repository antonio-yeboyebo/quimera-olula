import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { CrearCaja } from "../crear/CrearCaja.js";
import { DetalleCaja } from "../detalle/DetalleCaja.js";
import { Caja } from "../diseño.ts";
import { metaTablaCaja } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTAlmacen } from "../../i18n/index.ts";

export const MaestroConDetalleCaja = () => {
    const t = useTAlmacen();
    const { id, criteria } = getUrlParams();

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        cajas: listaActivaEntidadesInicial<Caja>(id, criteria),
    });

    const { estado, cajas } = ctx;

    useUrlParams(cajas.activo, cajas.criteria);

    useEffect(() => {
        emitir("recarga_de_cajas_solicitada", cajas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Caja">
            <MaestroDetalle<Caja>
                Maestro={
                    <>
                        <h2>{t("caja.cajas")}</h2>
                        <Listado<Caja>
                            metaTabla={metaTablaCaja}
                            criteria={cajas.criteria}
                            entidades={cajas.lista}
                            totalEntidades={cajas.total}
                            seleccionada={cajas.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_caja_solicitado")}>
                                        {t("caja.nuevaCaja")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("caja_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleCaja id={cajas.activo} publicar={emitir} />}
                seleccionada={cajas.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && (
                <CrearCaja publicar={emitir} />
            )}
        </div>
    );
};
