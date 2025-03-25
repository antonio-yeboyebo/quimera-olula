import { useState } from "react";
import { Input, InputNumerico } from "../../../../componentes/detalle/FormularioGenerico.tsx";
import { emitir } from "../../../../componentes/eventos/pubsub.ts";
import { LineaPresupuestoNueva } from "../diseño.ts";
import { eventoLineaCreada } from "../dominio.ts";
import { camposLinea, postLinea } from "../infraestructura.ts";

export const AltaLinea = (
    {
        presupuestoId,
        // onLineaCreada,
        onCancelada,
    }: {
        presupuestoId: string;
        // onLineaCreada: (linea: LineaPresupuestoNueva, id: string) => void;
        onCancelada: () => void;
    }
) => {

    const [_, setGuardando] = useState(false);
    const [linea, setLinea] = useState<LineaPresupuestoNueva>({
        referencia: '',
        cantidad: 1,
    });

    const onCambio = async (campo: string, valor: string) => {
        const nuevaLinea = { ...linea, [campo]: valor };
        setLinea(nuevaLinea);
    };
    const onCambioCantidad = async (campo: string, valor: number) => {
        const nuevaLinea = { ...linea, [campo]: valor };
        setLinea(nuevaLinea);
    };
    const onGuardarClicked = async () => {
        setGuardando(true);
        const id = await postLinea(presupuestoId, linea);
        setGuardando(false);
        emitir(eventoLineaCreada(id));
        // onLineaCreada(linea, id);
    };
    return (
        <>
            <h2>Nueva línea</h2>
            <Input
                controlado
                campo={camposLinea.referencia}
                onCampoCambiado={onCambio}
                valorEntidad={linea.referencia}
            />
            <InputNumerico
                controlado
                campo={camposLinea.cantidad}
                onCampoCambiado={onCambioCantidad}
                valorEntidad={linea.cantidad}
            />
            <button onClick={onGuardarClicked}>
                Guardar
            </button>
            <button onClick={onCancelada}>
                Cancelar
            </button>
        </>
    );
}