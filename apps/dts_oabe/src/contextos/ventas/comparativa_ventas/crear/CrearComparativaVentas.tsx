import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { CamposCriterios } from "../detalle/CamposCriterios.tsx";
import { NuevaComparativaVentas } from "../diseño.ts";
import { metaComparativaVentas, nuevaComparativaVentasInicial } from "../dominio.ts";
import { postComparativaVentas } from "../infraestructura.ts";

const metaNueva = metaComparativaVentas<NuevaComparativaVentas>();

export const CrearComparativaVentas = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const inicial = useMemo(nuevaComparativaVentasInicial, []);

    const form = useModelo(metaNueva, inicial);
    const { modelo: comparativa, uiProps, valido } = form;

    const crear_ = useCallback(async () => {
        const id = await postComparativaVentas(comparativa);
        publicar("comparativa_creada", id);
    }, [comparativa, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_comparativa_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearComparativaVentas"
            titulo="Nueva comparativa de ventas"
            onCerrar={cancelar}
        >
            <div className="CrearComparativaVentas">
                <quimera-formulario>
                    <QInput label="Descripción" {...uiProps("descripcion")} ref={focus} />
                </quimera-formulario>
                <CamposCriterios form={form} comparativa={comparativa} />

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        Crear
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
