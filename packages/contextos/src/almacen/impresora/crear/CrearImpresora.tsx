import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { metaNuevaImpresora, nuevaImpresoraVacia, opcionesModoSalida } from "../dominio.ts";
import { postImpresora } from "../infraestructura.ts";
import "./CrearImpresora.css";

export const CrearImpresora = ({ publicar }: { publicar: EmitirEvento }) => {
    const { modelo, uiProps, valido } = useModelo(metaNuevaImpresora, nuevaImpresoraVacia);

    const crear_ = useCallback(async () => {
        const id = await postImpresora(modelo);
        publicar("impresora_creada", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_de_impresora_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal abierto={true} nombre="crearImpresora" titulo="Nueva impresora de etiquetas" onCerrar={cancelar}>
            <div className="CrearImpresora">
                <quimera-formulario>
                    <QInput label="Código" {...uiProps("codigo")} maxLength={20} ref={focus} />
                    <QInput label="Descripción" {...uiProps("descripcion")} />
                    <QInput label="Dirección IP o nombre" {...uiProps("host")} />
                    <QInput label="Puerto" {...uiProps("puerto")} />
                    <QInput label="Ancho etiqueta (mm)" {...uiProps("anchoMm")} />
                    <QInput label="Alto etiqueta (mm)" {...uiProps("altoMm")} />
                    <QInput label="Puntos por mm" {...uiProps("puntosPorMm")} />
                    <QInput label="Desplazamiento X (puntos)" {...uiProps("desplazamientoX")} />
                    <QSelect label="Salida" {...uiProps("modoSalida")} opciones={opcionesModoSalida} />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        Crear
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
