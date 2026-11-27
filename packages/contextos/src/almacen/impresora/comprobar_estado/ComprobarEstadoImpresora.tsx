import { QCargando } from "@olula/componentes/atomos/qcargando.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useContext, useEffect } from "react";
import { Impresora } from "../diseño.ts";
import { getEstadoImpresora } from "../infraestructura.ts";

/**
 * Pregunta el estado a la impresora al montarse y muestra el spinner mientras
 * contesta (hasta unos segundos si no responde). El detalle solo lo monta con
 * estado === "COMPROBANDO_ESTADO".
 *
 *   - Emite "estado_recibido" con el EstadoImpresora.
 *   - Si falla, `intentar` ya muestra el error; emite "comprobacion_cancelada".
 */
export const ComprobarEstadoImpresora = ({
    impresora,
    publicar,
}: {
    impresora: Impresora;
    publicar: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);

    useEffect(() => {
        let vigente = true;
        intentar(
            async () => {
                const estado = await getEstadoImpresora(impresora.id);
                if (vigente) await publicar("estado_recibido", estado);
            },
            () => publicar("comprobacion_cancelada")
        );
        return () => {
            vigente = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <QCargando visible={true} mensaje={`Comprobando ${impresora.codigo}...`} />;
};
