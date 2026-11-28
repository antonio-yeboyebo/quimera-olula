import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { ComponentType, useEffect, useState } from "react";
import { HitlTarea, ResolvedorHitlTareaProps } from "../diseño.js";
import { rechazarHitlTarea } from "../infraestructura.js";
import { getMaquina } from "./maquina.js";
import { tComun, useTComun } from "../../../i18n/index.ts";

const metaTablaHitlTarea: MetaTabla<HitlTarea> = [
    { id: 'titulo', get cabecera() { return tComun("ia.tarea"); } },
    { id: 'estado', get cabecera() { return tComun("ia.estado"); } },
    { id: 'tipo_accion', get cabecera() { return tComun("ia.tipo"); } },
    { id: 'creado_en', get cabecera() { return tComun("ia.recibida"); }, tipo: 'fechahora' },
];

/**
 * Bandeja de tareas HITL (Human-in-the-Loop).
 *
 * `resolvedores`: mapa de ui_hint → componente modal de resolución.
 * Ejemplo: { 'factura_revision': ResolverImportacionFactura, 'factura_completar_datos': ResolverImportacionFactura }
 *
 * Si no hay resolvedor para un ui_hint, se muestra una confirmación genérica.
 */
export const MaestroHitlCola = ({
    resolvedores = {},
}: {
    resolvedores?: Record<string, ComponentType<ResolvedorHitlTareaProps>>;
}) => {
    const tx = useTComun();
    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: 'INICIAL',
        tareas: listaActivaEntidadesInicial<HitlTarea>(undefined, criteriaDefecto),
        filtroEstado: 'pendiente',
    });

    const { estado, tareas, filtroEstado } = ctx;
    const tareaActiva = tareas.lista.find(t => t.id === tareas.activo) ?? null;

    useEffect(() => {
        emitir('recarga_solicitada');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const Resolvedor = tareaActiva ? resolvedores[tareaActiva.ui_hint] : undefined;

    return (
        <div className="HitlCola">
            <div className="HitlCola-header">
                <h2>{tx("ia.bandejaDeTareas")}</h2>
                <QSelect
                    label={tx("ia.estado")}
                    nombre="filtro_estado"
                    valor={filtroEstado}
                    opciones={[
                        { valor: 'pendiente', descripcion: tx("ia.pendientes") },
                        { valor: 'resuelta', descripcion: tx("ia.resueltas") },
                        { valor: 'rechazada', descripcion: tx("ia.rechazadas") },
                    ]}
                    onChange={(op) => op && emitir('filtro_estado_cambiado', op.valor)}
                />
            </div>

            <Listado<HitlTarea>
                metaTabla={metaTablaHitlTarea}
                criteria={criteriaDefecto}
                modo="tabla"
                entidades={tareas.lista}
                totalEntidades={tareas.total}
                seleccionada={tareas.activo}
                renderAcciones={() =>
                    tareaActiva && tareaActiva.estado === 'pendiente' ? (
                        <div className="maestro-botones">
                            <QBoton onClick={() => emitir('resolver_solicitado')}>
                                {tx("ia.resolver")}
                            </QBoton>
                            <QBoton
                                advertencia
                                onClick={() => emitir('rechazar_solicitado')}
                            >
                                {tx("ia.rechazar")}
                            </QBoton>
                        </div>
                    ) : null
                }
                onSeleccion={(id) => emitir('tarea_seleccionada', id)}
                onCriteriaChanged={() => { /* paginación no aplica en inbox */ }}
                onSiguientePagina={() => { /* paginación no aplica en inbox */ }}
            />

            {/* Modal de resolución: específico por ui_hint o genérico */}
            {estado === 'RESOLVIENDO' && tareaActiva && (
                Resolvedor
                    ? <Resolvedor tarea={tareaActiva} publicar={emitir} />
                    : <ResolvedorGenerico tarea={tareaActiva} publicar={emitir} />
            )}

            {/* Modal de rechazo */}
            {estado === 'RECHAZANDO' && tareaActiva && (
                <RechazarTarea tarea={tareaActiva} publicar={emitir} />
            )}
        </div>
    );
};

// ─── Resolvedor genérico ─────────────────────────────────────────────────────

const ResolvedorGenerico = ({ tarea, publicar }: ResolvedorHitlTareaProps) => {
    const confirmar = async () => {
        publicar('tarea_resuelta', tarea.datos_payload);
    };

    return (
        <QModal
            abierto={true}
            nombre="resolver_generico"
            titulo={tarea.titulo}
            onCerrar={() => publicar('resolucion_cancelada')}
        >
            <div className="HitlCola-resolvedor-generico">
                <pre style={{ maxHeight: '60vh', overflow: 'auto', fontSize: '0.85em' }}>
                    {JSON.stringify(tarea.datos_payload, null, 2)}
                </pre>
                <div className="maestro-botones">
                    <QBoton onClick={confirmar}>{tComun("ia.confirmar")}</QBoton>
                    <QBoton onClick={() => publicar('resolucion_cancelada')}>{tComun("ia.cancelar")}</QBoton>
                </div>
            </div>
        </QModal>
    );
};

// ─── Modal de rechazo ────────────────────────────────────────────────────────

const RechazarTarea = ({ tarea, publicar }: ResolvedorHitlTareaProps) => {
    const tx = useTComun();
    const [motivo, setMotivo] = useState("");

    // QModalConfirmacion muestra el error si falla (antes se perdía sin aviso).
    const rechazar = async () => {
        await rechazarHitlTarea(tarea.id, motivo.trim() || undefined);
        publicar('tarea_rechazada', tarea.id);
    };

    return (
        <QModalConfirmacion
            nombre="rechazar_tarea"
            abierto={true}
            titulo={tx("ia.rechazarTarea")}
            mensaje={tx("ia.laTareaSeDescartaraSinHacer")}
            labelAceptar={tx("ia.rechazar")}
            destructivo
            onCerrar={() => publicar('rechazo_cancelado')}
            onAceptar={rechazar}
        >
            <div className="HitlCola-rechazar">
                <p>
                    <strong>{tarea.titulo}</strong>
                </p>
                <QInput
                    label={tx("ia.motivo")}
                    nombre="motivo_rechazo"
                    valor={motivo}
                    onChange={setMotivo}
                    opcional
                />
            </div>
        </QModalConfirmacion>
    );
};
