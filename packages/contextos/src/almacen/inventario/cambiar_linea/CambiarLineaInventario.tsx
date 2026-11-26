import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { Inventario, LineaInventario } from "../diseño.ts";
import { patchLineaInventario } from "../infraestructura.ts";
import { avisoLecturas, lineaACambios, metaCambiosLineaInventario } from "./cambiar_linea.ts";
import { useTAlmacen } from "../../i18n/index.ts";

/**
 * Cambia la cantidad contada, el motivo y la ubicación de una línea con un
 * solo `PATCH`: la línea conserva sus lecturas de fichero y el servidor
 * recalcula el stock.
 */
export const CambiarLineaInventario = ({
    inventario,
    linea,
    publicar,
}: {
    inventario: Inventario;
    linea: LineaInventario;
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const inicial = useMemo(() => lineaACambios(linea), [linea]);

    const { modelo, uiProps, valido } = useModelo(metaCambiosLineaInventario, inicial);

    const cambiar_ = useCallback(async () => {
        const id = await patchLineaInventario(inventario.id, linea, modelo);
        publicar("linea_cambiada", id);
    }, [inventario.id, linea, modelo, publicar]);

    const cancelar_ = useCallback(
        () => publicar("cambio_de_linea_cancelado"),
        [publicar]
    );

    const [cambiar, cancelar] = useForm(cambiar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="cambiarLineaInventario"
            titulo={t("inventario.cambiarLineaDeArticuloid", { articuloId: linea.articuloId })}
            onCerrar={cancelar}
        >
            <div className="CambiarLineaInventario">
                <quimera-formulario>
                    <QInput label={t("inventario.articulo")} nombre="articulo" valor={`${linea.articuloId} ${linea.descripcion ?? ""}`.trim()} soloLectura />
                    <QInput label={t("inventario.cantidadContada")} {...uiProps("cantidad")} />
                    <QInput label={t("inventario.motivo")} {...uiProps("motivo")} />
                    <QInput label={t("inventario.ubicacion")} {...uiProps("ubicacion")} />
                </quimera-formulario>
                {linea.lecturas > 0 && (
                    <p className="aviso-inventario">
                        {avisoLecturas(linea.lecturas)}
                    </p>
                )}
                <div className="botones maestro-botones">
                    <QBoton onClick={cambiar} deshabilitado={!valido}>
                        {t("inventario.cambiar")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
