import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { formatosUbicacion, metaNuevoTipoUbicacion, nuevoTipoUbicacionVacio } from "../dominio.ts";
import { postTipoUbicacion } from "../infraestructura.ts";
import "./CrearTipoUbicacion.css";
import { useTAlmacen } from "../../i18n/index.ts";

export const CrearTipoUbicacion = ({ publicar }: { publicar: EmitirEvento }) => {
    const t = useTAlmacen();
    const { modelo, uiProps, valido } = useModelo(metaNuevoTipoUbicacion, nuevoTipoUbicacionVacio);

    const crear_ = useCallback(async () => {
        const id = await postTipoUbicacion(modelo);
        publicar("tipo_ubicacion_creado", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_tipo_ubicacion_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearTipoUbicacion"
            titulo={t("tipo_ubicacion.crearTipoDeUbicacion")}
            onCerrar={cancelar}
        >
            <div className="CrearTipoUbicacion">
                <quimera-formulario>
                    <QInput label={t("tipo_ubicacion.codigo")} {...uiProps("codigo")} maxLength={10} ref={focus} />
                    <QInput label={t("tipo_ubicacion.descripcion")} {...uiProps("descripcion")} />
                    <QSelect label={t("tipo_ubicacion.formato")} {...uiProps("formato")} opciones={formatosUbicacion} />
                    <QInput label={t("tipo_ubicacion.capacidadPales")} {...uiProps("capacidadPalets")} />
                    <QInput label={t("tipo_ubicacion.pesoMaxKg")} {...uiProps("pesoMax")} />
                    <QInput label={t("tipo_ubicacion.alturaMaxM")} {...uiProps("alturaMax")} />
                    <QCheckbox label={t("tipo_ubicacion.multiReferencia")} {...uiProps("multiReferencia")} />
                    <QCheckbox label={t("tipo_ubicacion.multiLote")} {...uiProps("multiLote")} />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("tipo_ubicacion.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
