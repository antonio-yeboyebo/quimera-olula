import { CamposDireccionProveedor } from "#/compras/comun/componentes/CamposDireccionProveedor.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { useTCompras } from "#/compras/i18n/index.ts";
import { DireccionProveedor, Proveedor } from "../diseño.ts";
import { metaDireccionProveedor } from "../dominio.ts";
import { patchDireccionProveedor } from "../infraestructura.ts";

export const CambiarDireccionProveedor = ({
    proveedor,
    direccion,
    publicar,
}: {
    proveedor: Proveedor;
    direccion: DireccionProveedor;
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    const { modelo, uiProps, valido } = useModelo(metaDireccionProveedor, direccion);

    const cambiar_ = useCallback(async () => {
        await patchDireccionProveedor(proveedor.id, direccion.id, modelo);
        publicar("direccion_cambiada", direccion.id);
    }, [modelo, proveedor.id, direccion.id, publicar]);

    const cancelar_ = useCallback(
        () => publicar("cambio_de_direccion_cancelado"),
        [publicar]
    );

    const [cambiar, cancelar] = useForm(cambiar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="cambiarDireccionProveedor"
            titulo={t("proveedor.direcciones.cambiar")}
            onCerrar={cancelar}
        >
            <div className="CambiarDireccionProveedor campos-direccion-proveedor">
                <quimera-formulario>
                    <CamposDireccionProveedor uiProps={uiProps} />
                </quimera-formulario>
            </div>
            <div className="botones maestro-botones">
                <QBoton onClick={cambiar} deshabilitado={!valido}>
                    {t("comun.botones.cambiar")}
                </QBoton>
            </div>
        </QModal>
    );
};
