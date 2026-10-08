import { TipoCajaProv } from "#/almacen/comun/componentes/TipoCajaProv.tsx";
import { Ubicacion } from "#/almacen/comun/componentes/Ubicacion.tsx";
import { PALET_ID } from "#/almacen/comun/dominio.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useState } from "react";
import { ValorControl } from "@olula/lib/useModelo.ts";
import { LineaNuevaEntradaDesdePedido, LineaPedidoCompra } from "../../diseño.ts";
import { postEntradaDesdePedido } from "../../infraestructura.ts";
import {
    formEntradaVacia,
    metaFormEntrada,
} from "../crear_entrada_desde_pedido/crear_entrada_desde_pedido.ts";
import {
    ConfigPaletSku,
    LineaCajaEntrada,
    LineaEditableEntrada,
    configPaletSkuVacia,
    crearLineaEditableVacia,
    expandirLineaEnCajas,
    inicializarLineaCaja,
    lineaEditableDesdeDetectada,
    metaLineaCajaEntrada,
    metaLineaEditableEntrada,
} from "./recibir_albaran.ts";
import "./RecibirAlbaran.css";

// ---------------------------------------------------------------------------
// Paso 1 — fila de detección (cantidad + lote)
// ---------------------------------------------------------------------------

const FilaDeteccion = ({
    linea,
    esPrimera,
    diferencia,
    detectada,
    onCambio,
    onAgregar,
    onBorrar,
}: {
    linea: LineaPedidoCompra;
    esPrimera: boolean;
    diferencia: number;
    detectada: LineaEditableEntrada;
    onCambio: (actualizada: LineaEditableEntrada) => void;
    onAgregar?: () => void;
    onBorrar?: () => void;
}) => {
    const { uiProps } = useModelo(
        metaLineaEditableEntrada,
        detectada,
        async (actualizada) => onCambio(actualizada)
    );

    const pendiente = linea.cantidad - linea.cantidadRecibida;
    const claseDiferencia =
        diferencia < 0 ? "recibir-faltan" : diferencia > 0 ? "recibir-sobran" : "";

    return (
        <tr>
            <td>{esPrimera ? linea.sku : ""}</td>
            <td>{esPrimera ? linea.descripcion : ""}</td>
            <td className="recibir-cantidad">{esPrimera ? pendiente : ""}</td>
            <td className="recibir-cantidad recibir-input">
                <QInput label="" {...uiProps("cantidad")} />
            </td>
            <td className="recibir-cantidad recibir-input">
                {linea.porLotes && <QInput label="" {...uiProps("lote_id")} />}
            </td>
            <td className={`recibir-cantidad ${esPrimera ? claseDiferencia : ""}`}>
                {esPrimera ? (diferencia > 0 ? `+${diferencia}` : diferencia) : ""}
            </td>
            <td className="recibir-acciones">
                {onAgregar && <QBoton onClick={onAgregar}>+</QBoton>}
                {onBorrar && <QBoton onClick={onBorrar}>-</QBoton>}
            </td>
        </tr>
    );
};

// ---------------------------------------------------------------------------
// Paso 2 — fila de cabecera de SKU (modo palet)
// ---------------------------------------------------------------------------

const FilaConfigPalet = ({
    linea,
    config,
    idProveedor,
    onCambio,
}: {
    linea: LineaPedidoCompra;
    config: ConfigPaletSku;
    idProveedor: string;
    onCambio: (actualizada: ConfigPaletSku) => void;
}) => {
    const togglePalet = useCallback(() => {
        onCambio({ ...config, es_palet: !config.es_palet });
    }, [config, onCambio]);

    const cambiarNumPalets = useCallback(
        (valor: string) => {
            const n = parseInt(valor, 10);
            onCambio({ ...config, num_palets: isNaN(n) || n < 1 ? 1 : n });
        },
        [config, onCambio]
    );

    const cambiarSubcaja = useCallback(
        (val: ValorControl) => {
            const id = typeof val === "string" ? val : null;
            onCambio({ ...config, subcaja_compra_id: id || null });
        },
        [config, onCambio]
    );

    return (
        <tr className="recibir-fila-sku">
            <td><strong>{linea.sku}</strong></td>
            <td><strong>{linea.descripcion}</strong></td>
            <td colSpan={2}>
                <QBoton
                    onClick={togglePalet}
                    variante={config.es_palet ? "solido" : "borde"}
                >
                    {config.es_palet ? "Paletizado ✓" : "Paletizado"}
                </QBoton>
            </td>
            {config.es_palet && (
                <>
                    <td className="recibir-input">
                        <QInput
                            label="Nº palets"
                            nombre="num_palets"
                            valor={String(config.num_palets)}
                            tipo="numero"
                            onChange={cambiarNumPalets}
                        />
                    </td>
                    <td className="recibir-input" colSpan={2}>
                        <TipoCajaProv
                            label="Caja interior"
                            nombre="subcaja_compra_id"
                            valor={config.subcaja_compra_id ?? ""}
                            idProveedor={idProveedor}
                            idArticulo={linea.articuloId}
                            onChange={cambiarSubcaja}
                            onSeleccionar={(id) => onCambio({ ...config, subcaja_compra_id: id || null })}
                        />
                    </td>
                </>
            )}
        </tr>
    );
};

