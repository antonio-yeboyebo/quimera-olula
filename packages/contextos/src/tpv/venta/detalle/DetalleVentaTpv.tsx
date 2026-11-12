import { CambiarDescuento } from "#/ventas/comun/componentes/moleculas/CambiarDescuento/CambiarDescuento.tsx";
import { TotalesVenta } from "#/ventas/venta/vistas/TotalesVenta.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Detalle, QBoton, Tab, Tabs } from "@olula/componentes/index.js";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.js";
import { FactoryObj } from "@olula/lib/factory_ctx.tsx";
import { abrirCajon } from "@olula/lib/impresion.ts";
import { listaEntidadesInicial } from "@olula/lib/ListaEntidades.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect, useRef } from "react";
import { BorrarVentaTpv } from "../borrar/BorrarVentaTpv.tsx";
import { BorrarPagoVentaTpv } from "../borrar_pago/BorrarPagoVentaTpv.tsx";
import { DevolverVentaTpv } from "../devolver/DevolverVentaTpv.tsx";
import { LineaFactura, PagoVentaTpv, VentaTpv } from "../diseño.ts";
import { ventaTpvVacia } from "../dominio.ts";
import { EmitirVentaTpv } from "../emitir/EmitirVentaTpv.tsx";
import { PagarTarjetaVentaTpv } from "../pagar_con_tarjeta/PagarTarjetaVentaTpv.tsx";
import { PagarQrVentaTpv } from "../pagar_con_qr/PagarQrVentaTpv.tsx";
import { PagoValeVentaTpv } from "../pagar_con_vale/PagoValeVentaTpv.tsx";
import { PagarEfectivoVentaTpv } from "../pagar_en_efectivo/PagarEfectivoVentaTpv.tsx";
import { TiqueRegaloVentaTpv } from "../tique_regalo/TiqueRegaloVentaTpv.tsx";
import { publicarEnVisor } from "#/tpv/visor/canal.ts";
import { metodoCobroDeEstado, ventaVisorDesdeVenta } from "#/tpv/visor/dominio.ts";
import { PendienteVenta } from "./comps/PendienteVenta.tsx";
import { ContextoVentaTpv, guardarVenta, imprimirTicketOFactura, imprimirVale, metaVentaTpv } from "./detalle.ts";
import { Lineas } from "./lineas/Lineas.tsx";
import { getMaquina } from "./maquina.ts";
import { Pagos } from "./pagos/Pagos.tsx";
import { TabCliente } from "./tabs/TabCliente.tsx";

