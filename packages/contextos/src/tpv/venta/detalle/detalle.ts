import { ejecutarListaProcesos, MetaModelo, publicar } from "@olula/lib/dominio.ts";

import { getReportFactura } from "#/ventas/factura/infraestructura.ts";
import { cambioClienteVentaVacio, metaCambioClienteVenta, metaVenta } from "#/ventas/venta/dominio.ts";
import { ProcesarContexto } from "@olula/lib/diseño.js";
import { imprimir_blob } from "@olula/lib/impresion.js";
import { accionesListaEntidades, ListaEntidades, ProcesarListaEntidades } from "@olula/lib/ListaEntidades.js";
import { CambioClienteFactura, LineaFactura, PagoVentaTpv, VentaTpv } from "../diseño.ts";
import { ventaTpvVacia } from "../dominio.ts";
import { getLineas, getPagos, getReportVale, getReportVenta, getVenta, patchCambiarDescuento, patchFechaVenta, patchVenta, postEmitirVale, postLineaPorBarcode } from "../infraestructura.ts";


export const cambioClienteFacturaVacio: CambioClienteFactura = cambioClienteVentaVacio;

export const metaCambioClienteFactura: MetaModelo<CambioClienteFactura> = metaCambioClienteVenta;



export type EstadoVentaTpv = (
    'INICIAL' | "ABIERTA" | "EMITIDA"
    | "BORRANDO_VENTA" | "EMITIENDO_VENTA"
    | "PAGANDO_EN_EFECTIVO" | "PAGANDO_CON_TARJETA" | "PAGANDO_CON_VALE" | "PAGANDO_CON_QR"
    | "BORRANDO_PAGO" | "CAMBIANDO_CLIENTE" | "CAMBIANDO_DESCUENTO"
    | "CREANDO_LINEA" | "BORRANDO_LINEA" | "CAMBIANDO_LINEA"
    | "DEVOLVIENDO_VENTA"
    | "GENERANDO_TIQUE_REGALO"
);

export type ContextoVentaTpv = {
    estado: EstadoVentaTpv,
    venta: VentaTpv;
    // ventaInicial: VentaTpv;
    pagos: ListaEntidades<PagoVentaTpv>
    lineas: ListaEntidades<LineaFactura>;
};

const conPagos = (fn: ProcesarListaEntidades<PagoVentaTpv>) => (ctx: ContextoVentaTpv) => ({ ...ctx, pagos: fn(ctx.pagos) });

export const Pagos = accionesListaEntidades(conPagos);

const conLineas = (fn: ProcesarListaEntidades<LineaFactura>) => (ctx: ContextoVentaTpv) => ({ ...ctx, lineas: fn(ctx.lineas) });

export const Lineas = accionesListaEntidades(conLineas);

const onChangeVentaTpv = (venta: VentaTpv, campo: string, _: unknown, otros?: Record<string, unknown>) => {
    if (campo === "divisa_id" && otros) {
        return {
            ...venta,
            tasa_conversion: otros.tasa_conversion as number
        }
    }
    return venta;
}

export const metaVentaTpv: MetaModelo<VentaTpv> = {
    campos: {
        ...metaVenta.campos,
        fecha: { tipo: "fecha", requerido: true },
    },
    editable: (venta: VentaTpv) => {
        return venta.abierta;
    },
    onChange: onChangeVentaTpv
};


type ProcesarVentaTpv = ProcesarContexto<EstadoVentaTpv, ContextoVentaTpv>;

const pipeVentaTpv = ejecutarListaProcesos<EstadoVentaTpv, ContextoVentaTpv>;

const cargarVenta: (_: string) => ProcesarVentaTpv = (idVenta) =>
    async (contexto) => {

        const venta = await getVenta(idVenta);
        return {
            ...contexto,
            venta,
            ventaInicial: venta
        }
    }

export const refrescarCabecera: ProcesarVentaTpv = async (contexto) => {

    const venta = await getVenta(contexto.venta.id);
    return [
        {
            ...contexto,
            venta,
            ventaInicial: venta
        },
        [["venta_cambiada", venta]]
    ]
}

// export const refrescarVentaCambiada: ProcesarVentaTpv = async (contexto) => {

