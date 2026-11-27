import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { CamposZonaGeografica } from "../detalle/CamposZonaGeografica.tsx";
import { metaNuevoZonaGeografica, nuevoZonaGeograficaVacio } from "../dominio.ts";
import { postZonaGeografica } from "../infraestructura.ts";
import { useTComun } from "../../i18n/index.ts";

export const CrearZonaGeografica = ({ publicar }: { publicar: EmitirEvento }) => {
    const t = useTComun();
    const inicial = useMemo(nuevoZonaGeograficaVacio, []);

    const { modelo, uiProps, valido } = useModelo(metaNuevoZonaGeografica, inicial);

    const crear_ = useCallback(async () => {
        const id = await postZonaGeografica(modelo);
        publicar("zona_geografica_creado", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_de_zona_geografica_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal abierto={true} nombre="crearZonaGeografica" titulo={t("zonaGeografica.nuevaZonaGeografica")} onCerrar={cancelar}>
            <div className="CrearZonaGeografica">
                <quimera-formulario>
                    <QInput label={t("zonaGeografica.codigo")} {...uiProps("id")} ref={focus} />
                    <CamposZonaGeografica uiProps={uiProps} />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("zonaGeografica.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
