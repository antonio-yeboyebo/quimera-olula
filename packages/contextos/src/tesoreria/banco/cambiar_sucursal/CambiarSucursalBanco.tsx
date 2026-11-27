import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { CamposSucursal } from "../crear_sucursal/CamposSucursal.tsx";
import { Banco, NuevaSucursal, Sucursal } from "../diseño.ts";
import { cambiosSucursal, etiquetaSucursal, metaSucursal } from "../dominio.ts";
import { patchSucursal } from "../infraestructura.ts";
import { useTTesoreria } from "../../i18n/index.ts";

export const CambiarSucursalBanco = ({
    banco,
    sucursal,
    publicar,
}: {
    banco: Banco;
    sucursal: Sucursal;
    publicar: EmitirEvento;
}) => {
    const t = useTTesoreria();
    const inicial = useMemo((): NuevaSucursal => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...datos } = sucursal;
        return datos;
    }, [sucursal]);

    const { modelo, uiProps, valido } = useModelo(metaSucursal, inicial);

    const guardar_ = useCallback(async () => {
        const cambios = cambiosSucursal(sucursal, modelo);
        if (Object.keys(cambios).length > 0) {
            await patchSucursal(banco.id, sucursal.id, cambios);
        }
        publicar("sucursal_cambiada", sucursal.id);
    }, [banco.id, sucursal, modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("cambio_de_sucursal_cancelado"), [publicar]);

    const [guardar, cancelar] = useForm(guardar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="cambiarSucursalBanco"
            titulo={t("banco.sucursalSucursal", { sucursal: etiquetaSucursal(sucursal) })}
            onCerrar={cancelar}
        >
            <div className="CambiarSucursalBanco">
                <quimera-formulario>
                    <CamposSucursal uiProps={uiProps} />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={guardar} deshabilitado={!valido}>
                        {t("banco.guardar")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
