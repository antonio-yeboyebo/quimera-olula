import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useState } from "react";
import { mensajeRevisados } from "../dominio.ts";
import { revisarLotes } from "../infraestructura.ts";
import { useTAlmacen } from "../../i18n/index.ts";

/**
 * «Revisar todos»: recalcula las cantidades de todos los lotes con sus movimientos, tras
 * confirmarlo. Al terminar, recarga el listado y dice cuántos ha revisado.
 */
export const RevisarTodosLotes = ({ recargar }: { recargar: () => Promise<void> }) => {
    const t = useTAlmacen();
    const { intentar } = useContext(ContextoError);
    const [confirmando, setConfirmando] = useState(false);
    const [revisando, setRevisando] = useState(false);
    const [mensaje, setMensaje] = useState("");

    const revisar = useCallback(async () => {
        setConfirmando(false);
        setRevisando(true);
        setMensaje("");
        try {
            const revisados = await intentar(() => revisarLotes());
            setMensaje(mensajeRevisados(revisados));
            await recargar();
        } catch {
            // `intentar` ya muestra el error.
        } finally {
            setRevisando(false);
        }
    }, [intentar, recargar]);

    return (
        <>
            <QBoton variante="borde" deshabilitado={revisando} onClick={() => setConfirmando(true)}>
                {revisando ? t("lote.revisando") : t("lote.revisarTodos")}
            </QBoton>
            {mensaje && <span className="nota-lote" role="status">{mensaje}</span>}
            {confirmando && (
                <QModalConfirmacion
                    nombre="revisarTodosLotes"
                    abierto={true}
                    titulo={t("lote.revisarTodosLosLotes")}
                    mensaje={t("lote.seRecalcularanConSusMovimientosLas")}
                    labelAceptar={t("lote.revisar")}
                    onCerrar={() => setConfirmando(false)}
                    onAceptar={revisar}
                />
            )}
        </>
    );
};
