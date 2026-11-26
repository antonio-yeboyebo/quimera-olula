import { Articulo } from "#/ventas/comun/componentes/articulo.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { CamposCondicion } from "../comun/CamposCondicion.tsx";
import { metaNuevoPrecioArticulo, nuevoPrecioArticuloVacio } from "../dominio.ts";
import { postPrecioArticulo } from "../infraestructura.ts";
import { useTVentas } from "../../i18n/index.ts";

/**
 * Alta de una condición de precio para el cliente.
 *
 * El modelo inicial va memoizado: useModelo lo reinicia cuando cambia su
 * identidad, así que crearlo en línea entra en bucle al escribir.
 */
export const CrearPrecioArticulo = ({
    clienteId,
    publicar,
}: {
    clienteId: string;
    publicar: EmitirEvento;
}) => {
    const t = useTVentas();
    const inicial = useMemo(nuevoPrecioArticuloVacio, []);

    const { modelo, uiProps, valido } = useModelo(metaNuevoPrecioArticulo, inicial);

    const crear_ = useCallback(async () => {
        const id = await postPrecioArticulo(clienteId, modelo);
        publicar("precio_creado", id);
    }, [clienteId, modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="crear_precio_articulo"
            titulo={t("precioArticulo.nuevo")}
            onCerrar={cancelar}
        >
            <div className="CrearPrecioArticulo">
                <quimera-formulario>
                    <Articulo {...uiProps("articuloId", "descripcionArticulo")} autoFocus />
                    <CamposCondicion uiProps={uiProps} modelo={modelo} />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        Crear
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