// ---------------------------------------------------------------------------
// Paso 2 — fila de cajas (modo normal)
// ---------------------------------------------------------------------------

const FilaCaja = ({
    linea,
    esPrimera,
    lineaEditada,
    caja,
    idProveedor,
    onCambio,
}: {
    linea: LineaPedidoCompra;
    esPrimera: boolean;
    lineaEditada: LineaEditableEntrada;
    caja: LineaCajaEntrada;
    idProveedor: string;
    onCambio: (actualizada: LineaCajaEntrada) => void;
}) => {
    const { uiProps, set } = useModelo(
        metaLineaCajaEntrada,
        caja,
        async (actualizada) => onCambio(actualizada)
    );

    const handleSeleccionarTipoCaja = useCallback(
        (id: string, capacidad: number | null) => {
            if (!id) {
                set({ ...caja, tipo_caja_id: id, cantidad_caja: null, num_cajas: null });
                return;
            }
            if (id === PALET_ID) {
                set({ ...caja, tipo_caja_id: id, cantidad_caja: lineaEditada.cantidad, num_cajas: 1 });
                return;
            }
            const cantidad_caja =
                capacidad != null && capacidad > 0 ? capacidad : caja.cantidad_caja;
            const num_cajas =
                cantidad_caja != null && cantidad_caja > 0
                    ? Math.ceil(lineaEditada.cantidad / cantidad_caja)
                    : caja.num_cajas;
            set({ ...caja, tipo_caja_id: id, cantidad_caja, num_cajas });
        },
        [caja, lineaEditada.cantidad, set]
    );

    return (
        <tr>
            <td>{esPrimera ? linea.sku : ""}</td>
            <td>{esPrimera ? linea.descripcion : ""}</td>
            <td>{lineaEditada.lote_id || "—"}</td>
            <td className="recibir-cantidad">{lineaEditada.cantidad}</td>
            <td className="recibir-input">
                <TipoCajaProv
                    label=""
                    nombre="tipo_caja_id"
                    valor={caja.tipo_caja_id}
                    idProveedor={idProveedor}
                    idArticulo={linea.articuloId}
                    onChange={uiProps("tipo_caja_id").onChange}
                    onSeleccionar={handleSeleccionarTipoCaja}
                />
            </td>
            <td className="recibir-cantidad recibir-input">
                <QInput label="" {...uiProps("cantidad_caja")} />
            </td>
            <td className="recibir-cantidad recibir-input">
                <QInput label="" {...uiProps("num_cajas")} />
            </td>
        </tr>
    );
};

// ---------------------------------------------------------------------------
// Paso 2 — fila de lote (modo palet)
// ---------------------------------------------------------------------------

const FilaLotePalet = ({
    lineaEditada,
    caja,
    numPalets,
    onCambio,
}: {
    lineaEditada: LineaEditableEntrada;
    caja: LineaCajaEntrada;
    numPalets: number;
    onCambio: (actualizada: LineaCajaEntrada) => void;
}) => {
    const paletActual = caja.palet_num;

    return (
        <tr>
            <td></td>
            <td></td>
            <td>{lineaEditada.lote_id || "—"}</td>
            <td className="recibir-cantidad">{lineaEditada.cantidad}</td>
            <td colSpan={3} className="recibir-asignar-palet">
                {numPalets === 1 ? (
                    <span className="recibir-palet-auto">Palet 1 (auto)</span>
                ) : (
                    <div className="recibir-botones-palet">
                        {Array.from({ length: numPalets }, (_, i) => i + 1).map((n) => (
                            <QBoton
                                key={n}
                                onClick={() => onCambio({ ...caja, palet_num: n })}
                                variante={paletActual === n ? "solido" : "borde"}
                            >
                                {n}
                            </QBoton>
                        ))}
                    </div>
                )}
            </td>
        </tr>
    );
};

// ---------------------------------------------------------------------------
// Wizard principal
// ---------------------------------------------------------------------------

