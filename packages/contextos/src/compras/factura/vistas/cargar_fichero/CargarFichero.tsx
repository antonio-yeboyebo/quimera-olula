import { QCargando } from "@olula/componentes/atomos/qcargando.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { extraerFicheroFactura, importarFacturaLeida } from "../../infraestructura.ts";
import {
    ExtraccionFactura,
    FacturaLeida,
    FicheroOriginal,
} from "../validar_importacion/diseño.ts";
import { tipoFichero } from "../validar_importacion/dominio.ts";
import { ValidarImportacionFactura } from "../validar_importacion/ValidarImportacionFactura.tsx";

export const CargarFichero = ({ publicar }: { publicar: EmitirEvento }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { intentar } = useContext(ContextoError);
    const [cargando, setCargando] = useState(false);
    const [extraccion, setExtraccion] = useState<ExtraccionFactura | null>(null);
    const [ficheroOriginal, setFicheroOriginal] = useState<FicheroOriginal | null>(null);

    // El fichero elegido se ve tal cual en la validación; la URL se libera al salir.
    useEffect(() => {
        return () => {
            if (ficheroOriginal) URL.revokeObjectURL(ficheroOriginal.url);
        };
    }, [ficheroOriginal]);

    const onFicheroSeleccionado = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const fichero = e.target.files?.[0];
            if (!fichero) return;
            setFicheroOriginal({
                url: URL.createObjectURL(fichero),
                tipo: tipoFichero(fichero.type || fichero.name),
            });
            setCargando(true);
            try {
                const resultado = await intentar(
                    () => extraerFicheroFactura(fichero),
                    () => publicar("carga_fichero_cancelada")
                );
                setExtraccion(resultado);
            } finally {
                setCargando(false);
            }
        },
        [intentar, publicar]
    );

    const confirmar = useCallback(
        async (leida: FacturaLeida) => {
            const id = await importarFacturaLeida(leida);
            publicar("factura_importada", id);
        },
        [publicar]
    );

    useEffect(() => {
        const input = inputRef.current!;
        input.click();

        const onCancel = () => publicar("carga_fichero_cancelada");
        input.addEventListener("cancel", onCancel);
        return () => input.removeEventListener("cancel", onCancel);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: "none" }}
                onChange={onFicheroSeleccionado}
            />
            <QCargando visible={cargando} mensaje="Procesando fichero..." />
            {extraccion && (
                <ValidarImportacionFactura
                    facturaLeida={extraccion.facturaLeida}
                    propuestaInicial={extraccion.propuesta}
                    fichero={ficheroOriginal}
                    onConfirmar={confirmar}
                    onCancelar={() => publicar("carga_fichero_cancelada")}
                />
            )}
        </>
    );
};
