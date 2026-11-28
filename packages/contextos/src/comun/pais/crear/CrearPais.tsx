import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { CamposPais } from "../detalle/CamposPais.tsx";
import { metaNuevoPais, nuevoPaisVacio } from "../dominio.ts";
import { postPais } from "../infraestructura.ts";
import { useTComun } from "../../i18n/index.ts";

export const CrearPais = ({ publicar }: { publicar: EmitirEvento }) => {
    const t = useTComun();
    const inicial = useMemo(nuevoPaisVacio, []);

    const { modelo, uiProps, valido } = useModelo(metaNuevoPais, inicial);

    const crear_ = useCallback(async () => {
        const id = await postPais(modelo);
        publicar("pais_creado", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_de_pais_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal abierto={true} nombre="crearPais" titulo={t("paises.nuevoPais")} onCerrar={cancelar}>
            <div className="CrearPais">
                <quimera-formulario>
                    <QInput label={t("paises.codigo")} {...uiProps("id")} ref={focus} />
                    <CamposPais uiProps={uiProps} />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("paises.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
