import { QCargando } from "@olula/componentes/atomos/qcargando.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useContext, useEffect } from "react";
import { postSincronizarMovimientoBancario } from "../infraestructura.js";
import { useTTesoreria } from "../../i18n/index.ts";

/**
 * Lanza `/movimiento_bancario/sincronizar` de la cuenta bancaria al montarse. El padre
 * solo lo monta mientras estado === "SINCRONIZANDO" (ver MaestroConDetalleConciliacion.tsx).
 * Mientras dura la petición muestra el spinner de espera, como
 * ConciliarAutomaticamenteMovimientos.tsx.
 *
 * Si la petición falla del todo, `intentar` (ContextoError) ya muestra el
 * error global; aquí solo hace falta volver la máquina a INICIAL.
 */
export const SincronizarMovimientoBancario = ({
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
                const resumen = await postSincronizarMovimientoBancario(cuentaBancoId);
                if (vigente) await publicar("sincronizacion_completada", resumen);
            },
            () => publicar("sincronizacion_cancelada")
        );
        return () => {
            vigente = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <QCargando visible={true} mensaje={t("conciliacion.sincronizandoMovimientos")} />;
};
