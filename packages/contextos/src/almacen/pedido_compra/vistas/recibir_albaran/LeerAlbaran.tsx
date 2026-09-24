import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback, useRef, useState } from "react";
import { getInfoLineasPedidoCompra } from "../../infraestructura.ts";

export const LeerAlbaran = ({
    publicar,
    pedidoCompraId,
}: {
    publicar: EmitirEvento;
    pedidoCompraId: string;
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [fichero, setFichero] = useState<File | null>(null);

    const onFicheroSeleccionado = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFichero(e.target.files?.[0] ?? null);
        },
        []
    );

    const analizar_ = useCallback(
        async () => {
            const lineas = await getInfoLineasPedidoCompra(pedidoCompraId, fichero!);
            publicar("foto_analizada", lineas);
        },
        [fichero, pedidoCompraId, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("leer_albaran_cancelado"),
        [publicar]
    );

    const [analizar, cancelar, analizando] = useForm(analizar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="leerAlbaran"
            titulo="Leer albarán"
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <div style={{ marginBottom: "1rem" }}>
                    <label>Fichero del albarán</label>
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={onFicheroSeleccionado}
                    />
                </div>
            </quimera-formulario>

            <div className="botones maestro-botones">
                <QBoton onClick={analizar} deshabilitado={!fichero || analizando}>
                    {analizando ? "Analizando..." : "Analizar"}
                </QBoton>
            </div>
        </QModal>
    );
};