//     const venta = await getVenta(contexto.venta.id);
//     return [
//         {
//             ...contexto,
//             venta,
//             ventaInicial: venta
//         },
//         [["venta_cambiada", venta]]
//     ]
// }


// export const cancelarcambioVenta: ProcesarVentaTpv = async (contexto) => {

//     return {
//         ...contexto,
//         venta: contexto.ventaInicial
//     }
// }

export const abiertaOEmitidaContexto: ProcesarVentaTpv = async (contexto) => {
    return {
        ...contexto,
        estado: contexto.venta.abierta ? "ABIERTA" : "EMITIDA"
    }
}

export const refrescarPagos: ProcesarVentaTpv = async (contexto) => {

    const pagos = await getPagos(contexto.venta.id);
    return {
        ...contexto,
        pagos: {
            lista: pagos,
            total: pagos.length,
            activo: null
        },
    }
}

export const refrescarLineas: ProcesarVentaTpv = async (contexto) => {

    const lineas = await getLineas(contexto.venta.id);
    return {
        ...contexto,
        lineas: {
            lista: lineas,
            total: lineas.length,
            activo: null
        }
    }
}

export const activarPago: ProcesarVentaTpv = async (contexto, payload) => {

    const pagoActivo = payload as PagoVentaTpv;
    return {
        ...contexto,
        pagoActivo
    }
}

const activarPagoPorIndice: (_: number) => ProcesarVentaTpv = (indice) => async (contexto) => {

    const pagos = contexto.pagos.lista;
    const pagoActivo = pagos.length > 0
        ? indice >= 0 && indice < pagos.length
            ? pagos[indice]
            : pagos[pagos.length - 1]
        : null

    return {
        ...contexto,
        pagoActivo
    }
}

// export const getFormVenta = (
//     contexto: ContextoVentaTpv,
//     setCtx: (ctx: ContextoVentaTpv) => void,
//     emitir: EmitirEvento,
//     intentar: Intentar
// ): FormModelo => {

//     const { venta, ventaInicial } = contexto
//     const meta = metaVentaTpv;

//     function onModeloCambiado(venta: VentaTpv) {
//         setCtx({ ...contexto, venta });
//     }

//     async function autoGuardado(venta: VentaTpv) {
//         await intentar(async () => {
//             await guardarVenta(contexto, venta);
//             await emitir("venta_guardada");
//         });
//     }

//     return getFormProps(venta, ventaInicial, meta, onModeloCambiado, autoGuardado);
// }

export const guardarVenta = async (contexto: ContextoVentaTpv, venta: VentaTpv): Promise<void> => {
    if (venta.idAgente !== contexto.venta.idAgente) {
        await patchVenta(contexto.venta.id, venta);
    }
    if (venta.fecha !== contexto.venta.fecha) {
        await patchFechaVenta(contexto.venta.id, venta.fecha);
    }
}


export const cambiarVenta: ProcesarVentaTpv = async (contexto, payload) => {

    const venta = payload as VentaTpv;
    await patchVenta(contexto.venta.id, venta)

    return pipeVentaTpv(contexto, [
        refrescarCabecera,
        'ABIERTA',
    ]);
}


// export const cambiarVenta2: ProcesarVentaTpv = async (contexto, payload) => {

//     const venta = payload as VentaTpv;
//     return {
//         ...contexto,
//         venta
//     }
// }

export const onVentaBorrada: ProcesarVentaTpv = async (contexto) => {

    const venta = contexto.venta;

    return pipeVentaTpv(contexto, [
        getContextoVacio,
        publicar('venta_borrada', venta.id)
    ]);
}

export const onLineaCreada: ProcesarVentaTpv = async (contexto, payload) => {

    const { id } = payload as { id: string };

    return pipeVentaTpv(contexto, [
        refrescarCabecera,
        refrescarLineas,
        activarLineaPorId(id),
    ]);
}

export const crearLineaPorBarcode: ProcesarVentaTpv = async (contexto, payload) => {

    const { barcode, cantidad } = payload as { barcode: string; cantidad: number };
    const idLinea = await postLineaPorBarcode(contexto.venta.id, {
        barcode,
        cantidad
    });

    return pipeVentaTpv(contexto, [
        refrescarCabecera,
        refrescarLineas,
        activarLineaPorId(idLinea),
        'ABIERTA',
    ]);
}

