import { TipoCaja } from "#/almacen/comun/componentes/TipoCaja.tsx";
import { Ubicacion } from "#/almacen/comun/componentes/Ubicacion.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { postCaja } from "../infraestructura.ts";
import { getNuevaCajaInicial, metaNuevaCaja } from "./crear_caja.ts";
import { useTAlmacen } from "../../i18n/index.ts";

export const CrearCaja = ({
    publicar,
    idUbicacion,
}: {
    idUbicacion?: string | null;
    publicar: EmitirEvento;
}) => {

    const t = useTAlmacen();
    const nuevaCajaInicial = useMemo(() => getNuevaCajaInicial(idUbicacion), [idUbicacion]);
    const { modelo: nuevaCaja, uiProps, valido } = useModelo(
        metaNuevaCaja,
        nuevaCajaInicial
    );

    const crear_ = useCallback(
        async () => {
            const id = await postCaja(nuevaCaja);
            publicar("caja_creada", id);
        },
        [nuevaCaja, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("alta_de_caja_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crear_caja"
            titulo={t("caja.nuevaCaja")}
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <Ubicacion label={t("caja.ubicacion")} {...uiProps("idUbicacion")} ref={focus} />
                <TipoCaja {...uiProps("idTipoCaja")} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={crear} deshabilitado={!valido}>
                    {t("caja.crear")}
                </QBoton>
            </div>
        </QModal>
    );
};