export const DetalleVentaTpv = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
    const contextoInicial: ContextoVentaTpv = {
        estado: "INICIAL",
        venta: ventaTpvVacia,
        pagos: listaEntidadesInicial<PagoVentaTpv>(),
        lineas: listaEntidadesInicial<LineaFactura>(),
    };

    const { ctx, emitir } = useMaquina(getMaquina, contextoInicial, publicar);

    const valesAntesQueTique = (FactoryObj.app.TPV?.venta_imprimirValesAntesQueTique as boolean | undefined) ?? false;

    const autoGuardar = useCallback(
        async (venta: VentaTpv) => {
            await guardarVenta(ctx, venta);
            await emitir("venta_guardada");
        },
        [ctx, emitir]
    );

    const modeloVenta = useModelo(metaVentaTpv, ctx.venta, autoGuardar);

    useEffect(() => {
        emitir("venta_id_cambiada", id, true);
    }, [id]);

    const estadoAnterior = useRef(ctx.estado); // Referencia para saber cuándo imprimir el tique
    useEffect(() => {
        const veniaDePagar = metodoCobroDeEstado(estadoAnterior.current) !== null;
        if (ctx.estado === 'EMITIDA' && veniaDePagar && ctx.venta.pendiente === 0) {
            // Antes que la foto de la venta, para que el visor calcule el cambio.
            publicarEnVisor({ tipo: "pagado", ventaId: ctx.venta.id, importe: ctx.venta.total, divisaId: ctx.venta.divisa_id });
            imprimirTicketOFactura(ctx.venta, ctx.pagos.lista, valesAntesQueTique);
        }
        estadoAnterior.current = ctx.estado;
    }, [ctx.estado, ctx.venta]);

    // Visor de cliente: artículos, totales y método de cobro en curso.
    useEffect(() => {
        if (!ctx.venta.id) return;
        publicarEnVisor({
            tipo: "venta",
            venta: ventaVisorDesdeVenta(ctx.venta, ctx.lineas.lista),
            metodo: metodoCobroDeEstado(ctx.estado),
        });
    }, [ctx.venta, ctx.lineas.lista, ctx.estado]);

    useEffect(() => () => publicarEnVisor({ tipo: "limpiar" }), []);

    if (!ctx.venta.id) return;

    const imprimir = async () => {
        await imprimirTicketOFactura(ctx.venta, ctx.pagos.lista);
    };

    const imprimir_vale = async () => {
        await imprimirVale(ctx.venta.codigo);
    };

    const { estado, pagos, lineas, venta } = ctx;

    const titulo = (venta: Entidad) => venta.codigo as string;

    return (
        <Detalle
        id={id}
        obtenerTitulo={titulo}
        setEntidad={() => {}}
        entidad={venta}
        cerrarDetalle={() => emitir("venta_deseleccionada", null, true)}
        >
        <div className="DetalleFactura">
            <div className="botones maestro-botones ">
            {estado !== "EMITIDA" && (
                <QBoton
                texto="Borrar venta"
                onClick={() => emitir("borrar_solicitado")}
                />
            )}
            <QBoton texto="Imprimir" onClick={imprimir} />
            <QBoton texto="Cajón" onClick={abrirCajon} />
            {estado === "ABIERTA" && (
                <QBoton
                texto="Emitir"
                onClick={() => emitir("emision_solicitada")}
                />
            )}
            {estado == "EMITIDA" && venta.total > 0 && (
                <QBoton
                texto="Tique regalo"
                onClick={() => emitir("tique_regalo_solicitado")}
                />
            )}
            {estado == "EMITIDA" && venta.total < 0 && (
                <QBoton
                texto="Imprimir vale"
                onClick={imprimir_vale}
                />
            )}
            </div>
            <Tabs
            children={[
                <Tab
                    key="tab-1"
                    label="Cliente"
                    children={
                        <TabCliente
                            venta={venta}
                            estado={estado}
                            form={modeloVenta}
                            publicar={emitir}
                        />
                    }
                />,
                <Tab
                    key="tab-3"
                    label="Pagos"
                    children={
                        <Pagos
                            pagoActivo={pagos.activo}
                            pagos={pagos.lista}
                            publicar={emitir}
                        />
                    }
                />,
            ]}
            ></Tabs>

            <TotalesVenta
              publicar={emitir}
              modeloVenta={modeloVenta}
              formato="linea"
            />

            {estado === "CAMBIANDO_DESCUENTO" && (
                <CambiarDescuento publicar={emitir} venta={venta}/>
            )}

            {venta.pendiente !== 0 && (
                <PendienteVenta publicar={emitir} venta={venta} />
            )}
            <Lineas
                lineas={lineas}
                venta={venta}
                publicar={emitir}
                estadoVenta={estado}
            />
            {estado === "BORRANDO_VENTA" && (
                <BorrarVentaTpv publicar={emitir} venta={venta} />
            )}
            {estado === "EMITIENDO_VENTA" && (
                <EmitirVentaTpv publicar={emitir} venta={venta} />
            )}
            {estado === "PAGANDO_EN_EFECTIVO" && (
                <PagarEfectivoVentaTpv publicar={emitir} venta={venta} />
            )}
            {estado === "PAGANDO_CON_TARJETA" && (
                <PagarTarjetaVentaTpv publicar={emitir} venta={venta} />
            )}
            {estado === "PAGANDO_CON_QR" && (
                <PagarQrVentaTpv publicar={emitir} venta={venta} />
            )}
            {estado === "PAGANDO_CON_VALE" && (
                <PagoValeVentaTpv publicar={emitir} venta={venta} />
            )}
            {estado === "BORRANDO_PAGO" && pagos.activo && (
                <BorrarPagoVentaTpv
                    publicar={emitir}
                    venta={venta}
                    idPago={pagos.activo.id}
                />
            )}
            {estado === "DEVOLVIENDO_VENTA" && (
                <DevolverVentaTpv venta={venta} publicar={emitir} />
            )}
            {estado === "GENERANDO_TIQUE_REGALO" && (
                <TiqueRegaloVentaTpv venta={venta} lineas={lineas.lista} publicar={emitir} />
            )}
        </div>
        </Detalle>
    );
};
