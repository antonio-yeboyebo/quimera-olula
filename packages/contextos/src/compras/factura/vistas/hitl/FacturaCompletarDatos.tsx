import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { Entidad } from "@olula/lib/diseño.ts";
import { ResolvedorHitlTareaProps } from "#/comun/ia/hitl_cola/diseño.ts";
import { resolverHitlTarea } from "#/comun/ia/hitl_cola/infraestructura.ts";
import { Articulo } from "#/compras/comun/componentes/articulo.tsx";
import { Proveedor } from "#/compras/comun/componentes/proveedor.tsx";
import { useCallback, useMemo, useState } from "react";

interface LineaEditable extends Entidad {
    id: string;
    articulo_id: string | null;
    descripcion: string | null;
    cantidad: string | null;
    precio_unitario: string | null;
    descuento: string | null;
}

interface FacturaEditable {
    proveedor_id: string | null;
    proveedor_nombre: string | null;
    numero_proveedor: string | null;
    fecha: string | null;
    total: string | null;
    lineas: LineaEditable[];
    campos_faltantes: string[];
    fichero_origen: string | null;
}

const campoFaltante = (campos: string[], campo: string) =>
    campos.includes(campo);

const lineaCampoFaltante = (campos: string[], idx: number, campo: string) =>
    campos.includes(`linea[${idx}].${campo}`);

/**
 * Modal de completar datos para facturas con datos incompletos (ui_hint='factura_completar_datos').
 *
 * Permite al usuario rellenar los campos que el LLM no pudo resolver:
 *   - proveedor_id usando el selector de Proveedor
 *   - articulo_id de cada línea usando el selector de Artículo
 *   - fecha, cantidad, descripción si faltan
 *
 * Al confirmar, resuelve la tarea HITL con los datos completados → auto-crea la Factura.
 */
