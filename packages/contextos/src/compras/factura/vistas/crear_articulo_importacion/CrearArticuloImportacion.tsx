import { GrupoIvaProducto } from "#/ventas/comun/componentes/grupo_iva_producto.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { crearArticuloConProveedor } from "../../infraestructura.ts";
import {
    LineaFacturaLeida,
    ModoDatosContables,
    OpcionDatoContable,
} from "../validar_importacion/diseño.ts";
import {
    articuloConProveedorDesdeFormulario,
    nuevoArticuloDesdeLinea,
} from "../validar_importacion/dominio.ts";
import { metaNuevoArticuloImportacion } from "./dominio.ts";

export const CrearArticuloImportacion = ({
    linea,
    proveedorId,
    modoDatosContables,
    opcionesDatosContables,
    publicar,
}: {
    linea: LineaFacturaLeida;
    proveedorId: string;
    modoDatosContables: ModoDatosContables;
    opcionesDatosContables: OpcionDatoContable[];
    publicar: EmitirEvento;
}) => {
    const inicial = useMemo(() => nuevoArticuloDesdeLinea(linea), [linea]);
    const { modelo, uiProps, valido } = useModelo(metaNuevoArticuloImportacion, inicial);

    const crear_ = useCallback(async () => {
        const articulo = articuloConProveedorDesdeFormulario(modelo, linea, proveedorId);
        const id = await crearArticuloConProveedor(articulo);
        publicar("articulo_creado", { articuloId: id, descripcion: articulo.descripcion });
    }, [modelo, linea, proveedorId, publicar]);

    const cancelar_ = useCallback(() => publicar("creacion_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="crearArticuloImportacion"
            titulo="Crear artículo"
            onCerrar={cancelar}
        >
            <div className="CrearArticuloImportacion">
                <quimera-formulario>
                    <QInput label="Referencia" {...uiProps("referencia")} />
                    <QInput label="Descripción" {...uiProps("descripcion")} />
                    <GrupoIvaProducto {...uiProps("grupoIvaProductoId")} />
                    {modoDatosContables === "grupo_contable" ? (
                        <QSelect
                            label="Grupo contable de producto"
                            {...uiProps("datoContable")}
                            opciones={opcionesDatosContables.map((o) => ({
                                valor: o.id,
                                descripcion: o.descripcion,
                            }))}
                        />
                    ) : (
                        <QInput label="Subcuenta de gasto" {...uiProps("datoContable")} />
                    )}
                    <QCheckbox
                        label="Coste proveedor = precio de la factura"
                        {...uiProps("costeIgualPrecio")}
                    />
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
