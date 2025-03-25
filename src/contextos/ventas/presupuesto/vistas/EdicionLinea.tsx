import { useState } from "react";
import { Input } from "../../../../componentes/detalle/FormularioGenerico.tsx";
import { emitir } from "../../../../componentes/eventos/pubsub.ts";
import { LineaPresupuesto as Linea } from "../diseño.ts";
import { eventoReferenciaLineaCambiada } from "../dominio.ts";
import { camposLinea, patchArticuloLinea } from "../infraestructura.ts";

export const EdicionLinea = (
    {
        presupuestoId,
        linea,
        // onLineaActualizada,
        onCancelada,
    }: {
        presupuestoId: string;
        linea: Linea;
        // onLineaActualizada: (linea: Linea) => void;
        onCancelada: () => void;
    }
) => {

    const [_, setGuardando] = useState(false);

    const onReferenciaCambiada = async (_: string, valor: string) => {
        setGuardando(true);
        await patchArticuloLinea(presupuestoId, linea.id, valor);
        setGuardando(false);
        // if (onLineaActualizada) onLineaActualizada(linea);
        emitir(eventoReferenciaLineaCambiada(linea, valor));
    };
 
    return (
        <>
            <h2>Edición de línea</h2>
            <Input
                campo={camposLinea.referencia}
                onCampoCambiado={onReferenciaCambiada}
                valorEntidad={linea.referencia}
            />
            <button onClick={onCancelada}>
                Listo
            </button>
        </>
    );
}