export const FacturaCompletarDatos = ({ tarea, publicar }: ResolvedorHitlTareaProps) => {
    const inicial: FacturaEditable = useMemo(() => {
        const payload = tarea.datos_payload as Record<string, unknown>;
        const lineas = (payload.lineas as Record<string, unknown>[] ?? []).map((l, i) => ({
            id: String(i),
            articulo_id: (l.articulo_id as string) ?? null,
            descripcion: (l.descripcion as string) ?? null,
            cantidad: (l.cantidad as string) ?? null,
            precio_unitario: (l.precio_unitario as string) ?? null,
            descuento: (l.descuento as string) ?? null,
        }));
        return {
            proveedor_id: (payload.proveedor_id as string) ?? null,
            proveedor_nombre: (payload.proveedor_nombre as string) ?? null,
            numero_proveedor: (payload.numero_proveedor as string) ?? null,
            fecha: (payload.fecha as string) ?? null,
            total: (payload.total as string) ?? null,
            lineas,
            campos_faltantes: (payload.campos_faltantes as string[]) ?? [],
            fichero_origen: (payload.fichero_origen as string) ?? null,
        };
    }, [tarea.datos_payload]);

    const [factura, setFactura] = useState<FacturaEditable>(inicial);
    const [guardando, setGuardando] = useState(false);

    const actualizarLinea = useCallback((idx: number, cambios: Partial<LineaEditable>) => {
        setFactura(f => ({
            ...f,
            lineas: f.lineas.map((l, i) => i === idx ? { ...l, ...cambios } : l),
        }));
    }, []);

    const importar = async () => {
        setGuardando(true);
        try {
            const payload: Record<string, unknown> = {
                ...tarea.datos_payload,
                proveedor_id: factura.proveedor_id,
                proveedor_nombre: factura.proveedor_nombre,
                numero_proveedor: factura.numero_proveedor,
                fecha: factura.fecha,
                total: factura.total,
                lineas: factura.lineas.map(({ id: _id, ...l }) => l),
            };
            await resolverHitlTarea(tarea.id, payload);
            publicar('tarea_resuelta', tarea.id);
        } finally {
            setGuardando(false);
        }
    };

    const faltantes = factura.campos_faltantes;

    const metaTablaLineas: MetaTabla<LineaEditable> = [
        {
            id: 'articulo_id',
            cabecera: 'Artículo',
            render: (l) => {
                const idx = factura.lineas.findIndex(x => x.id === l.id);
                if (lineaCampoFaltante(faltantes, idx, 'articulo_id')) {
                    return (
                        <Articulo
                            valor={l.articulo_id ?? ''}
                            descripcion={l.descripcion ?? ''}
                            onChange={(op) => actualizarLinea(idx, {
                                articulo_id: op?.valor ?? null,
                                descripcion: op?.descripcion ?? l.descripcion,
                            })}
                        />
                    );
                }
                return l.articulo_id ?? '';
            },
        },
        {
            id: 'descripcion',
            cabecera: 'Descripción',
            render: (l) => {
                const idx = factura.lineas.findIndex(x => x.id === l.id);
                if (lineaCampoFaltante(faltantes, idx, 'descripcion')) {
                    return (
                        <QInput
                            label=""
                            nombre={`descripcion_${idx}`}
                            valor={l.descripcion ?? ''}
                            onChange={(v) => actualizarLinea(idx, { descripcion: v })}
                        />
                    );
                }
                return l.descripcion ?? '';
            },
        },
        {
            id: 'cantidad',
            cabecera: 'Cant.',
            render: (l) => {
                const idx = factura.lineas.findIndex(x => x.id === l.id);
                if (lineaCampoFaltante(faltantes, idx, 'cantidad')) {
                    return (
                        <QInput
                            label=""
                            nombre={`cantidad_${idx}`}
                            valor={l.cantidad ?? ''}
                            onChange={(v) => actualizarLinea(idx, { cantidad: v })}
                        />
                    );
                }
                return l.cantidad ?? '';
            },
        },
        { id: 'precio_unitario', cabecera: 'Precio' },
        { id: 'descuento', cabecera: 'Dto. %' },
    ];

    return (
        <QModal
            abierto={true}
            nombre="factura_completar_datos"
            titulo="Completar datos de factura"
            onCerrar={() => publicar('resolucion_cancelada')}
        >
            <div className="FacturaCompletarDatos">
                <quimera-formulario>
                    <Proveedor
                        valor={factura.proveedor_id ?? ''}
                        descripcion={factura.proveedor_nombre ?? ''}
                        deshabilitado={!campoFaltante(faltantes, 'proveedor_id') && !!factura.proveedor_id}
                        onChange={(op) => setFactura(f => ({
                            ...f,
                            proveedor_id: op?.valor ?? null,
                            proveedor_nombre: op?.descripcion ?? f.proveedor_nombre,
                        }))}
                    />
                    <QInput
                        label="Nº factura proveedor"
                        nombre="numero_proveedor"
                        valor={factura.numero_proveedor ?? ''}
                        soloLectura={!!factura.numero_proveedor}
                        onChange={(v) => setFactura(f => ({ ...f, numero_proveedor: v }))}
                    />
                    <QInput
                        label="Fecha"
                        nombre="fecha"
                        valor={factura.fecha ?? ''}
                        soloLectura={!campoFaltante(faltantes, 'fecha')}
                        onChange={(v) => setFactura(f => ({ ...f, fecha: v }))}
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
                    entidades={factura.lineas}
                    totalEntidades={factura.lineas.length}
                    cargando={false}
                    seleccionada={null}
                    onSeleccion={() => {}}
                    criteriaInicial={criteriaDefecto}
                    onCriteriaChanged={() => {}}
                    modo="tabla"
                />

                <div className="maestro-botones">
                    <QBoton onClick={importar} deshabilitado={guardando || !factura.proveedor_id}>
                        {guardando ? 'Importando...' : 'Importar factura'}
                    </QBoton>
                    <QBoton onClick={() => publicar('resolucion_cancelada')}>
                        Cancelar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