export const RecibirAlbaran = ({
    publicar,
    pedidoCompraId,
    proveedorId,
    lineasPedido,
    lineasDetectadas,
}: {
    publicar: EmitirEvento;
    pedidoCompraId: string;
    proveedorId: string;
    lineasPedido: LineaPedidoCompra[];
    lineasDetectadas: LineaNuevaEntradaDesdePedido[];
}) => {
    const { modelo, uiProps, valido } = useModelo(metaFormEntrada, formEntradaVacia);

    const [paso, setPaso] = useState<1 | 2>(1);

    // ── Estado paso 1 ────────────────────────────────────────────────────────

    const [lineasEditables, setLineasEditables] = useState<LineaEditableEntrada[]>(
        () => lineasDetectadas.map(lineaEditableDesdeDetectada)
    );

    const actualizarLinea = useCallback(
        (actualizada: LineaEditableEntrada) =>
            setLineasEditables((prev) =>
                prev.map((l) => l.rowId === actualizada.rowId ? actualizada : l)
            ),
        []
    );

    const agregarLote = useCallback(
        (linea_pedido_id: string) =>
            setLineasEditables((prev) => [...prev, crearLineaEditableVacia(linea_pedido_id)]),
        []
    );

    const borrarLote = useCallback(
        (rowId: string) =>
            setLineasEditables((prev) => prev.filter((l) => l.rowId !== rowId)),
        []
    );

    const todasCantidadesValidas = lineasEditables.every((l) => l.cantidad > 0);

    const porLotesPorLineaId = new Map(lineasPedido.map((l) => [l.id, l.porLotes]));
    const todosLotesValidos = lineasEditables.every(
        (l) => !porLotesPorLineaId.get(l.linea_pedido_id) || l.lote_id !== ""
    );

    // ── Estado paso 2 ────────────────────────────────────────────────────────

    const [lineasCajas, setLineasCajas] = useState<LineaCajaEntrada[]>([]);
    const [configPalets, setConfigPalets] = useState<Map<string, ConfigPaletSku>>(
        () => new Map(lineasPedido.map((l) => [l.id, configPaletSkuVacia(l.id)]))
    );

    const actualizarCaja = useCallback(
        (actualizada: LineaCajaEntrada) =>
            setLineasCajas((prev) =>
                prev.map((c) => c.rowId === actualizada.rowId ? actualizada : c)
            ),
        []
    );

    // Propagación de config palet a cajas cuando cambia es_palet, num_palets o subcaja_compra_id
    const aplicarConfigPaletAsCajas = useCallback(
        (config: ConfigPaletSku, rowIdsDelSku: string[]) => {
            setLineasCajas((prev) =>
                prev.map((c) => {
                    if (!rowIdsDelSku.includes(c.rowId)) return c;
                    if (!config.es_palet) {
                        return {
                            ...c,
                            tipo_caja_id: "",
                            cantidad_caja: null,
                            num_cajas: null,
                            palet_num: null,
                            subcaja_compra_id: null,
                        };
                    }
                    return {
                        ...c,
                        tipo_caja_id: PALET_ID,
                        cantidad_caja: null,
                        num_cajas: null,
                        // Si solo hay 1 palet, auto-asignar; si hay más, resetear para que el usuario elija
                        palet_num: config.num_palets === 1 ? 1 : null,
                        subcaja_compra_id: config.subcaja_compra_id,
                    };
                })
            );
        },
        []
    );

    const cambiarConfigPalet = useCallback(
        (actualizada: ConfigPaletSku, rowIdsDelSku: string[]) => {
            setConfigPalets((prev) => new Map(prev).set(actualizada.linea_pedido_id, actualizada));
            aplicarConfigPaletAsCajas(actualizada, rowIdsDelSku);
        },
        [aplicarConfigPaletAsCajas]
    );

    const todasCajasValidas = lineasCajas.every((c) => {
        if (c.palet_num !== null) {
            // Modo palet: necesita subcaja y palet_num asignado
            return c.subcaja_compra_id !== null && c.palet_num >= 1;
        }
        return c.tipo_caja_id === "" || (c.cantidad_caja != null && c.cantidad_caja > 0 && c.num_cajas != null && c.num_cajas > 0);
    });

    // ── Navegación wizard ────────────────────────────────────────────────────

    const irAPaso2 = useCallback(() => {
        setLineasCajas(lineasEditables.map(inicializarLineaCaja));
        setPaso(2);
    }, [lineasEditables]);

    // ── Submit ───────────────────────────────────────────────────────────────

    const crear_ = useCallback(async () => {
        const cajasPorRowId = new Map(lineasCajas.map((c) => [c.rowId, c]));
        const lineasExpandidas = lineasEditables.flatMap((linea) => {
            const caja = cajasPorRowId.get(linea.rowId)!;
            return expandirLineaEnCajas(linea, caja);
        });
        const id = await postEntradaDesdePedido({
            pedidoCompraId,
            ubicacionId: modelo.ubicacionId,
            lineas: lineasExpandidas,
        });
        publicar("entrada_creada", id);
    }, [modelo.ubicacionId, pedidoCompraId, lineasEditables, lineasCajas, publicar]);

    const cancelar_ = useCallback(
        () => publicar("leer_albaran_cancelado"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    // ── Grupos por línea de pedido (compartido entre pasos) ──────────────────

    const editablesPorLineaId = new Map<string, LineaEditableEntrada[]>();
    for (const l of lineasEditables) {
        const grupo = editablesPorLineaId.get(l.linea_pedido_id) ?? [];
        editablesPorLineaId.set(l.linea_pedido_id, [...grupo, l]);
    }

    const cajasPorRowId = new Map(lineasCajas.map((c) => [c.rowId, c]));

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <QModal
            abierto={true}
            nombre="recibirAlbaran"
            titulo={paso === 1 ? "Recibir albarán (1/2)" : "Cajas destino (2/2)"}
            onCerrar={cancelar}
        >
            <div className="recibir-albaran">

                {paso === 1 && (
                    <table className="recibir-tabla">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Descripción</th>
                                <th>Por recibir</th>
                                <th>Detectado</th>
                                <th>Lote</th>
                                <th>Diferencia</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineasPedido.flatMap((linea) => {
                                const grupo = editablesPorLineaId.get(linea.id) ?? [];
                                if (grupo.length === 0) return [];

                                const pendiente = linea.cantidad - linea.cantidadRecibida;
                                const totalDetectado = grupo.reduce((s, e) => s + e.cantidad, 0);
                                const diferencia = totalDetectado - pendiente;

                                return grupo.map((editable, idx) => (
                                    <FilaDeteccion
                                        key={editable.rowId}
                                        linea={linea}
                                        esPrimera={idx === 0}
                                        diferencia={diferencia}
                                        detectada={editable}
                                        onCambio={actualizarLinea}
                                        onAgregar={linea.porLotes ? () => agregarLote(linea.id) : undefined}
                                        onBorrar={linea.porLotes && idx > 0 ? () => borrarLote(editable.rowId) : undefined}
                                    />
                                ));
                            })}
                        </tbody>
                    </table>
                )}

                {paso === 2 && (
                    <>
                        <table className="recibir-tabla">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Descripción</th>
                                    <th>Lote</th>
                                    <th>Cantidad</th>
                                    <th>Tipo caja</th>
                                    <th>Cant./caja</th>
                                    <th>Nº cajas / Palet</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lineasPedido.flatMap((linea) => {
                                    const grupo = editablesPorLineaId.get(linea.id) ?? [];
                                    if (grupo.length === 0) return [];
                                    const config = configPalets.get(linea.id)!;
                                    const rowIdsDelSku = grupo.map((e) => e.rowId);

                                    const filaConfig = (
                                        <FilaConfigPalet
                                            key={`config-${linea.id}`}
                                            linea={linea}
                                            config={config}
                                            idProveedor={proveedorId}
                                            onCambio={(c) => cambiarConfigPalet(c, rowIdsDelSku)}
                                        />
                                    );

                                    const filasCaja = grupo.map((editada) => {
                                        const caja = cajasPorRowId.get(editada.rowId);
                                        if (!caja) return null;

                                        if (config.es_palet) {
                                            return (
                                                <FilaLotePalet
                                                    key={editada.rowId}
                                                    lineaEditada={editada}
                                                    caja={caja}
                                                    numPalets={config.num_palets}
                                                    onCambio={actualizarCaja}
                                                />
                                            );
                                        }

                                        return (
                                            <FilaCaja
                                                key={editada.rowId}
                                                linea={linea}
                                                esPrimera={false}
                                                lineaEditada={editada}
                                                caja={caja}
                                                idProveedor={proveedorId}
                                                onCambio={actualizarCaja}
                                            />
                                        );
                                    });

                                    return [filaConfig, ...filasCaja];
                                })}
                            </tbody>
                        </table>

                        <quimera-formulario>
                            <Ubicacion label="Ubicación de entrada" {...uiProps("ubicacionId")} />
                        </quimera-formulario>
                    </>
                )}
            </div>

            <div className="botones maestro-botones">
                {paso === 1 && (
                    <>
                        <QBoton onClick={cancelar} variante='borde'>
                            Cancelar
                        </QBoton>
                        <QBoton onClick={irAPaso2} deshabilitado={!todasCantidadesValidas || !todosLotesValidos}>
                            Siguiente
                        </QBoton>
                    </>
                )}
                {paso === 2 && (
                    <>
                        <QBoton onClick={() => setPaso(1)} variante='borde'>
                            Atrás
                        </QBoton>
                        <QBoton onClick={crear} deshabilitado={!valido || !todasCajasValidas}>
                            Crear entrada
                        </QBoton>
                    </>
                )}
            </div>
        </QModal>
    );
};
