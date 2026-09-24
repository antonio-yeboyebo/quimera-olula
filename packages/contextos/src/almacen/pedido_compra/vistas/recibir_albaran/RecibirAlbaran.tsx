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
import { LineaNuevaEntradaDesdePedido, LineaPedidoCompra } from "../../diseño.ts";
import { postEntradaDesdePedido } from "../../infraestructura.ts";
import {
    formEntradaVacia,
    metaFormEntrada,
} from "../crear_entrada_desde_pedido/crear_entrada_desde_pedido.ts";
import {
    LineaCajaEntrada,
    LineaEditableEntrada,
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
// Paso 2 — fila de cajas
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

    // ── Estado paso 2 ────────────────────────────────────────────────────────

    const [lineasCajas, setLineasCajas] = useState<LineaCajaEntrada[]>([]);

    const actualizarCaja = useCallback(
        (actualizada: LineaCajaEntrada) =>
            setLineasCajas((prev) =>
                prev.map((c) => c.rowId === actualizada.rowId ? actualizada : c)
            ),
        []
    );

    const todasCajasValidas = lineasCajas.every(
        (c) => c.tipo_caja_id === "" || (c.cantidad_caja != null && c.cantidad_caja > 0 && c.num_cajas != null && c.num_cajas > 0)
    );

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
                                    <th>Nº cajas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lineasPedido.flatMap((linea) => {
                                    const grupo = editablesPorLineaId.get(linea.id) ?? [];
                                    return grupo.map((editada, idx) => {
                                        const caja = cajasPorRowId.get(editada.rowId);
                                        if (!caja) return null;
                                        return (
                                            <FilaCaja
                                                key={editada.rowId}
                                                linea={linea}
                                                esPrimera={idx === 0}
                                                lineaEditada={editada}
                                                caja={caja}
                                                idProveedor={proveedorId}
                                                onCambio={actualizarCaja}
                                            />
                                        );
                                    });
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
                        <QBoton onClick={irAPaso2} deshabilitado={!todasCantidadesValidas}>
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
