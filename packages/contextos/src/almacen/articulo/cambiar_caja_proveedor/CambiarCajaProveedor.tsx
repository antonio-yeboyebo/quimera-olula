import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { CajaProveedorArticulo, NuevaCajaProveedor } from "../diseño.ts";
import { patchCajaProveedor } from "../infraestructura.ts";
import { useTAlmacen } from "../../i18n/index.ts";

const metaCaja: MetaModelo<NuevaCajaProveedor> = {
    campos: {
        descripcion: { requerido: true },
        cantidad: { requerido: true, tipo: "numero" },
    },
};

export const CambiarCajaProveedor = ({
    articuloId,
    proveedorId,
    caja,
    publicar,
}: {
    articuloId: string;
    proveedorId: string;
    caja: CajaProveedorArticulo;
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const inicial: NuevaCajaProveedor = useMemo(() => ({
        descripcion: caja.tipoCaja,
        cantidad: caja.cantidad,
    }), [caja]);

    const { modelo, uiProps, valido } = useModelo(metaCaja, inicial);

    const guardar_ = useCallback(async () => {
        await patchCajaProveedor(articuloId, proveedorId, caja.id, modelo);
        publicar("caja_proveedor_cambiada");
    }, [articuloId, proveedorId, caja.id, modelo, publicar]);

    const cancelar_ = useCallback(() => {
        publicar("cambio_de_caja_proveedor_cancelado");
    }, [publicar]);

    const [guardar, cancelar] = useForm(guardar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="cambiarCajaProveedor"
            titulo={t("articulo.editarCaja")}
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <QInput label={t("articulo.descripcion")} {...uiProps("descripcion")} />
                <QInput label={t("articulo.cantidad")} {...uiProps("cantidad")} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={guardar} deshabilitado={!valido}>
                    {t("articulo.guardar")}
                </QBoton>
            </div>
        </QModal>
    );
};
