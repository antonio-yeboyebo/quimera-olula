import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { ComponentType, useEffect } from "react";
import { HitlTarea, ResolvedorHitlTareaProps } from "../diseño.js";
import { rechazarHitlTarea } from "../infraestructura.js";
import { getMaquina } from "./maquina.js";

const metaTablaHitlTarea: MetaTabla<HitlTarea> = [
    { id: 'titulo', cabecera: 'Tarea' },
    { id: 'estado', cabecera: 'Estado' },
    { id: 'tipo_accion', cabecera: 'Tipo' },
    { id: 'creado_en', cabecera: 'Recibida', tipo: 'fechahora' },
];

/**
 * Bandeja de tareas HITL (Human-in-the-Loop).
 *
 * `resolvedores`: mapa de ui_hint → componente modal de resolución.
 * Ejemplo: { 'factura_revision': FacturaRevision, 'factura_completar_datos': FacturaCompletarDatos }
 *
 * Si no hay resolvedor para un ui_hint, se muestra una confirmación genérica.
 */
export const MaestroHitlCola = ({
    resolvedores = {},
}: {
    resolvedores?: Record<string, ComponentType<ResolvedorHitlTareaProps>>;
}) => {
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
                <h2>Bandeja de tareas</h2>
                <QSelect
                    label="Estado"
                    nombre="filtro_estado"
                    valor={filtroEstado}
                    opciones={[
                        { valor: 'pendiente', descripcion: 'Pendientes' },
                        { valor: 'resuelta', descripcion: 'Resueltas' },
                        { valor: 'rechazada', descripcion: 'Rechazadas' },
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
                                Resolver
                            </QBoton>
                            <QBoton
                                advertencia
                                onClick={() => emitir('rechazar_solicitado')}
                            >
                                Rechazar
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
                    <QBoton onClick={confirmar}>Confirmar</QBoton>
                    <QBoton onClick={() => publicar('resolucion_cancelada')}>Cancelar</QBoton>
                </div>
            </div>
        </QModal>
    );
};

// ─── Modal de rechazo ────────────────────────────────────────────────────────

const RechazarTarea = ({ tarea, publicar }: ResolvedorHitlTareaProps) => {
    const rechazar = async () => {
        await rechazarHitlTarea(tarea.id);
        publicar('tarea_rechazada', tarea.id);
    };

    return (
        <QModal
            abierto={true}
            nombre="rechazar_tarea"
            titulo="Rechazar tarea"
            onCerrar={() => publicar('rechazo_cancelado')}
        >
            <div className="HitlCola-rechazar">
                <p>¿Confirmar rechazo de la tarea <strong>{tarea.titulo}</strong>?</p>
                <div className="maestro-botones">
                    <QBoton advertencia onClick={rechazar}>Rechazar</QBoton>
                    <QBoton onClick={() => publicar('rechazo_cancelado')}>Cancelar</QBoton>
                </div>
            </div>
        </QModal>
    );
};
