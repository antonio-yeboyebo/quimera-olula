import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { CrearComparativaVentas } from "../crear/CrearComparativaVentas.tsx";
import { DetalleComparativaVentas } from "../detalle/DetalleComparativaVentas.tsx";
import { ComparativaVentas } from "../diseño.ts";
import {
    criteriaComparativaVentasDefecto,
    metaFiltroComparativaVentas,
    metaTablaComparativaVentas,
} from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

export const MaestroConDetalleComparativaVentas = () => {
    const criteriaInicial = useMemo(criteriaComparativaVentasDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        comparativas: listaActivaEntidadesInicial<ComparativaVentas>(
            undefined,
            criteriaInicial
        ),
    });

    const { estado, comparativas } = ctx;

    const autorizado = puede("ventas.factura");

    useEffect(() => {
        if (!autorizado) return;
        emitir("recarga_de_comparativas_solicitada", comparativas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!autorizado) {
        return <p>No tienes permiso para ver la comparativa de ventas.</p>;
    }

    return (
        <div className="ComparativaVentas">
            <MaestroDetalle<ComparativaVentas>
                seleccionada={comparativas.activo}
                Maestro={
                    <Listado<ComparativaVentas>
                        metaTabla={metaTablaComparativaVentas}
                        metaFiltro={metaFiltroComparativaVentas}
                        criteria={comparativas.criteria}
                        modoInicial="tabla"
                        entidades={comparativas.lista}
                        totalEntidades={comparativas.total}
                        seleccionada={comparativas.activo}
                        renderAcciones={() => (
                            <div className="maestro-botones">
                                <QBoton
                                    onClick={() =>
                                        emitir("crear_comparativa_solicitada")
                                    }
                                >
                                    Nueva comparativa
                                </QBoton>
                            </div>
                        )}
                        onSeleccion={(payload) =>
                            emitir("comparativa_seleccionada", payload)
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
                    <DetalleComparativaVentas
                        id={comparativas.activo}
                        publicar={emitir}
                    />
                }
            />

            {estado === "CREANDO" && <CrearComparativaVentas publicar={emitir} />}
        </div>
    );
};
