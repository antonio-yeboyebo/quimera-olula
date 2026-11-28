import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { NuevaCajaProveedor } from "../diseño.ts";
import { postCajaProveedor } from "../infraestructura.ts";
import { useTAlmacen } from "../../i18n/index.ts";

const metaNuevaCaja: MetaModelo<NuevaCajaProveedor> = {
    campos: {
        descripcion: { requerido: true },
        cantidad: { requerido: true, tipo: "numero" },
    },
};

const nuevaCajaVacia = (): NuevaCajaProveedor => ({
    descripcion: "",
    cantidad: 0,
});

export const CrearCajaProveedor = ({
    articuloId,
    proveedorId,
    publicar,
}: {
    articuloId: string;
    proveedorId: string;
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const cajaInicial = useMemo(() => nuevaCajaVacia(), []);
    const { modelo, uiProps, valido } = useModelo(metaNuevaCaja, cajaInicial);

    const crear_ = useCallback(async () => {
        await postCajaProveedor(articuloId, proveedorId, modelo);
        publicar("caja_proveedor_creada");
    }, [articuloId, proveedorId, modelo, publicar]);

    const cancelar_ = useCallback(() => {
        publicar("alta_de_caja_proveedor_cancelada");
    }, [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="crearCajaProveedor"
            titulo={t("articulo.nuevaCaja")}
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <QInput label={t("articulo.descripcion")} {...uiProps("descripcion")} />
                <QInput label={t("articulo.cantidad")} {...uiProps("cantidad")} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={crear} deshabilitado={!valido}>
                    {t("articulo.guardar")}
                </QBoton>
            </div>
        </QModal>
    );
};