export const onLineaCambiada: ProcesarVentaTpv = async (contexto, payload) => {

    const linea = payload as LineaFactura;

    return pipeVentaTpv(contexto, [
        refrescarCabecera,
        refrescarLineas,
        activarLineaPorId(linea.id),
        'ABIERTA',
    ]);
}


export const onLineaBorrada: ProcesarVentaTpv = async (contexto, payload) => {

    const idLinea = payload as string;

    const indiceLineaActiva = contexto.lineas.lista.findIndex(l => l.id === idLinea);

    return pipeVentaTpv(contexto, [
        refrescarCabecera,
        refrescarLineas,
        activarLineaPorIndice(indiceLineaActiva),
        'ABIERTA',
    ]);
}

export const cambiarDescuento: ProcesarVentaTpv = async (contexto, payload) => {
    const { dto_porcentual } = payload as { dto_porcentual: number };
    await patchCambiarDescuento(contexto.venta.id, dto_porcentual);

    return pipeVentaTpv(contexto, [
        refrescarCabecera,
        'ABIERTA',
    ]);
}

export const emitirVale: ProcesarVentaTpv = async (contexto, payload) => {

    const venta = payload as VentaTpv
    await postEmitirVale(venta)

    const [ctx, eventos] = await pipeVentaTpv(contexto, [
        refrescarCabecera,
        refrescarPagos,
        abiertaOEmitidaContexto,
    ]);
    await imprimirVale(ctx.venta.codigo);
    await imprimirTicketOFactura(ctx.venta, ctx.pagos.lista);
    return [ctx, eventos];
}


const activarLineaPorIndice = (indice: number) => async (contexto: ContextoVentaTpv) => {

    const lineas = contexto.lineas.lista;
    const lineaActiva = lineas.length > 0
        ? indice >= 0 && indice < lineas.length
            ? lineas[indice]
            : lineas[lineas.length - 1]
        : null

    return {
        ...contexto,
        lineas: {
            ...contexto.lineas,
            activo: lineaActiva
        }
    }
}

const activarLineaPorId = (id: string) => async (contexto: ContextoVentaTpv) => {

    const lineas = contexto.lineas;
    const lineaActiva = lineas.lista.find(l => l.id === id) ?? null;

    return {
        ...contexto,
        lineas: {
            ...contexto.lineas,
            activo: lineaActiva
        }
    }
}

export const getContextoVacio: ProcesarVentaTpv = async (contexto) => {

    return {
        ...contexto,
        estado: 'INICIAL',
        venta: ventaTpvVacia,
        pagoActivo: null,
        lineaActiva: null
    }
}

export const cargarContexto: ProcesarVentaTpv = async (contexto, payload) => {

    const idVenta = payload as string;
    if (idVenta) {
        return pipeVentaTpv(
            contexto,
            [
                cargarVenta(idVenta),
                refrescarPagos,
                refrescarLineas,
                abiertaOEmitidaContexto,
                activarLineaPorIndice(0),
                activarPagoPorIndice(0),
            ],
            payload
        );
    } else {
        return getContextoVacio(contexto);
    }
}



export const imprimirTicketOFactura = async (
    venta: VentaTpv,
    pagos: PagoVentaTpv[],
    valesAntesQueTique = false
) => {
    if (venta.cliente) {
        const blob = await getReportFactura(venta.id);
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        return;
    }
    const imprimirTique = async () => imprimir_blob(await getReportVenta(venta.id));
    const imprimirValesConSaldo = async () => {
        const pagosVale = pagos.filter((p) => p.vale && p.saldoVale && p.saldoVale > 0);
        for (const p of pagosVale) {
            await imprimirVale(p.vale!);
        }
    };
    if (valesAntesQueTique) {
        await imprimirValesConSaldo();
        await imprimirTique();
    } else {
        await imprimirTique();
        await imprimirValesConSaldo();
    }
}

export const imprimirVale = async (idVale: string) => {
    console.log("getReportVale llamado con", idVale);
    const blob = await getReportVale(idVale);
    console.log("blob recibido", blob?.size, blob?.type);
    await imprimir_blob(blob);
    console.log("imprimir_blob completado para vale");
}


