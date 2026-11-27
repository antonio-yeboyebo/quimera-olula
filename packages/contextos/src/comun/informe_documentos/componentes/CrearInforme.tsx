import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { FichaInforme, PestañaInforme } from "../diseño.ts";
import { fichaNueva, metaFichaInforme } from "../dominio.ts";
import { postFichaInforme } from "../infraestructura.ts";
import { CamposInforme } from "./CamposInforme.tsx";
import { useTComun } from "../../i18n/index.ts";

export const CrearInforme = ({
    pestaña,
    publicar,
}: {
    pestaña: PestañaInforme;
    publicar: EmitirEvento;
}) => {
    // Memoizados: useModelo reinicia el formulario si cambia su identidad.
    const t = useTComun();
    const inicial = useMemo(() => fichaNueva(pestaña), [pestaña]);
    const meta = useMemo(() => metaFichaInforme<FichaInforme>(pestaña), [pestaña]);

    const { modelo: ficha, uiProps, valido } = useModelo(meta, inicial);

    const crear_ = useCallback(async () => {
        const id = await postFichaInforme(pestaña, ficha);
        publicar("informe_creado", id);
    }, [pestaña, ficha, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_de_informe_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);
    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre={`crearInforme-${pestaña.clave}`}
            titulo={t("informeDocumentos.nuevoInformeDeTolowercase", { toLowerCase: pestaña.titulo.toLowerCase() })}
            onCerrar={cancelar}
        >
            <div className="CrearInformeDocumentos">
                <quimera-formulario>
                    <CamposInforme pestaña={pestaña} uiProps={uiProps} ficha={ficha} refDescripcion={focus} />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("informeDocumentos.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
