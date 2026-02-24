import { ColumnaEstadoTabla } from "#/comun/componentes/ColumnaEstadoTabla.tsx";
import { AgenteTpvActual } from "#/tpv/agente/agente_actual/AgenteTpvActual.tsx";
import { puntoVentaLocal } from "#/tpv/comun/infraestructura.ts";
import { PuntoVentaTpvActual } from "#/tpv/punto_de_venta/punto_actual/PuntoVentaTpvActual.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QIcono } from "@olula/componentes/index.js";
import { ListadoControlado } from "@olula/componentes/maestro/ListadoControlado.js";
import { MaestroDetalleControlado } from "@olula/componentes/maestro/MaestroDetalleControlado.tsx";
import { ClausulaFiltro, Criteria } from "@olula/lib/diseño.js";
import { criteriaDefecto, formatearFechaDate, formatearMoneda } from "@olula/lib/dominio.js";
import { listaEntidadesInicial } from "@olula/lib/ListaEntidades.js";
import { useCallback, useEffect, useState } from "react";
import { DetalleVentaTpv } from "../detalle/DetalleVentaTpv.tsx";
import { VentaTpv } from "../diseño.ts";
import { metaTablaFactura } from "./maestro.ts";
import "./MaestroConDetalleVentaTpv.css";
import { getMaquina } from "./maquina.ts";

// const maquina = getMaquina();
const miPuntoVentaLocal = puntoVentaLocal.obtener() ;

const filtroPuntoVenta: ClausulaFiltro = ["punto_venta_id", miPuntoVentaLocal?.id];
const criteriaBaseVentas = {
    ...criteriaDefecto,
    filtro: [
        ...criteriaDefecto.filtro,
        filtroPuntoVenta
    ],
    orden: ["codigo", "DESC"]
    
}
type Layout = "TABLA" | "TARJETA";

export const MaestroConDetalleVentaTpv = () => {

    const [cargando, setCargando] = useState(false);
    const [layout, setLayout] = useState<Layout>("TARJETA");

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        ventas: listaEntidadesInicial<VentaTpv>()
    })

    const cambiarLayout = useCallback(
        () => setLayout(layout === "TARJETA" ? "TABLA" : "TARJETA"),
        [layout, setLayout]
    );
    
    const crear = useCallback(
        () => emitir("creacion_de_venta_solicitada"),
        [emitir]
    );

    const setSeleccionada = useCallback(
        (payload: VentaTpv) => emitir("venta_seleccionada", payload),
        [emitir]
    );

    const recargar = useCallback(
        async (criteria: Criteria) => {
            await emitir("recarga_de_ventas_solicitada", criteria);
        },
        [emitir]
    );
    
    useEffect(() => {
        setCargando(true);
        recargar(criteriaBaseVentas);
        setCargando(false);
    }, [])

    return ( 
        <div className="Factura"> 
            <MaestroDetalleControlado<VentaTpv>
                Maestro={
                    <>
                        <h2>Ventas TPV</h2>
                        <div className="maestro-botones">
                            <QBoton 
                                texto={layout === "TARJETA" ? "Cambiar a TABLA" : "Cambiar a TARJETA"}
                                onClick={cambiarLayout}
                            />
                        </div>
                        <PuntoVentaTpvActual/>
                        <AgenteTpvActual/>
                        <div className="maestro-botones">
                            <QBoton onClick={crear}>Nueva Venta</QBoton>
                        </div>
                        <ListadoControlado
                            metaTabla={metaTablaFactura}
                            metaFiltro={true}
                            cargando={cargando}
                            criteriaInicial={criteriaDefecto}
                            modo={layout === "TARJETA" ? 'tarjetas' : 'tabla'}
                            // setModo={handleSetModoVisualizacion}
                            tarjeta={TarjetaVentaTpv}
                            entidades={ctx.ventas.lista}
                            totalEntidades={ctx.ventas.total}
                            seleccionada={ctx.ventas.activo}
                            onSeleccion={setSeleccionada}
                            onCriteriaChanged={recargar}
                        />
                    </>
                }
                Detalle={
                    <DetalleVentaTpv ventaInicial={ctx.ventas.activo} publicar={emitir} />
                }
                layout={layout}
                seleccionada={ctx.ventas.activo}
                modoDisposicion="maestro-50"
            />
        </div>
    );
};


const TarjetaVentaTpv = (
    venta: VentaTpv ,
) => {

    return (
        <div className="tarjeta-venta">
            <div className="tarjeta-venta-izquierda">
                <ColumnaEstadoTabla
                    estados={{
                        abierta,
                        cerrada,
                    }}
                    estadoActual={venta.abierta ? "abierta" : "cerrada"}
                />
                <div className='tarjeta-venta-izquierda-textos'>
                    <div>
                    {`${venta.codigo} - ${formatearFechaDate(venta.fecha)}`}
                    </div>
                    { venta.nombre_cliente !== 'VENTA AL CONTADO' &&
                        <div>
                            {venta.nombre_cliente}
                        </div>
                    }
                </div>
            </div>
            <div className="tarjeta-venta-derecha">
                {`${formatearMoneda(venta.total, venta.divisa_id)}`}
            </div>
        </div>
    )
}

const abierta = (
    <QIcono
        nombre={"circulo_relleno"}
        tamaño="sm"
        color="var(--color-exito-oscuro)"
    />
)

const cerrada = (
    <QIcono
        nombre={"circulo_relleno"}
        tamaño="sm"
        color="var(--color-deshabilitado-oscuro)"
    />
)

{/* <ColumnaEstadoTabla
    estados={{
    aprobado: (
        <QIcono
        nombre={"circulo_relleno"}
        tamaño="sm"
        color="var(--color-deshabilitado-oscuro)"
        />
    ),
    pendiente: (
        <QIcono
        nombre={"circulo_relleno"}
        tamaño="sm"
        color="var(--color-exito-oscuro)"
        />
    ),
    }}
    estadoActual={pedido.servido == "TOTAL" ? "aprobado" : "pendiente"}
/> */}