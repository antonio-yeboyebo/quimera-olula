import { Ubicacion } from "#/almacen/comun/componentes/Ubicacion.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { Fragment, useCallback, useState } from "react";
import { LineaNuevaEntradaDesdePedido, LineaPedidoCompra } from "../../diseño.ts";
import { postEntradaDesdePedido } from "../../infraestructura.ts";
import {
    formEntradaVacia,
    metaFormEntrada,
} from "../crear_entrada_desde_pedido/crear_entrada_desde_pedido.ts";
import {
    LineaEditableEntrada,
    crearLineaEditableVacia,
    lineaEditableADetectada,
    lineaEditableDesdeDetectada,
    metaLineaEditableEntrada,
} from "./comparativa_albaran.ts";
import "./ComparativaAlbaran.css";

// ---------------------------------------------------------------------------
// Fila editable
// ---------------------------------------------------------------------------

const FilaLinea = ({
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
        diferencia < 0 ? "comparativa-faltan" : diferencia > 0 ? "comparativa-sobran" : "";

    return (
        <tr>
            <td>{esPrimera ? linea.sku : ""}</td>
            <td>{esPrimera ? linea.descripcion : ""}</td>
            <td className="comparativa-cantidad">{esPrimera ? pendiente : ""}</td>
            <td className="comparativa-cantidad comparativa-input">
                <QInput label="" {...uiProps("cantidad")} />
            </td>
            <td className="comparativa-cantidad comparativa-input">
                <QInput label="" {...uiProps("lote_id")} />
            </td>
            <td className={`comparativa-cantidad ${esPrimera ? claseDiferencia : ""}`}>
                {esPrimera ? (diferencia > 0 ? `+${diferencia}` : diferencia) : ""}
            </td>
            <td className="comparativa-acciones">
                {onAgregar && <QBoton onClick={onAgregar}>+</QBoton>}
                {onBorrar && <QBoton onClick={onBorrar}>-</QBoton>}
            </td>
        </tr>
    );
};

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export const ComparativaAlbaran = ({
    publicar,
    pedidoCompraId,
    lineasPedido,
    lineasDetectadas,
}: {
    publicar: EmitirEvento;
    pedidoCompraId: string;
    lineasPedido: LineaPedidoCompra[];
    lineasDetectadas: LineaNuevaEntradaDesdePedido[];
}) => {
    const { modelo, uiProps, valido } = useModelo(
        metaFormEntrada,
        formEntradaVacia
    );

    const [lineasEditables, setLineasEditables] = useState<LineaEditableEntrada[]>(
        () => lineasDetectadas.map(lineaEditableDesdeDetectada)
    );

    const actualizarLinea = useCallback(
        (actualizada: LineaEditableEntrada) => {
            setLineasEditables((prev) =>
                prev.map((l) => l.rowId === actualizada.rowId ? actualizada : l)
            );
        },
        []
    );

    const agregarLote = useCallback(
        (linea_pedido_id: string) => {
            setLineasEditables((prev) => [
                ...prev,
                crearLineaEditableVacia(linea_pedido_id),
            ]);
        },
        []
    );

    const borrarLote = useCallback(
        (rowId: string) => {
            setLineasEditables((prev) => prev.filter((l) => l.rowId !== rowId));
        },
        []
    );

    const todasCantidadesValidas = lineasEditables.every((l) => l.cantidad > 0);

    const crear_ = useCallback(
        async () => {
            const id = await postEntradaDesdePedido({
                pedidoCompraId,
                ubicacionId: modelo.ubicacionId,
                lineas: lineasEditables.map(lineaEditableADetectada),
            });
            publicar("entrada_creada", id);
        },
        [modelo.ubicacionId, pedidoCompraId, lineasEditables, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("leer_albaran_cancelado"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    // Agrupamos por linea_pedido_id preservando el orden del pedido
    const editablesPorLineaId = new Map<string, LineaEditableEntrada[]>();
    for (const l of lineasEditables) {
        const grupo = editablesPorLineaId.get(l.linea_pedido_id) ?? [];
        editablesPorLineaId.set(l.linea_pedido_id, [...grupo, l]);
    }

    return (
        <QModal
            abierto={true}
            nombre="comparativaAlbaran"
            titulo="Comparativa de albarán"
            onCerrar={cancelar}
        >
            <div className="comparativa-albaran">
                <table className="comparativa-tabla">
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
                                <Fragment key={editable.rowId}>
                                    <FilaLinea
                                        linea={linea}
                                        esPrimera={idx === 0}
                                        diferencia={diferencia}
                                        detectada={editable}
                                        onCambio={actualizarLinea}
                                        onAgregar={linea.porLotes ? () => agregarLote(linea.id) : undefined}
                                        onBorrar={linea.porLotes && idx > 0 ? () => borrarLote(editable.rowId) : undefined}
                                    />
                                </Fragment>
                            ));
                        })}
                    </tbody>
                </table>

                <quimera-formulario>
                    <Ubicacion label="Ubicación de entrada" {...uiProps("ubicacionId")} />
                </quimera-formulario>
            </div>

            <div className="botones maestro-botones">
                <QBoton onClick={crear} deshabilitado={!valido || !todasCantidadesValidas}>
                    Crear entrada
                </QBoton>
                <QBoton onClick={cancelar}>
                    Cancelar
                </QBoton>
            </div>
        </QModal>
    );
};
