import { Articulo } from "#/almacen/comun/componentes/Articulo.tsx";
import { UbicacionPicking } from "#/almacen/comun/componentes/UbicacionPicking.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { metaNuevoPickingFijo, nuevoPickingFijoVacio } from "../dominio.ts";
import { postPickingFijo } from "../infraestructura.ts";
import "./CrearPickingFijo.css";
import { useTAlmacen } from "../../i18n/index.ts";

export const CrearPickingFijo = ({ publicar }: { publicar: EmitirEvento }) => {
    const t = useTAlmacen();
    const { modelo, uiProps, valido } = useModelo(metaNuevoPickingFijo, nuevoPickingFijoVacio);

    const crear_ = useCallback(async () => {
        const id = await postPickingFijo(modelo);
        publicar("picking_fijo_creado", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_de_picking_fijo_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="crearPickingFijo"
            titulo={t("picking_fijo.crearPickingFijo")}
            onCerrar={cancelar}
        >
            <div className="CrearPickingFijo">
                <quimera-formulario>
                    <Articulo {...uiProps("articuloId")} />
                    <UbicacionPicking {...uiProps("ubicacionId")} />
                    <QInput label={t("picking_fijo.minimo")} {...uiProps("minimo")} />
                    <QInput label={t("picking_fijo.maximo")} {...uiProps("maximo")} />
                    <QInput label={t("picking_fijo.unidadDeReposicion")} {...uiProps("unidadReposicion")} />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("picking_fijo.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
