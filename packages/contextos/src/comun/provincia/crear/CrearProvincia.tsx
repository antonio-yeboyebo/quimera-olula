import { QBoton } from "@olula/componentes/atomos/qboton.tsx";

import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";

import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { CamposProvincia } from "../detalle/CamposProvincia.tsx";
import { metaNuevoProvincia, nuevoProvinciaVacio } from "../dominio.ts";
import { postProvincia } from "../infraestructura.ts";
import { useTComun } from "../../i18n/index.ts";

export const CrearProvincia = ({ publicar }: { publicar: EmitirEvento }) => {
    const t = useTComun();
    const inicial = useMemo(nuevoProvinciaVacio, []);

    const { modelo, uiProps, valido } = useModelo(metaNuevoProvincia, inicial);

    const crear_ = useCallback(async () => {
        const id = await postProvincia(modelo);
        publicar("provincia_creado", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_de_provincia_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    return (
        <QModal abierto={true} nombre="crearProvincia" titulo={t("provincia.nuevaProvincia")} onCerrar={cancelar}>
            <div className="CrearProvincia">
                <quimera-formulario>
                    <CamposProvincia uiProps={uiProps} />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("provincia.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
