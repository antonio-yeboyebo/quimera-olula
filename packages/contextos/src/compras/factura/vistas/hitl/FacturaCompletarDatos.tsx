import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { ResolvedorHitlTareaProps } from "#/comun/ia/hitl_cola/diseño.ts";
import { importarDeHitl } from "#/compras/factura/infraestructura.ts";
import { Articulo } from "#/compras/comun/componentes/articulo.tsx";
import { Proveedor } from "#/compras/comun/componentes/proveedor.tsx";
import { useCallback, useMemo, useState } from "react";
import {
    FacturaHitl,
    LineaFacturaHitl,
    lineaNecesitaInput,
    metaFacturaHitl,
    necesitaInput,
} from "./diseño.ts";

/**
 * Modal de completar datos para facturas con datos incompletos (ui_hint='factura_completar_datos').
 *
 * Permite al usuario rellenar los campos que el LLM no pudo resolver:
 *   - proveedor_id usando el selector de Proveedor
 *   - articulo_id / descripcion / cantidad de cada línea
 *   - fecha si falta
 *
 * Se muestra un input cuando el campo está en `campos_faltantes` O cuando su valor es null.
 * Al confirmar, llama al endpoint de importación HITL y marca la tarea resuelta.
 */
export const FacturaCompletarDatos = ({ tarea, publicar }: ResolvedorHitlTareaProps) => {
    const facturaInicial: FacturaHitl = useMemo(() => {
        const payload = tarea.datos_payload as Record<string, unknown>;
        const lineas = (payload.lineas as Record<string, unknown>[] ?? []).map(
            (l, i): LineaFacturaHitl => ({
                id: String(i),
                articuloId: (l.articulo_id as string) ?? null,
                articuloDescripcion: (l.descripcion as string) ?? null,
                descripcion: (l.descripcion as string) ?? null,
                cantidad: (l.cantidad as string) ?? null,
                precioUnitario: (l.precio_unitario as string) ?? null,
                descuento: (l.descuento as string) ?? null,
            }),
        );
        return {
            proveedorId: (payload.proveedor_id as string) ?? null,
            proveedorNombre: (payload.proveedor_nombre as string) ?? null,
            numeroProveedor: (payload.numero_proveedor as string) ?? null,
            fecha: (payload.fecha as string) ?? null,
            total: (payload.total as string) ?? null,
            lineas,
            camposFaltantes: (payload.campos_faltantes as string[]) ?? [],
            ficheroOrigen: (payload.fichero_origen as string) ?? null,
        };
    }, [tarea.datos_payload]);

    const { modelo: factura, uiProps, valido, set } = useModelo(metaFacturaHitl, facturaInicial);
    const [guardando, setGuardando] = useState(false);

    const actualizarLinea = useCallback(
        (idx: number, cambios: Partial<LineaFacturaHitl>) => {
            set({
                ...factura,
                lineas: factura.lineas.map((l, i) => (i === idx ? { ...l, ...cambios } : l)),
            });
        },
        [factura, set],
    );

    const importar = async () => {
        setGuardando(true);
        try {
            const payload: Record<string, unknown> = {
                ...tarea.datos_payload,
                proveedor_id: factura.proveedorId,
                proveedor_nombre: factura.proveedorNombre,
                numero_proveedor: factura.numeroProveedor,
                fecha: factura.fecha,
                total: factura.total,
                lineas: factura.lineas.map(
                    ({ id: _id, articuloDescripcion: _d, ...l }) => ({
                        articulo_id: l.articuloId,
                        descripcion: l.descripcion,
                        cantidad: l.cantidad,
                        precio_unitario: l.precioUnitario,
                        descuento: l.descuento,
                    }),
                ),
            };
            await importarDeHitl(tarea.id, payload);
            publicar("tarea_resuelta", tarea.id);
        } finally {
            setGuardando(false);
        }
    };

    const faltantes = factura.camposFaltantes;

    const metaTablaLineas: MetaTabla<LineaFacturaHitl> = [
        {
            id: "articuloId",
            cabecera: "Artículo",
            render: (l) => {
                const idx = factura.lineas.findIndex((x) => x.id === l.id);
                if (lineaNecesitaInput(faltantes, idx, "articulo_id", l.articuloId)) {
                    return (
                        <Articulo
                            valor={l.articuloId ?? ""}
                            descripcion={l.articuloDescripcion ?? ""}
                            onChange={(op) =>
                                actualizarLinea(idx, {
                                    articuloId: op?.valor ?? null,
                                    articuloDescripcion: op?.descripcion ?? l.articuloDescripcion,
                                })
                            }
                        />
                    );
                }
                return l.articuloId ?? "";
            },
        },
        {
            id: "descripcion",
            cabecera: "Descripción",
            render: (l) => {
                const idx = factura.lineas.findIndex((x) => x.id === l.id);
                if (lineaNecesitaInput(faltantes, idx, "descripcion", l.descripcion)) {
                    return (
                        <QInput
                            label=""
                            nombre={`descripcion_${idx}`}
                            valor={l.descripcion ?? ""}
                            tipo="texto"
                            onChange={(v) => actualizarLinea(idx, { descripcion: String(v) })}
                        />
                    );
                }
                return l.descripcion ?? "";
            },
        },
        {
            id: "cantidad",
            cabecera: "Cant.",
            render: (l) => {
                const idx = factura.lineas.findIndex((x) => x.id === l.id);
                if (lineaNecesitaInput(faltantes, idx, "cantidad", l.cantidad)) {
                    return (
                        <QInput
                            label=""
                            nombre={`cantidad_${idx}`}
                            valor={l.cantidad ?? ""}
                            tipo="decimal"
                            decimales={2}
                            onChange={(v) => actualizarLinea(idx, { cantidad: String(v) })}
                        />
                    );
                }
                return l.cantidad ?? "";
            },
        },
        {
            id: "precioUnitario",
            cabecera: "Precio",
            render: (l) => {
                const idx = factura.lineas.findIndex((x) => x.id === l.id);
                if (lineaNecesitaInput(faltantes, idx, "precio_unitario", l.precioUnitario)) {
                    return (
                        <QInput
                            label=""
                            nombre={`precio_${idx}`}
                            valor={l.precioUnitario ?? ""}
                            tipo="moneda"
                            decimales={2}
                            onChange={(v) => actualizarLinea(idx, { precioUnitario: String(v) })}
                        />
                    );
                }
                return l.precioUnitario ?? "";
            },
        },
        {
            id: "descuento",
            cabecera: "Dto. %",
            render: (l) => {
                const idx = factura.lineas.findIndex((x) => x.id === l.id);
                if (lineaNecesitaInput(faltantes, idx, "descuento", l.descuento)) {
                    return (
                        <QInput
                            label=""
                            nombre={`descuento_${idx}`}
                            valor={l.descuento ?? ""}
                            tipo="decimal"
                            decimales={2}
                            onChange={(v) => actualizarLinea(idx, { descuento: String(v) })}
                        />
                    );
                }
                return l.descuento ?? "";
            },
        },
    ];

    return (
        <QModal
            abierto={true}
            nombre="factura_completar_datos"
            titulo="Completar datos de factura"
            onCerrar={() => publicar("resolucion_cancelada")}
        >
            <div className="FacturaCompletarDatos">
                <quimera-formulario>
                    <Proveedor
                        {...uiProps("proveedorId", "proveedorNombre")}
                        nombre="proveedorId"
                        deshabilitado={!necesitaInput(faltantes, "proveedor_id", factura.proveedorId)}
                    />
                    <QInput
                        label="Nº factura proveedor"
                        {...uiProps("numeroProveedor")}
                        soloLectura={!!factura.numeroProveedor}
                    />
                    <QInput
                        label="Fecha"
                        {...uiProps("fecha")}
                        soloLectura={!necesitaInput(faltantes, "fecha", factura.fecha)}
                    />
                    <QInput
                        label="Total"
                        {...uiProps("total")}
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
                    <QBoton onClick={importar} deshabilitado={guardando || !valido}>
                        {guardando ? "Importando..." : "Importar factura"}
                    </QBoton>
                    <QBoton onClick={() => publicar("resolucion_cancelada")}>Cancelar</QBoton>
                </div>
            </div>
        </QModal>
    );
};
