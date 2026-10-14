import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ResolvedorHitlTareaProps } from "#/comun/ia/hitl_cola/diseño.ts";
import { importarDeHitl } from "#/compras/factura/infraestructura.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { Entidad } from "@olula/lib/diseño.ts";
import { useState } from "react";

interface LineaFactura extends Entidad {
    id: string;
    articulo_id: string | null;
    descripcion: string | null;
    cantidad: string | null;
    precio_unitario: string | null;
    descuento: string | null;
}

interface FacturaLeida {
    proveedor_id: string | null;
    proveedor_nombre: string | null;
    numero_proveedor: string | null;
    fecha: string | null;
    total: string | null;
    lineas: Omit<LineaFactura, 'id'>[];
    campos_faltantes: string[];
    fichero_origen: string | null;
}

const metaTablaLineas: MetaTabla<LineaFactura> = [
    { id: 'articulo_id', cabecera: 'Artículo' },
    { id: 'descripcion', cabecera: 'Descripción' },
    { id: 'cantidad', cabecera: 'Cant.' },
    { id: 'precio_unitario', cabecera: 'Precio' },
    { id: 'descuento', cabecera: 'Dto. %' },
];

/**
 * Modal de confirmación para facturas con datos completos (ui_hint='factura_revision').
 *
 * El usuario revisa los datos extraídos por el LLM y confirma la importación.
 * Llama directamente al caso de uso de creación de factura y marca la tarea como resuelta.
 */
export const FacturaRevision = ({ tarea, publicar }: ResolvedorHitlTareaProps) => {
    const factura = tarea.datos_payload as unknown as FacturaLeida;
    const lineas: LineaFactura[] = (factura.lineas ?? []).map((l, i) => ({ ...l, id: String(i) } as LineaFactura));

    const [confirmando, setConfirmando] = useState(false);

    const confirmar = async () => {
        setConfirmando(true);
        try {
            await importarDeHitl(tarea.id, tarea.datos_payload);
            publicar('tarea_resuelta', tarea.id);
        } finally {
            setConfirmando(false);
        }
    };

    return (
        <QModal
            abierto={true}
            nombre="factura_revision"
            titulo="Confirmar importación de factura"
            onCerrar={() => publicar('resolucion_cancelada')}
        >
            <div className="FacturaRevision">
                <quimera-formulario>
                    <QInput
                        label="Proveedor"
                        nombre="proveedor_nombre"
                        valor={factura.proveedor_nombre ?? ''}
                        soloLectura
                    />
                    <QInput
                        label="Nº factura proveedor"
                        nombre="numero_proveedor"
                        valor={factura.numero_proveedor ?? ''}
                        soloLectura
                    />
                    <QInput
                        label="Fecha"
                        nombre="fecha"
                        valor={factura.fecha ?? ''}
                        soloLectura
                    />
                    <QInput
                        label="Total"
                        nombre="total"
                        valor={factura.total ?? ''}
                        soloLectura
                    />
                </quimera-formulario>

                <h4>Líneas</h4>
                <ListadoSemiControlado
                    metaTabla={metaTablaLineas}
                    entidades={lineas}
                    totalEntidades={lineas.length}
                    cargando={false}
                    seleccionada={null}
                    onSeleccion={() => {}}
                    criteriaInicial={criteriaDefecto}
                    onCriteriaChanged={() => {}}
                    modo="tabla"
                />

                <div className="maestro-botones">
                    <QBoton onClick={confirmar} deshabilitado={confirmando}>
                        {confirmando ? 'Importando...' : 'Confirmar importación'}
                    </QBoton>
                    <QBoton onClick={() => publicar('resolucion_cancelada')}>
                        Cancelar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
