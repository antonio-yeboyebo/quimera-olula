import { QCargando } from "@olula/componentes/atomos/qcargando.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useContext, useEffect } from "react";
import { postConciliarAutomaticamente } from "../infraestructura.js";
import { useTTesoreria } from "../../i18n/index.ts";

/**
 * Lanza `/movimiento_bancario/conciliar_automaticamente` sobre los movimientos de la
 * cuenta bancaria al montarse. El padre solo lo monta mientras estado === "CONCILIANDO_AUTOMATICAMENTE",
 * igual que SincronizarMovimientoBancario.tsx. Mientras dura la petición muestra
 * el spinner de espera, como compras/factura/vistas/cargar_fichero/CargarFichero.tsx.
 */
export const ConciliarAutomaticamenteMovimientos = ({
    cuentaBancoId,
    publicar,
}: {
    cuentaBancoId: string;
    publicar: EmitirEvento;
}) => {
    const t = useTTesoreria();
    const { intentar } = useContext(ContextoError);

    useEffect(() => {
        let vigente = true;
        intentar(
            async () => {
                const resumen = await postConciliarAutomaticamente(cuentaBancoId);
                if (vigente) await publicar("conciliacion_automatica_completada", resumen);
            },
            () => publicar("conciliacion_automatica_cancelada")
        );
        return () => {
            vigente = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <QCargando visible={true} mensaje={t("conciliacion.conciliandoMovimientos")} />;
};
