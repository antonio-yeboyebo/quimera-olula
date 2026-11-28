import { LineaOrdenAlmacen, OrdenAlmacen } from "../../diseño.ts";
import { definicionDeLinea } from "../../pasos/catalogo.ts";
import { FaseLectura } from "../../pasos/diseño.ts";
import { cantidadPendiente } from "../../pasos/lector.ts";
import { lineasConSobrante, ordenAlbaranable, sobranteLinea } from "../../dominio.ts";
import { tAlmacen } from "../../../i18n/index.ts";

export type AccionPrincipalData = {
    label: string;
    instruccion: string;
    onClick: () => void;
};

type Handlers = {
    emitirPickSolicitado: () => void;
    emitirDropSolicitado: () => void;
    emitirColocacionSolicitada: () => void;
    emitirAlbaranadoSolicitado: () => void;
    emitirDevolucionSobrante?: (linea: LineaOrdenAlmacen) => void;
};

const tienePasos = (linea: LineaOrdenAlmacen, orden: OrdenAlmacen, fase: FaseLectura): boolean =>
    !!definicionDeLinea(linea, orden, fase);

const isCompleta = (linea: LineaOrdenAlmacen, orden: OrdenAlmacen, fase: FaseLectura): boolean =>
    !tienePasos(linea, orden, fase) || cantidadPendiente(linea, orden, fase) <= 0;

const instruccionDeGrupo = (
    lineas: LineaOrdenAlmacen[],
    orden: OrdenAlmacen,
    fase: FaseLectura,
): string => {
    const primera = lineas.find((l) => !isCompleta(l, orden, fase)) ?? lineas[0];
    return (primera && definicionDeLinea(primera, orden, fase)?.instruccion) ?? tAlmacen("orden.leeLasLineas");
};

const agruparPorUbicacion = (
    lineas: LineaOrdenAlmacen[],
    getUbi: (l: LineaOrdenAlmacen) => string | null,
): Array<{ ubiId: string | null; lineas: LineaOrdenAlmacen[] }> => {
    const ordenUbis: Array<string | null> = [];
    const mapa = new Map<string | null, LineaOrdenAlmacen[]>();

    for (const linea of lineas) {
        const ubiId = getUbi(linea);
        if (!mapa.has(ubiId)) {
            ordenUbis.push(ubiId);
            mapa.set(ubiId, []);
        }
        mapa.get(ubiId)!.push(linea);
    }

    return ordenUbis.map((ubiId) => ({ ubiId, lineas: mapa.get(ubiId)! }));
};

const getAccionPick = (
    orden: OrdenAlmacen,
    lineasOrdenadas: LineaOrdenAlmacen[],
    emitirPickSolicitado: () => void,
): AccionPrincipalData | null => {
    const conPick = lineasOrdenadas.filter((l) => tienePasos(l, orden, "PICK"));
    const grupos = agruparPorUbicacion(conPick, (l) => l.idUbicacionOrigen);
    const grupoActual = grupos.find((g) => g.lineas.some((l) => !isCompleta(l, orden, "PICK")));
    if (!grupoActual) return null;

    const instruccionPasos = instruccionDeGrupo(grupoActual.lineas, orden, "PICK");
    const algunaLeida = grupoActual.lineas.some((l) => (l.cantidadPick ?? 0) > 0);
    const ubicacion = grupoActual.lineas[0]?.ubicacionOrigen ?? tAlmacen("orden.ubicacionDesconocida");

    const instruccion = algunaLeida
        ? `${instruccionPasos} en ${ubicacion}`
        : tAlmacen("orden.veALaUbicacionUbicacionY", { ubicacion, instruccionPasos });

    return { label: tAlmacen("orden.leerPick"), instruccion, onClick: emitirPickSolicitado };
};

const getAccionDrop = (
    orden: OrdenAlmacen,
    lineasOrdenadas: LineaOrdenAlmacen[],
    handlers: Handlers,
): AccionPrincipalData | null => {
    const conDrop = lineasOrdenadas.filter((l) => tienePasos(l, orden, "DROP"));
    const grupos = agruparPorUbicacion(conDrop, (l) => l.idUbicacionDestino);
    const grupoActual = grupos.find((g) => g.lineas.some((l) => !isCompleta(l, orden, "DROP")));
    if (!grupoActual) return null;

    const instruccionPasos = instruccionDeGrupo(grupoActual.lineas, orden, "DROP");
    const algunaLeida = grupoActual.lineas.some((l) => (l.cantidadReal ?? 0) > 0);

    let instruccion: string;
    if (grupoActual.ubiId === null) {
        instruccion = tAlmacen("orden.veALaUbicacionDeDrop", { instruccionPasos });
    } else {
        const ubicacion = grupoActual.lineas[0]?.ubicacionDestino ?? grupoActual.ubiId;
        instruccion = algunaLeida
            ? instruccionPasos
            : tAlmacen("orden.veALaUbicacionUbicacionY", { ubicacion, instruccionPasos });
    }

    return {
        label: tAlmacen("orden.leerDrop"),
        instruccion,
        onClick: handlers.emitirDropSolicitado,
    };
};

export function calcularAccionPrincipal(
    orden: OrdenAlmacen,
    handlers: Handlers,
): AccionPrincipalData | null {
    if (orden.lineas.length === 0) return null;

    if (orden.estado === "TERMINADA" && orden.tipo === "ENTRADA") {
        return {
            label: tAlmacen("orden.colocar"),
            instruccion: tAlmacen("orden.recepcionTerminadaUsaElBotonColocar"),
            onClick: handlers.emitirColocacionSolicitada,
        };
    }

    // El pedido cambió en ventas después de recoger: antes que nada, devolver lo que sobra.
    const conSobrante = orden.estado !== "TERMINADA" ? lineasConSobrante(orden) : [];
    if (conSobrante.length > 0 && handlers.emitirDevolucionSobrante) {
        const linea = conSobrante[0];
        const emitir = handlers.emitirDevolucionSobrante;
        return {
            label: tAlmacen("orden.devolverSobrante"),
            instruccion: tAlmacen("orden.elPedidoHaCambiadoSobranLinea", { linea: sobranteLinea(linea), sku: linea.sku, articulo: linea.articulo, valor: (conSobrante.length > 1 ? tAlmacen("orden.lengthLineasConSobrante", { length: conSobrante.length }) : "") }),
            onClick: () => emitir(linea),
        };
    }

    if (ordenAlbaranable(orden)) {
        return {
            label: tAlmacen("orden.albaranar"),
            instruccion: tAlmacen("orden.salidaPreparadaUsaElBotonAlbaranar"),
            onClick: handlers.emitirAlbaranadoSolicitado,
        };
    }

    if (orden.estado !== "PENDIENTE") return null;

    const lineasOrdenadas = [...orden.lineas].sort((a, b) => a.id.localeCompare(b.id));

    type Fase = 'PICK' | 'DROP';
    let faseActual: Fase;

    if (orden.tipo === "ENTRADA") {
        faseActual = 'DROP';
    } else if (orden.tipo === "SALIDA") {
        faseActual = 'PICK';
    } else {
        // TRASPASO
        const todasPickCompletas = lineasOrdenadas.every((l) => isCompleta(l, orden, "PICK"));
        faseActual = todasPickCompletas ? 'DROP' : 'PICK';
    }

    if (faseActual === 'PICK') {
        return getAccionPick(orden, lineasOrdenadas, handlers.emitirPickSolicitado);
    }

    return getAccionDrop(orden, lineasOrdenadas, handlers);
}
