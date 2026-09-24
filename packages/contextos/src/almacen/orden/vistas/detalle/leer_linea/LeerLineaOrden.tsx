import { Caja } from "#/almacen/comun/componentes/Caja.tsx";
import { Lote } from "#/almacen/comun/componentes/Lote.tsx";
import { Ubicacion } from "#/almacen/comun/componentes/Ubicacion.tsx";
import { buscarCajaCompletaPorTexto, buscarCajaPorTexto, buscarUbicacionPorTexto } from "#/almacen/comun/voz_resolvers.ts";

import { LineaOrdenAlmacen, OrdenAlmacen } from "#/almacen/orden/diseño.ts";
import { getSkuLote, registrarLecturaOrden } from "#/almacen/orden/infraestructura.ts";
import { IndicadorVoz } from "@olula/componentes/atomos/indicador_voz.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QPasos } from "@olula/componentes/atomos/qpasos.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { PreguntaVoz, useFlujoVoz } from "@olula/lib/voz/useFlujoVoz.ts";
import { ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { LecturaSkuLote } from "../lectura/LecturaSkuLote.tsx";
import "./LeerLineaOrden.css";

type PasoGuion = "sku-lote" | "cantidad" | "caja-destino" | "caja-destino-capacidad" | "ubi-destino" | "ubi-origen" | "caja-origen" | "caja-origen-completa" | "caja-destino-completa";

const instrucciones: Record<PasoGuion, string> = {
    "sku-lote": "Lee el código de barras",
    "cantidad": "Dime la cantidad",
    "caja-destino": "Dime la caja de destino",
    "caja-destino-capacidad": "Dime la caja de destino",
    "ubi-destino": "Dime la ubicación de destino",
    "ubi-origen": "Dime la ubicación de origen",
    "caja-origen": "Dime la caja de origen",
    "caja-origen-completa": "Dime la caja de origen",
    "caja-destino-completa": "Dime la caja de destino",
};

const guion: Record<string, PasoGuion[]> = {
    // Entrada
    // "68": ["cantidad", "caja-destino"], // R1 en cajas
    "68": ["caja-destino-capacidad"], // R1 en cajas

    // "69": ["sku-lote", "cantidad"], // L1 lotes
    "69": ["cantidad"], // L1 lotes
    // Cuarentena
    "70": ["ubi-destino"], // L1 lotes
    // Colocar en masivo / Put away
    "71": ["caja-origen-completa", "ubi-destino"], // R1 en cajas > MS-1
    // Reposición de picking
    "77": ["caja-origen-completa"], // R1 en cajas desde MS-1 > TR
    "78": ["caja-origen-completa", "ubi-destino"], // R1 en cajas desde TR > MS-1
    // Picking
    "73": ["caja-origen", "cantidad", "ubi-destino"], // 1 ud de R1 a BD1
    "74": ["caja-origen", "cantidad", "ubi-destino"], // 2 ud de R1 a BD2
    // Packing
    // "75": ["caja-origen", "cantidad", "ubi-destino"], // 1 ud de R1 a nueva caja desde BD1 (se hace con lectura de bandeja, no con lectura de línea)
    // "76": ["caja-origen", "cantidad", "ubi-destino"], // 2 ud de R1 a nueva caja desde BD2 (se hace con lectura de bandeja, no con lectura de línea)
    // Paletizar
    // "79": ["caja-origen-completa", "caja-destino"], // 2 ud de R1. Llevamos su caja dentro del palet
};

const getPaso = (linea: LineaOrdenAlmacen): PasoGuion[] => {
    // Ver si en función de los datos que la línea tenga (lote, caja, etc) se puede inferir el paso
    if (linea.sku === "ejemplo")
        return ["caja-destino-capacidad"]
    return ["caja-destino-capacidad"]
    // const guionLinea = guion[linea.sku];
    // return guionLinea ?? ["sku-lote", "cantidad", "caja-destino", "caja-destino-capacidad", "ubi-destino", "ubi-origen", "caja-origen", "caja-origen-completa"];
}

const PasoWrapper = ({ instruccion, children }: { instruccion: string; children: ReactNode }) => (
    <div className="paso-guion">
        <p className="paso-guion__instruccion">{instruccion}</p>
        {children}
    </div>
);

type FilaResumen = {
    campo: string;
    previsto: string | null;
    efectivo: string | null;
    pendiente: boolean;
};

const calcularFilasResumen = (
    orden: OrdenAlmacen,
    linea: LineaOrdenAlmacen,
    valores: ValoresAcumulados,
    pasoGuion: PasoGuion[],
    pasoActual: number,
    cantidadARegistrar: number,
): FilaResumen[] => {
    const filas: FilaResumen[] = [];
    const mostrarOrigen = orden.tipo === "SALIDA" || orden.tipo === "TRASPASO";
    const mostrarDestino = orden.tipo === "ENTRADA" || orden.tipo === "TRASPASO";

    const enGuion = (pasos: PasoGuion[]): boolean =>
        pasos.some((p) => pasoGuion.includes(p));

    const completado = (pasos: PasoGuion[]): boolean =>
        pasos.some((p) => {
            const idx = pasoGuion.indexOf(p);
            return idx !== -1 && idx < pasoActual;
        });

    // SKU
    const skuEnGuion = enGuion(["sku-lote"]);
    const skuPrevisto = linea.sku ? `${linea.sku} - ${linea.articulo}` : null;
    const skuEfectivo = valores.sku
        ? `${valores.sku} - ${valores.articulo ?? ""}`
        : (!skuEnGuion && linea.sku ? `${linea.sku} - ${linea.articulo}` : null);
    filas.push({ campo: "SKU", previsto: skuPrevisto, efectivo: skuEfectivo, pendiente: !skuEfectivo });

    // Lote
    if (linea.porLotes) {
        const loteEnGuion = enGuion(["sku-lote"]);
        const loteEfectivo = valores.loteId !== undefined
            ? valores.loteId
            : (!loteEnGuion ? linea.loteId : null);
        filas.push({ campo: "Lote", previsto: linea.loteId, efectivo: loteEfectivo, pendiente: !loteEfectivo });
    }

    // Cantidad
    const cantPasos: PasoGuion[] = ["cantidad", "caja-destino-capacidad", "caja-origen-completa"];
    const cantEnGuion = enGuion(cantPasos);
    const cantPendiente = cantEnGuion && valores.cantidad === undefined && !completado(cantPasos);
    filas.push({
        campo: "Cantidad",
        previsto: String(linea.cantidadPrevista),
        efectivo: cantPendiente ? null : String(cantidadARegistrar),
        pendiente: cantPendiente,
    });

    // Ubi. Origen
    if (mostrarOrigen) {
        const ubiOrigenEnGuion = enGuion(["ubi-origen"]);
        const efectivo = valores.ubicacionOrigen
            ?? (!ubiOrigenEnGuion ? linea.ubicacionOrigen : null);
        filas.push({ campo: "Ubi. Origen", previsto: linea.ubicacionOrigen, efectivo, pendiente: !efectivo });
    }

    // Caja Origen
    if (mostrarOrigen) {
        const cajaOrigenEnGuion = enGuion(["caja-origen", "caja-origen-completa"]);
        const efectivo = valores.cajaOrigen
            ?? (!cajaOrigenEnGuion ? linea.cajaOrigen : null);
        filas.push({ campo: "Caja Origen", previsto: linea.cajaOrigen, efectivo, pendiente: !efectivo });
    }

    // Ubi. Destino
    if (mostrarDestino) {
        const ubiDestinoEnGuion = enGuion(["ubi-destino"]);
        const efectivo = valores.ubicacionDestino
            ?? (!ubiDestinoEnGuion ? linea.ubicacionDestino : null);
        filas.push({ campo: "Ubi. Destino", previsto: linea.ubicacionDestino, efectivo, pendiente: !efectivo });
    }

    // Caja Destino
    if (mostrarDestino) {
        const cajaDestinoEnGuion = enGuion(["caja-destino", "caja-destino-capacidad", "caja-destino-completa"]);
        const efectivo = valores.cajaDestino
            ?? (!cajaDestinoEnGuion ? linea.cajaDestino : null);
        filas.push({ campo: "Caja Destino", previsto: linea.cajaDestino, efectivo, pendiente: !efectivo });
    }

    return filas;
};

const ResumenLeerLinea = ({
    orden,
    linea,
    valores,
    pasoGuion,
    pasoActual,
    cantidadARegistrar,
}: {
    orden: OrdenAlmacen;
    linea: LineaOrdenAlmacen;
    valores: ValoresAcumulados;
    pasoGuion: PasoGuion[];
    pasoActual: number;
    cantidadARegistrar: number;
}) => {
    const filas = calcularFilasResumen(orden, linea, valores, pasoGuion, pasoActual, cantidadARegistrar);

    return (
        <table className="resumen-leer-linea">
            <thead>
                <tr>
                    <th>Campo</th>
                    <th>Previsto</th>
                    <th>Efectivo</th>
                </tr>
            </thead>
            <tbody>
                {filas.map((fila) => (
                    <tr key={fila.campo}>
                        <td className="resumen-leer-linea__campo">{fila.campo}</td>
                        <td className="resumen-leer-linea__previsto">
                            {fila.previsto ?? <span className="q-texto-secundario">--</span>}
                        </td>
                        <td className="resumen-leer-linea__efectivo">
                            {fila.efectivo ? (
                                <QEtiqueta variante="exito">{fila.efectivo}</QEtiqueta>
                            ) : (
                                <QEtiqueta variante="advertencia">Pendiente</QEtiqueta>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

type ValoresAcumulados = {
    sku?: string;
    articulo?: string;
    loteId?: string | null;
    cantidad?: number;
    idCajaOrigen?: string;
    cajaOrigen?: string;
    idCajaDestino?: string;
    cajaDestino?: string;
    idUbicacionDestino?: string;
    ubicacionDestino?: string;
    idUbicacionOrigen?: string;
    ubicacionOrigen?: string;
};

const validarCajaContraLinea = (
    caja: { sku?: string | null; idLote?: string | null },
    linea: LineaOrdenAlmacen,
): string | null => {
    if (linea.sku) {
        if (!caja.sku) return `La caja no tiene SKU asignado. Se esperaba: ${linea.sku}`;
        if (caja.sku !== linea.sku) return `La caja pertenece al SKU ${caja.sku}. Se esperaba: ${linea.sku}`;
    }
    if (linea.loteId) {
        if (!caja.idLote) return `La caja no tiene lote asignado. Se esperaba: ${linea.loteId}`;
        if (caja.idLote !== linea.loteId) return `La caja pertenece al lote ${caja.idLote}. Se esperaba: ${linea.loteId}`;
    }
    return null;
};

const getPreguntaVozParaPaso = (paso: PasoGuion, linea: LineaOrdenAlmacen): PreguntaVoz | null => {
    switch (paso) {
        case "cantidad":
            return {
                instruccion: instrucciones[paso],
                tipo: "numero",
                confirmacion: (v) => `${v} unidades, ¿correcto?`,
            };
        case "caja-destino":
            return {
                instruccion: instrucciones[paso],
                tipo: "texto",
                resolver: async (texto) => {
                    const caja = await buscarCajaPorTexto(texto);
                    return caja ? { id: caja.id, lpn: caja.lpn } : null;
                },
                confirmacion: (v) => `Caja ${v.lpn}, ¿correcto?`,
            };
        case "caja-destino-capacidad":
            return {
                instruccion: instrucciones[paso],
                tipo: "texto",
                resolver: async (texto) => {
                    const caja = await buscarCajaCompletaPorTexto(texto);
                    if (!caja) return null;
                    if (validarCajaContraLinea(caja, linea)) return null;
                    return { id: caja.id, lpn: caja.lpn, sku: caja.sku, idLote: caja.idLote, capacidad: caja.capacidad };
                },
                confirmacion: (v) => `Caja ${v.lpn}, ${v.capacidad ?? "sin"} capacidad, ¿correcto?`,
            };
        case "caja-origen":
            return {
                instruccion: instrucciones[paso],
                tipo: "texto",
                resolver: async (texto) => {
                    const caja = await buscarCajaPorTexto(texto);
                    return caja ? { id: caja.id, lpn: caja.lpn } : null;
                },
                confirmacion: (v) => `Caja ${v.lpn}, ¿correcto?`,
            };
        case "caja-origen-completa":
            return {
                instruccion: instrucciones[paso],
                tipo: "texto",
                resolver: async (texto) => {
                    const caja = await buscarCajaPorTexto(texto);
                    return caja ? { id: caja.id, lpn: caja.lpn, cantidad: caja.cantidad } : null;
                },
                confirmacion: (v) => `Caja ${v.lpn}, ${v.cantidad ?? 0} unidades, ¿correcto?`,
            };
        case "caja-destino-completa":
            return {
                instruccion: instrucciones[paso],
                tipo: "texto",
                resolver: async (texto) => {
                    const caja = await buscarCajaCompletaPorTexto(texto);
                    if (!caja) return null;
                    if (validarCajaContraLinea(caja, linea)) return null;
                    return { id: caja.id, lpn: caja.lpn, sku: caja.sku, idLote: caja.idLote };
                },
                confirmacion: (v) => `Caja ${v.lpn}${v.sku ? `, sku ${v.sku}` : ""}, ¿correcto?`,
            };
        case "ubi-destino":
        case "ubi-origen":
            return {
                instruccion: instrucciones[paso],
                tipo: "texto",
                resolver: async (texto) => {
                    const ubi = await buscarUbicacionPorTexto(texto);
                    return ubi ? { id: ubi.id, codigo: ubi.codigo } : null;
                },
                confirmacion: (v) => `Ubicación ${v.codigo}, ¿correcto?`,
            };
        case "sku-lote":
            return {
                instruccion: instrucciones[paso],
                tipo: "texto",
                resolver: async (texto) => {
                    try {
                        const resultado = await getSkuLote(texto);
                        return resultado;
                    } catch {
                        return null;
                    }
                },
                confirmacion: (v) => `Artículo ${v.descripcion}, ¿correcto?`,
            };
    }
};

export const LeerLineaOrden = ({
    orden,
    linea,
    publicar,
    modoVoz = false,
}: {
    orden: OrdenAlmacen;
    linea: LineaOrdenAlmacen;
    publicar: EmitirEvento;
    modoVoz?: boolean;
}) => {
    const { intentar } = useContext(ContextoError);
    const [pasoActual, setPasoActual] = useState<number>(0);
    const [valores, setValores] = useState<ValoresAcumulados>({});
    const [errorCaja, setErrorCaja] = useState<string | null>(null);
    const contenedorRef = useRef<HTMLDivElement>(null);
    const flujoVoz = useFlujoVoz();
    const vozActivaRef = useRef(false);

    const pasoGuion = getPaso(linea)


    // Auto-salta el paso sku-lote si la línea ya tiene los datos necesarios.
    // Para el resto de pasos, enfoca el primer input visible tras el render.
    useEffect(() => {
        const paso = pasoGuion[pasoActual];
        if (paso === "sku-lote") {
            const skuEfectivo = valores.sku ?? linea.sku;
            const loteEfectivo = valores.loteId !== undefined ? valores.loteId : linea.loteId;
            const completo = !!skuEfectivo && (linea.porLotes ? !!loteEfectivo : true);
            if (completo) {
                setPasoActual((p) => p + 1);
                return;
            }
        }
        if (!modoVoz) {
            const raf = requestAnimationFrame(() => {
                contenedorRef.current?.querySelector<HTMLElement>("input:not([type='hidden'])")?.focus();
            });
            return () => cancelAnimationFrame(raf);
        }
    }, [pasoActual]); // eslint-disable-line react-hooks/exhaustive-deps

    // --- Flujo de voz: cuando modoVoz está activo, guiar cada paso por voz ---
    useEffect(() => {
        if (!modoVoz || !flujoVoz.soportado) return;
        if (pasoActual >= pasoGuion.length) return;

        const paso = pasoGuion[pasoActual];
        const pregunta = getPreguntaVozParaPaso(paso, linea);
        if (!pregunta) return;

        // Evitar doble ejecución
        if (vozActivaRef.current) return;
        vozActivaRef.current = true;

        const ejecutar = async () => {
            try {
                const valor = await flujoVoz.preguntar(pregunta);
                aplicarValorVoz(paso, valor);
            } catch (err) {
                if (err instanceof Error && err.message === "cancelado") return;
                console.error("Error en flujo de voz:", err);
            } finally {
                vozActivaRef.current = false;
            }
        };

        ejecutar();

        return () => {
            flujoVoz.cancelar();
            vozActivaRef.current = false;
        };
    }, [modoVoz, pasoActual]); // eslint-disable-line react-hooks/exhaustive-deps

    const extraerDeltaVoz = (paso: PasoGuion, valor: unknown): Partial<ValoresAcumulados> => {
        switch (paso) {
            case "cantidad":
                return { cantidad: valor as number };
            case "caja-destino": {
                const caja = valor as { id: string; lpn: string };
                return { idCajaDestino: caja.id, cajaDestino: caja.lpn };
            }
            case "caja-destino-capacidad": {
                const caja = valor as { id: string; lpn: string; sku: string | null; idLote: string | null; capacidad: number | null };
                return {
                    idCajaDestino: caja.id,
                    cajaDestino: caja.lpn,
                    sku: caja.sku ?? undefined,
                    loteId: caja.idLote,
                    cantidad: caja.capacidad ?? undefined,
                };
            }
            case "caja-origen": {
                const caja = valor as { id: string; lpn: string };
                return { idCajaOrigen: caja.id, cajaOrigen: caja.lpn };
            }
            case "caja-origen-completa": {
                const caja = valor as { id: string; lpn: string; cantidad: number | null };
                return { idCajaOrigen: caja.id, cajaOrigen: caja.lpn, cantidad: caja.cantidad ?? undefined };
            }
            case "caja-destino-completa": {
                const caja = valor as { id: string; lpn: string; sku: string | null; idLote: string | null };
                return {
                    idCajaDestino: caja.id,
                    cajaDestino: caja.lpn,
                    sku: caja.sku ?? undefined,
                    loteId: caja.idLote,
                };
            }
            case "ubi-destino": {
                const ubi = valor as { id: string; codigo: string };
                return { idUbicacionDestino: ubi.id, ubicacionDestino: ubi.codigo };
            }
            case "ubi-origen": {
                const ubi = valor as { id: string; codigo: string };
                return { idUbicacionOrigen: ubi.id, ubicacionOrigen: ubi.codigo };
            }
            case "sku-lote": {
                const r = valor as { sku: string; descripcion: string; loteId: string | null };
                return { sku: r.sku, articulo: r.descripcion, loteId: r.loteId };
            }
        }
    };

    const registrarConValores = useCallback(async (vals: ValoresAcumulados) => {
        const sku = vals.sku ?? linea.sku;
        const articulo = vals.articulo ?? linea.articulo;
        const idLote = vals.loteId !== undefined ? vals.loteId : linea.loteId;
        const cajaCompleta = pasoGuion.includes("caja-origen-completa");
        const preguntaCant = pasoGuion.includes("cantidad");
        const cantidad = preguntaCant || pasoGuion.includes("caja-destino-capacidad") || pasoGuion.includes("caja-origen-completa")
            ? (vals.cantidad ?? linea.cantidadPrevista)
            : linea.cantidadPrevista - (linea.cantidadReal ?? 0);
        const idCajaDestino = vals.idCajaDestino !== undefined ? vals.idCajaDestino : linea.idCajaDestino;
        const idCajaOrigen = (pasoGuion.includes("caja-origen") || pasoGuion.includes("caja-origen-completa"))
            ? (vals.idCajaOrigen ?? linea.idCajaOrigen)
            : linea.idCajaOrigen;

        await intentar(() =>
            registrarLecturaOrden(orden.id, {
                sku,
                articulo,
                idLote,
                idLinea: linea.id,
                cajaCompleta,
                cantidad,
                idCajaDestino,
                idUbicacionDestino: vals.idUbicacionDestino !== undefined
                    ? vals.idUbicacionDestino
                    : linea.idUbicacionDestino,
                idCajaOrigen,
                idUbicacionOrigen: vals.idUbicacionOrigen !== undefined
                    ? vals.idUbicacionOrigen
                    : linea.idUbicacionOrigen,
            })
        );
        publicar("lectura_registrada");
    }, [linea, orden.id, intentar, publicar, pasoGuion]);

    const valoresRef = useRef(valores);
    valoresRef.current = valores;

    const aplicarValorVoz = useCallback((paso: PasoGuion, valor: unknown) => {
        const delta = extraerDeltaVoz(paso, valor);
        const finales = { ...valoresRef.current, ...delta };
        setValores(finales);

        const esUltimo = pasoActual === pasoGuion.length - 1;
        if (!esUltimo) {
            setPasoActual((p) => p + 1);
        } else {
            registrarConValores(finales);
        }
    }, [pasoActual, pasoGuion.length, registrarConValores]);

    const paso = pasoGuion[pasoActual];
    const esUltimoPaso = pasoActual === pasoGuion.length - 1;

    const skuEfectivo = valores.sku ?? linea.sku;
    const loteEfectivo = valores.loteId !== undefined ? valores.loteId : linea.loteId;

    const preguntaCantidad = pasoGuion.includes("cantidad");
    const cantidadARegistrar = preguntaCantidad || pasoGuion.includes("caja-destino-capacidad") || pasoGuion.includes("caja-origen-completa")
        ? (valores.cantidad ?? linea.cantidadPrevista)
        : linea.cantidadPrevista - (linea.cantidadReal ?? 0);
    const cantidadBloqueada = !preguntaCantidad && cantidadARegistrar <= 0;

    const cancelar = useCallback(() => {
        flujoVoz.cancelar();
        publicar("lectura_guion_cancelada");
    }, [publicar, flujoVoz]);

    // Llamado cuando LecturaSkuLote escanea un código. Avanza automáticamente
    // si tras el escaneo ya tenemos sku + lote (o no se necesita lote).
    const onSkuLoteLeido = useCallback(
        (resultado: { sku: string; descripcion: string; loteId: string | null }) => {
            const loteResultado = resultado.loteId;
            const loteResuelto = loteResultado !== null ? loteResultado : (linea.loteId ?? null);
            setValores((v) => ({
                ...v,
                sku: resultado.sku,
                articulo: resultado.descripcion,
                loteId: loteResultado,
            }));
            const completo = !linea.porLotes || !!loteResuelto;
            if (completo) {
                setPasoActual((p) => p + 1);
            }
        },
        [linea]
    );

    // Llamado cuando el usuario selecciona un lote en el picker. Avanza automáticamente.
    const onLoteSeleccionado = useCallback(
        (opcion: { valor: string; descripcion: string } | null) => {
            setValores((v) => ({ ...v, loteId: opcion?.valor ?? null }));
            if (opcion?.valor) {
                setPasoActual((p) => p + 1);
            }
        },
        []
    );

    const avanzar = useCallback(async () => {
        if (!esUltimoPaso) {
            setPasoActual((p) => p + 1);
            return;
        }

        const sku = valores.sku ?? linea.sku;
        const articulo = valores.articulo ?? linea.articulo;
        const idLote = valores.loteId !== undefined ? valores.loteId : linea.loteId;
        const cantidad = cantidadARegistrar;
        const idCajaDestino = valores.idCajaDestino !== undefined
            ? valores.idCajaDestino
            : linea.idCajaDestino;
        const cajaCompleta = pasoGuion.includes("caja-origen-completa");
        const idCajaOrigen = (pasoGuion.includes("caja-origen") || pasoGuion.includes("caja-origen-completa"))
            ? (valores.idCajaOrigen ?? linea.idCajaOrigen)
            : linea.idCajaOrigen;

        await intentar(() =>
            registrarLecturaOrden(orden.id, {
                sku,
                articulo,
                idLote,
                idLinea: linea.id,
                cajaCompleta,
                cantidad,
                idCajaDestino,
                idUbicacionDestino: valores.idUbicacionDestino !== undefined
                    ? valores.idUbicacionDestino
                    : linea.idUbicacionDestino,
                idCajaOrigen,
                idUbicacionOrigen: valores.idUbicacionOrigen !== undefined
                    ? valores.idUbicacionOrigen
                    : linea.idUbicacionOrigen,
            })
        );
        publicar("lectura_registrada");
    }, [esUltimoPaso, valores, linea, orden.id, intentar, publicar, cantidadARegistrar, pasoGuion]);

    const registrarRef = useRef(avanzar);
    registrarRef.current = avanzar;

    return (
        <QModal
            abierto={true}
            nombre="leerLineaOrden"
            titulo={modoVoz ? "Lectura guiada (voz)" : "Lectura guiada"}
            onCerrar={cancelar}
        >
            <div className="LeerLineaOrden" ref={contenedorRef}>
                <ResumenLeerLinea
                    orden={orden}
                    linea={linea}
                    valores={valores}
                    pasoGuion={pasoGuion}
                    pasoActual={pasoActual}
                    cantidadARegistrar={cantidadARegistrar}
                />
                {cantidadBloqueada && (
                    <p className="q-texto-error">La cantidad ya está completa (prevista: {linea.cantidadPrevista}, real: {linea.cantidadReal}). No hay nada que registrar.</p>
                )}

                <QPasos total={pasoGuion.length} actual={pasoActual} />

                {modoVoz && (
                    <IndicadorVoz
                        estado={flujoVoz.estado}
                        textoReconocido={flujoVoz.textoReconocido}
                        interino={flujoVoz.interino}
                    />
                )}

                {paso === "sku-lote" && !skuEfectivo && (
                    <PasoWrapper instruccion={instrucciones["sku-lote"]}>
                        <LecturaSkuLote nombre="sku-lote" onLectura={onSkuLoteLeido} />
                    </PasoWrapper>
                )}

                {paso === "sku-lote" && !!skuEfectivo && linea.porLotes && !loteEfectivo && (
                    <PasoWrapper instruccion="Selecciona el lote">
                        <Lote
                            label="Lote"
                            nombre="lote_id"
                            valor={typeof loteEfectivo === "string" ? loteEfectivo : ""}
                            sku={skuEfectivo}
                            onChange={onLoteSeleccionado}
                        />
                    </PasoWrapper>
                )}

                {paso === "cantidad" && (
                    <PasoWrapper instruccion={instrucciones[paso]}>
                        <QInput
                            label="Cantidad"
                            nombre="cantidad"
                            tipo="numero"
                            valor={valores.cantidad !== undefined ? String(valores.cantidad) : ""}
                            onChange={(valor) => {
                                const num = parseFloat(valor);
                                setValores((v) => ({ ...v, cantidad: isNaN(num) ? undefined : num }));
                            }}
                        />
                    </PasoWrapper>
                )}

                {paso === "ubi-destino" && (
                    <PasoWrapper instruccion={instrucciones[paso]}>
                        <Ubicacion
                            label="Ubicación destino"
                            nombre="idUbicacionDestino"
                            valor={valores.idUbicacionDestino ?? ""}
                            onChange={(opcion) =>
                                setValores((v) => ({
                                    ...v,
                                    idUbicacionDestino: opcion?.valor ?? "",
                                    ubicacionDestino: opcion?.descripcion ?? "",
                                }))
                            }
                        />
                    </PasoWrapper>
                )}

                {paso === "ubi-origen" && (
                    <PasoWrapper instruccion={instrucciones[paso]}>
                        <Ubicacion
                            label="Ubicación origen"
                            nombre="idUbicacionOrigen"
                            valor={valores.idUbicacionOrigen ?? ""}
                            onChange={(opcion) =>
                                setValores((v) => ({
                                    ...v,
                                    idUbicacionOrigen: opcion?.valor ?? "",
                                    ubicacionOrigen: opcion?.descripcion ?? "",
                                }))
                            }
                        />
                    </PasoWrapper>
                )}

                {paso === "caja-destino" && (
                    <PasoWrapper instruccion={instrucciones[paso]}>
                        <Caja
                            label="Caja destino"
                            nombre="idCajaDestino"
                            valor={valores.idCajaDestino ?? ""}
                            onChange={(opcion) =>
                                setValores((v) => ({
                                    ...v,
                                    idCajaDestino: opcion?.valor ?? "",
                                    cajaDestino: opcion?.descripcion ?? "",
                                }))
                            }
                        />
                    </PasoWrapper>
                )}

                {paso === "caja-destino-capacidad" && (
                    <PasoWrapper instruccion={instrucciones[paso]}>
                        <Caja
                            label="Caja destino"
                            nombre="idCajaDestino"
                            valor={valores.idCajaDestino ?? ""}
                            onChange={(opcion) => {
                                setErrorCaja(null);
                                if (opcion) {
                                    const error = validarCajaContraLinea(opcion, linea);
                                    if (error) { setErrorCaja(error); return; }
                                }
                                setValores((v) => ({
                                    ...v,
                                    idCajaDestino: opcion?.valor ?? "",
                                    cajaDestino: opcion?.descripcion ?? "",
                                    sku: opcion?.sku ?? v.sku,
                                    loteId: opcion?.idLote !== undefined ? opcion.idLote : v.loteId,
                                    cantidad: opcion?.capacidad ?? undefined,
                                }));
                            }}
                        />
                        {errorCaja && <p className="q-texto-error">{errorCaja}</p>}
                    </PasoWrapper>
                )}

                {paso === "caja-origen" && (
                    <PasoWrapper instruccion={instrucciones[paso]}>
                        <Caja
                            label="Caja origen"
                            nombre="idCajaOrigen"
                            valor={valores.idCajaOrigen ?? ""}
                            onChange={(opcion) =>
                                setValores((v) => ({
                                    ...v,
                                    idCajaOrigen: opcion?.valor ?? "",
                                    cajaOrigen: opcion?.descripcion ?? "",
                                }))
                            }
                        />
                    </PasoWrapper>
                )}

                {paso === "caja-origen-completa" && (
                    <PasoWrapper instruccion={instrucciones[paso]}>
                        <Caja
                            label="Caja origen"
                            nombre="idCajaOrigen"
                            valor={valores.idCajaOrigen ?? ""}
                            onChange={(opcion) =>
                                setValores((v) => ({
                                    ...v,
                                    idCajaOrigen: opcion?.valor ?? "",
                                    cajaOrigen: opcion?.descripcion ?? "",
                                    cantidad: opcion?.cantidad ?? undefined,
                                }))
                            }
                        />
                    </PasoWrapper>
                )}

                {paso === "caja-destino-completa" && (
                    <PasoWrapper instruccion={instrucciones[paso]}>
                        <Caja
                            label="Caja destino"
                            nombre="idCajaDestino"
                            valor={valores.idCajaDestino ?? ""}
                            onChange={(opcion) => {
                                setErrorCaja(null);
                                if (opcion) {
                                    const error = validarCajaContraLinea(opcion, linea);
                                    if (error) { setErrorCaja(error); return; }
                                }
                                setValores((v) => ({
                                    ...v,
                                    idCajaDestino: opcion?.valor ?? "",
                                    cajaDestino: opcion?.descripcion ?? "",
                                    sku: opcion?.sku ?? v.sku,
                                    loteId: opcion?.idLote !== undefined ? opcion.idLote : v.loteId,
                                }));
                            }}
                        />
                        {errorCaja && <p className="q-texto-error">{errorCaja}</p>}
                    </PasoWrapper>
                )}

                <div className="botones maestro-botones">
                    <QBoton onClick={avanzar} deshabilitado={esUltimoPaso && cantidadBloqueada}>
                        {esUltimoPaso ? "Registrar" : "Siguiente"}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
