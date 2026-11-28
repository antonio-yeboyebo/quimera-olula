import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { Pasillo } from "../diseño.ts";
import { accesosPasillo, carasPasillo, metaPasillo } from "../dominio.ts";
import { patchPasillo } from "../infraestructura.ts";
import "./CambiarPasillo.css";
import { useTAlmacen } from "../../i18n/index.ts";

export const CambiarPasillo = ({
    pasillo,
    publicar,
}: {
    pasillo: Pasillo;
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const { modelo, uiProps, valido } = useModelo(metaPasillo, pasillo);

    const cambiar_ = useCallback(async () => {
        await patchPasillo(pasillo.id, modelo);
        publicar("pasillo_cambiado", pasillo.id);
    }, [modelo, publicar, pasillo.id]);

    const cancelar_ = useCallback(() => publicar("cambio_de_pasillo_cancelado"), [publicar]);

    const [cambiar, cancelar] = useForm(cambiar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="cambiarPasillo"
            titulo={t("pasillo.cambiarPasilloCodigo", { codigo: pasillo.codigo })}
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <QInput label={t("pasillo.codigo")} {...uiProps("codigo")} maxLength={10} />
                <QInput label={t("pasillo.ordenDeRecorrido")} {...uiProps("orden")} />
                <QSelect label={t("pasillo.caras")} {...uiProps("caras")} opciones={carasPasillo} />
                <QInput label={t("pasillo.modulosPorCara")} {...uiProps("modulos")} />
                <QSelect label={t("pasillo.accesos")} {...uiProps("accesos")} opciones={accesosPasillo} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={cambiar} deshabilitado={!valido}>
                    {t("pasillo.guardar")}
                </QBoton>
            </div>
        </QModal>
    );
};
