import { Articulo } from "#/almacen/comun/componentes/Articulo.js";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { nuevoTipoCajaInicial } from "../../dominio.js";
import { postTipoCaja } from "../../infraestructura.js";
import "./CrearTipoCaja.css";
import { metaNuevoTipoCaja } from "./crear.js";
import { useTAlmacen } from "../../../i18n/index.ts";

/**
 * Modal de alta de tipo de caja.
 *
 * El maestro lo renderiza condicionalmente cuando estado === "CREANDO".
 * Llama a postTipoCaja internamente y emite:
 *   "tipo_caja_creado"            con el ID devuelto por la API  (éxito)
 *   "alta_de_tipo_caja_cancelada" sin payload                    (cancelar)
 */
export const CrearTipoCaja = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const { modelo: tipoCaja, uiProps, valido } = useModelo(
        metaNuevoTipoCaja,
        nuevoTipoCajaInicial
    );

    const crear_ = useCallback(
        async () => {
            const id = await postTipoCaja(tipoCaja);
            publicar("tipo_caja_creado", id);
        },
        [tipoCaja, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("alta_de_tipo_caja_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearTipoCaja"
            titulo={t("tipo_caja.crearTipoDeCaja")}
            onCerrar={cancelar}
        >
            <div className="CrearTipoCaja">
                <quimera-formulario>
                    <QInput label={t("tipo_caja.descripcion")} {...uiProps("descripcion")} ref={focus} />
                    <QInput label={t("tipo_caja.prefijo")} {...uiProps("prefijo")} maxLength={2} />
                    <Articulo label="SKU" {...uiProps("sku")} />
                    <QInput label={t("tipo_caja.capacidad")} {...uiProps("capacidad")}
                        deshabilitado={!tipoCaja.sku}
                    />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("tipo_caja.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
