import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QMapa } from "@olula/componentes/mapa/qmapa.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { textoTipoTarea } from "../../comun/dominio.ts";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { NotaDictada } from "../../comun/componentes/NotaDictada.tsx";
import { CambioVisita, EstadoTrato, SiguientePaso } from "../diseño.ts";
import { contextoInicial, destinoAlTerminar, esVisita, MAX_NOTA } from "../dominio.ts";
import { getMaquina } from "../maquina.ts";
import "./Visita.css";

const siguientesPasos: { valor: SiguientePaso; descripcion: string }[] = [
    { valor: "ninguno", descripcion: "Ninguno" },
    { valor: "presupuesto", descripcion: "Enviar presupuesto" },
    { valor: "pedido", descripcion: "Crear pedido" },
];

export const Visita = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { ctx, emitir } = useMaquina(getMaquina, contextoInicial);
    const { estado, tarea, errores } = ctx;

    const cambiar = (cambio: CambioVisita) => emitir("cambiar", cambio);

    useEffect(() => {
        if (id) emitir("cargar", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        if (estado === "TERMINADA" && tarea && !tarea.completada) navigate(destinoAlTerminar(ctx));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [estado]);

    if (!tarea) {
        return (
            <LayoutSmartsales>
                <p>Cargando…</p>
            </LayoutSmartsales>
        );
    }

    const visita = esVisita(tarea);

    return (
        <LayoutSmartsales>
            <div className="Visita">
                <h1>
                    {estado === "FINALIZANDO"
                        ? `Finalizar ${visita ? "visita" : "tarea"}`
                        : `${visita ? "Visita" : "Tarea"}${estado === "EN_CURSO" ? " en curso" : ""}`}
                </h1>

                <header className="tarjeta cabecera-visita">
                    <span className="icono">
                        <QIcono nombre={visita ? "calendario_evento" : "tarea"} />
                    </span>
                    <div>
                        <strong>{tarea.nombreCliente ?? tarea.titulo}</strong>
                        <span className="subtitulo">
                            {textoTipoTarea[tarea.tipo]} · {tarea.fecha} {tarea.hora?.slice(0, 5)}
                        </span>
                        {tarea.enCurso && tarea.horaInicio && (
                            <span className="en-curso">En curso desde las {tarea.horaInicio.slice(0, 5)}</span>
                        )}
                    </div>
                </header>

                {estado === "EN_CURSO" && tarea.posicionInicio && (
                    <section className="tarjeta ubicacion-inicio">
                        <QMapa centro={tarea.posicionInicio} radioKm={0.5} puntos={[]} posicion={tarea.posicionInicio} />
                        <span className="secundario">
                            <QIcono nombre="casa" tamaño="sm" /> Ubicación registrada
                            {tarea.horaInicio && ` a las ${tarea.horaInicio.slice(0, 5)}`}
                        </span>
                    </section>
                )}

                {estado === "TERMINADA" && <p>Esta tarea ya está completada.</p>}

                {estado === "PENDIENTE" && (
                    <section className="tarjeta acciones-principales">
                        <p className="titulo-tarea">{tarea.titulo}</p>
                        {tarea.nota && <p className="nota-previa">{tarea.nota}</p>}
                        {visita ? (
                            <QBoton ancho onClick={() => emitir("iniciar")}>
                                Iniciar visita
                            </QBoton>
                        ) : (
                            <QBoton ancho onClick={() => emitir("finalizar")}>
                                Completar tarea
                            </QBoton>
                        )}
                    </section>
                )}

                {(estado === "EN_CURSO" || estado === "FINALIZANDO") && (
                    <section className="tarjeta formulario">
                        {estado === "FINALIZANDO" && (
                            <QInput
                                label="Hora de fin"
                                nombre="hora_fin"
                                tipo="hora"
                                valor={ctx.horaFin}
                                onChange={(horaFin) => cambiar({ horaFin })}
                            />
                        )}
                        <QSelect
                            label="Interlocutor"
                            nombre="interlocutor"
                            opcional
                            valor={ctx.interlocutor ?? ""}
                            opciones={ctx.contactos.map((c) => ({ valor: c.codigo, descripcion: c.nombre }))}
                            onChange={(opcion) => cambiar({ interlocutor: opcion?.valor || null })}
                        />
                        <NotaDictada valor={ctx.nota} maximo={MAX_NOTA} onChange={(nota) => cambiar({ nota })} />

                        {estado === "FINALIZANDO" && tarea.idTrato && (
                            <>
                                <span className="titulo-campo" id="siguiente-paso">
                                    Siguiente paso
                                </span>
                                <div className="opciones" role="radiogroup" aria-labelledby="siguiente-paso">
                                    {siguientesPasos.map(({ valor, descripcion }) => (
                                        <button
                                            key={valor}
                                            type="button"
                                            role="radio"
                                            aria-checked={ctx.siguientePaso === valor}
                                            onClick={() => cambiar({ siguientePaso: valor })}
                                        >
                                            {descripcion}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                        {estado === "FINALIZANDO" && (
                            <QCheckbox
                                label="Generar siguiente tarea"
                                nombre="generar_siguiente"
                                valor={ctx.generarSiguiente}
                                onChange={(valor) => cambiar({ generarSiguiente: valor === "true" })}
                            />
                        )}

                        <div className="acciones">
                            {estado === "EN_CURSO" ? (
                                <QBoton ancho onClick={() => emitir("finalizar")}>
                                    Finalizar
                                </QBoton>
                            ) : (
                                <>
                                    <QBoton variante="borde" ancho onClick={() => emitir("volver")}>
                                        Volver
                                    </QBoton>
                                    <QBoton ancho onClick={() => emitir("guardar")}>
                                        Guardar y cerrar
                                    </QBoton>
                                </>
                            )}
                        </div>
                    </section>
                )}

                {estado === "CERRANDO_TRATO" && (
                    <section className="tarjeta formulario">
                        <p>Era la última tarea pendiente del trato. ¿Cómo ha terminado?</p>
                        <QSelect
                            label="Estado del trato"
                            nombre="estado_trato"
                            valor={ctx.estadoTrato ?? ""}
                            opciones={[
                                { valor: "Ganado", descripcion: "Ganado" },
                                { valor: "Perdido", descripcion: "Perdido" },
                            ]}
                            onChange={(opcion) => cambiar({ estadoTrato: (opcion?.valor || null) as EstadoTrato | null })}
                        />
                        {ctx.estadoTrato === "Perdido" && (
                            <QSelect
                                label="Causa de la pérdida"
                                nombre="causa"
                                valor={ctx.idCausa ?? ""}
                                opciones={ctx.causas.map((c) => ({ valor: c.id, descripcion: c.descripcion }))}
                                onChange={(opcion) => cambiar({ idCausa: opcion?.valor || null })}
                            />
                        )}
                        <div className="acciones">
                            <QBoton variante="borde" ancho onClick={() => emitir("mantener_abierto")}>
                                Dejar abierto
                            </QBoton>
                            <QBoton ancho onClick={() => emitir("cerrar_trato")}>
                                Cerrar trato
                            </QBoton>
                        </div>
                    </section>
                )}

                {errores.length > 0 && (
                    <ul className="errores">
                        {errores.map((error) => (
                            <li key={error}>{error}</li>
                        ))}
                    </ul>
                )}
            </div>
        </LayoutSmartsales>
    );
};
