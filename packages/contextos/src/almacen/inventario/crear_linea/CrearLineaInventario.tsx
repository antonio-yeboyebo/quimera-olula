import { Articulo } from "#/almacen/comun/componentes/Articulo.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { Inventario } from "../diseño.ts";
import { postLineaInventario } from "../infraestructura.ts";
import { metaNuevaLineaInventario, nuevaLineaInventarioVacia } from "./crear_linea.ts";
import { useTAlmacen } from "../../i18n/index.ts";

export const CrearLineaInventario = ({
    inventario,
    publicar,
}: {
    inventario: Inventario;
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const inicial = useMemo(nuevaLineaInventarioVacia, []);

    const { modelo, uiProps, valido } = useModelo(metaNuevaLineaInventario, inicial);

    const crear_ = useCallback(async () => {
        const id = await postLineaInventario(inventario.id, modelo);
        publicar("linea_creada", id);
    }, [inventario.id, modelo, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_linea_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="crearLineaInventario"
            titulo={t("inventario.nuevaLineaDelInventarioId", { id: inventario.id })}
            onCerrar={cancelar}
        >
            <div className="CrearLineaInventario">
                <quimera-formulario>
                    <Articulo {...uiProps("articuloId")} />
                    <QInput label={t("inventario.cantidadContada")} {...uiProps("cantidad")} />
                    <QInput label={t("inventario.motivo")} {...uiProps("motivo")} />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("inventario.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
