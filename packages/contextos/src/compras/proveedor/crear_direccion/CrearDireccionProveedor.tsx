import { CamposDireccionProveedor } from "#/compras/comun/componentes/CamposDireccionProveedor.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { useTCompras } from "#/compras/i18n/index.ts";
import { Proveedor } from "../diseño.ts";
import { metaNuevaDireccionProveedor, nuevaDireccionProveedorVacia } from "../dominio.ts";
import { postDireccionProveedor } from "../infraestructura.ts";

export const CrearDireccionProveedor = ({
    proveedor,
    publicar,
}: {
    proveedor: Proveedor;
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    const inicial = useMemo(nuevaDireccionProveedorVacia, []);

    const { modelo, uiProps, valido } = useModelo(metaNuevaDireccionProveedor, inicial);

    const crear_ = useCallback(async () => {
        const id = await postDireccionProveedor(proveedor.id, modelo);
        publicar("direccion_creada", id);
    }, [modelo, proveedor.id, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_direccion_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="crearDireccionProveedor"
            titulo={t("proveedor.direcciones.crear")}
            onCerrar={cancelar}
        >
            <div className="CrearDireccionProveedor campos-direccion-proveedor">
                <quimera-formulario>
                    <CamposDireccionProveedor uiProps={uiProps} />
                </quimera-formulario>
            </div>
            <div className="botones maestro-botones">
                <QBoton onClick={crear} deshabilitado={!valido}>
                    {t("comun.botones.crear")}
                </QBoton>
            </div>
        </QModal>
    );
};
