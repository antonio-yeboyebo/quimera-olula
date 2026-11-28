import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { metaNuevaClaseAlmacenamiento, nuevaClaseAlmacenamientoVacia } from "../dominio.ts";
import { postClaseAlmacenamiento } from "../infraestructura.ts";
import "./CrearClaseAlmacenamiento.css";
import { useTAlmacen } from "../../i18n/index.ts";

export const CrearClaseAlmacenamiento = ({ publicar }: { publicar: EmitirEvento }) => {
    const t = useTAlmacen();
    const { modelo, uiProps, valido } = useModelo(metaNuevaClaseAlmacenamiento, nuevaClaseAlmacenamientoVacia);

    const crear_ = useCallback(async () => {
        const id = await postClaseAlmacenamiento(modelo);
        publicar("clase_almacenamiento_creada", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_clase_almacenamiento_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearClaseAlmacenamiento"
            titulo={t("clase_almacenamiento.crearClaseDeAlmacenamiento")}
            onCerrar={cancelar}
        >
            <div className="CrearClaseAlmacenamiento">
                <quimera-formulario>
                    <QInput label={t("clase_almacenamiento.codigo")} {...uiProps("codigo")} maxLength={10} ref={focus} />
                    <QInput label={t("clase_almacenamiento.descripcion")} {...uiProps("descripcion")} />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("clase_almacenamiento.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
