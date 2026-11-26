import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { MetaModelo } from "@olula/lib/dominio.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { CambiosTipoCaja, TipoCaja } from "../../diseño.js";
import { patchTipoCaja } from "../../infraestructura.js";
import { useTAlmacen } from "../../../i18n/index.ts";

/**
 * Tipo local para el formulario de cambio de SKU/capacidad
 */
type FormSkuCapacidad = {
    sku: string | null;
    capacidad: number | null;
};

const metaSkuCapacidad: MetaModelo<FormSkuCapacidad> = {
    campos: {
        sku: { requerido: false },
        capacidad: { requerido: false, tipo: "decimal" },
    },
    onChange: (modelo, campo, valor) => {
        if (campo === "sku" && (valor === null || valor === "")) {
            return { ...modelo, sku: null, capacidad: null };
        }
        return modelo;
    },
};

/**
 * Modal para cambiar SKU y capacidad de un tipo de caja.
 *
 * Emite:
 *   "sku_tipo_caja_cambiado"    al guardar con éxito
 *   "cambio_de_sku_cancelado"   al cancelar
 */
export const CambiarSkuTipoCaja = ({
    tipoCaja,
    publicar,
}: {
    tipoCaja: TipoCaja;
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const skuInicial: FormSkuCapacidad = useMemo(
        () => ({
            sku: tipoCaja.sku,
            capacidad: tipoCaja.capacidad,
        }),
        [tipoCaja.sku, tipoCaja.capacidad]
    );

    const { modelo, uiProps, valido } = useModelo(metaSkuCapacidad, skuInicial);

    const guardar_ = useCallback(
        async () => {
            const cambios: CambiosTipoCaja = {
                sku: modelo.sku,
                capacidad: modelo.capacidad,
            };
            await patchTipoCaja(tipoCaja.id, cambios);
            publicar("sku_tipo_caja_cambiado");
        },
        [modelo, tipoCaja.id, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("cambio_de_sku_cancelado"),
        [publicar]
    );

    const [guardar, cancelar] = useForm(guardar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="cambiarSkuTipoCaja"
            titulo={t("tipo_caja.cambiarSku")}
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <QInput label="SKU" {...uiProps("sku")} />
                <QInput label={t("tipo_caja.capacidad")} {...uiProps("capacidad")} />
            </quimera-formulario>

            <div className="botones maestro-botones">
                <QBoton onClick={guardar} deshabilitado={!valido}>
                    {t("tipo_caja.guardar")}
                </QBoton>
            </div>
        </QModal>
    );
};
