import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { puede } from "@olula/lib/dominio.js";
import { ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Tarea } from "../../comun/diseño.ts";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { useAgenteSeguido } from "../../comun/useAgenteSeguido.ts";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { TarjetaTarea } from "../../comun/componentes/TarjetaTarea.tsx";
import { enlaceEmail, enlaceLlamar, enlaceWhatsapp, textoEstadoTrato } from "../../clientes/dominio.ts";
import { getNombreCliente } from "../../nueva_tarea/infraestructura.ts";
import { Contacto, EventoContacto, FormularioContacto, NotaContacto, TratoContacto } from "../diseño.ts";
import { accesoCompleto, edicionParaAPI, erroresEdicion, formularioEdicion, visiblesPara } from "../dominio.ts";
import {
    actualizarContacto,
    añadirNotaContacto,
    borrarContacto,
    getContacto,
    getEventosContacto,
    getNotasContacto,
    getTareasContacto,
    getTratosContacto,
} from "../infraestructura.ts";
import { CamposContacto } from "./CamposContacto.tsx";
import "./Contacto.css";

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const fecha = (iso: string | null) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES") : "—");

const AccionContacto = ({ href, icono, texto }: { href: string | null; icono: string; texto: string }) =>
    href ? (
        <a className="accion" href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
            <QIcono nombre={icono} />
            <span>{texto}</span>
        </a>
    ) : (
        <span className="accion deshabilitada">
            <QIcono nombre={icono} />
            <span>{texto}</span>
        </span>
    );

const Dato = ({ titulo, children }: { titulo: string; children: ReactNode }) => (
    <div className="dato">
        <span className="secundario">{titulo}</span>
        <span>{children}</span>
    </div>
);

const Errores = ({ errores }: { errores: string[] }) =>
    errores.length > 0 ? (
        <ul className="errores">
            {errores.map((error) => (
                <li key={error}>{error}</li>
            ))}
        </ul>
    ) : null;

export const FichaContacto = () => {
    const { codContacto = "" } = useParams();
    const navigate = useNavigate();
    const { intentar } = useContext(ContextoError);
    const { usuario } = useAgenteSeguido();

    const [contacto, setContacto] = useState<Contacto | null>(null);
    const [nombreCliente, setNombreCliente] = useState<string | null>(null);
    const [eventos, setEventos] = useState<EventoContacto[]>([]);
    const [notas, setNotas] = useState<NotaContacto[]>([]);
    const [tratos, setTratos] = useState<TratoContacto[]>([]);
    const [tareas, setTareas] = useState<{ tarea: Tarea; codAgente: string | null }[]>([]);
    const [historicoTratos, setHistoricoTratos] = useState(false);
    const [historicoTareas, setHistoricoTareas] = useState(false);
    const [edicion, setEdicion] = useState<FormularioContacto | null>(null);
    const [errores, setErrores] = useState<string[]>([]);
    const [nuevaNota, setNuevaNota] = useState("");
    const [confirmarBorrado, setConfirmarBorrado] = useState(false);
    const [procesando, setProcesando] = useState(false);

    const recargar = useCallback(async () => {
        const [nuevoContacto, nuevosEventos, nuevasNotas] = await intentar(() =>
            Promise.all([getContacto(codContacto), getEventosContacto(codContacto), getNotasContacto(codContacto)])
        );
        const nombre = nuevoContacto.codCliente ? await intentar(() => getNombreCliente(nuevoContacto.codCliente!)) : null;
        setContacto(nuevoContacto);
        setNombreCliente(nombre);
        setEventos(nuevosEventos);
        setNotas(nuevasNotas);
    }, [intentar, codContacto]);

    useEffect(() => {
        recargar().catch(() => undefined);
    }, [recargar]);

    useEffect(() => {
        const cargar = async () => setTratos(await intentar(() => getTratosContacto(codContacto, historicoTratos)));
        cargar().catch(() => undefined);
    }, [intentar, codContacto, historicoTratos]);

    useEffect(() => {
        const cargar = async () => setTareas(await intentar(() => getTareasContacto(codContacto, historicoTareas)));
        cargar().catch(() => undefined);
    }, [intentar, codContacto, historicoTareas]);

    const ejecutar = async (accion: () => Promise<unknown>) => {
        setProcesando(true);
        try {
            await intentar(accion);
            await recargar();
        } finally {
            setProcesando(false);
        }
    };

    if (!contacto) {
        return (
            <LayoutSmartsales>
                <p>Cargando…</p>
            </LayoutSmartsales>
        );
    }

    const acceso = accesoCompleto(contacto, usuario);

    const guardarEdicion = () => {
        if (!edicion) return;
        const encontrados = erroresEdicion(edicion);
        setErrores(encontrados);
        if (encontrados.length > 0) return;
        const cambios = edicionParaAPI(contacto, edicion);
        if (Object.keys(cambios).length === 0) return setEdicion(null);
        ejecutar(() => actualizarContacto(contacto.codigo, cambios))
            .then(() => setEdicion(null))
            .catch(() => undefined);
    };

    const cambiarRevisado = (revisado: boolean) =>
        ejecutar(() => actualizarContacto(contacto.codigo, { datosrevisados: revisado })).catch(() => undefined);

    const guardarNota = () =>
        ejecutar(async () => {
            await añadirNotaContacto(contacto.codigo, nuevaNota.trim());
            setNuevaNota("");
        }).catch(() => undefined);

    const borrar = async () => {
        setProcesando(true);
        try {
            await intentar(() => borrarContacto(contacto.codigo));
            navigate(rutasSmartsales.clientes);
        } catch {
            setProcesando(false);
        }
    };

    const tratosVisibles = visiblesPara(tratos, usuario);
    const tareasVisibles = visiblesPara(tareas, usuario);

    return (
        <LayoutSmartsales>
            <div className="Contacto">
                <header>
                    <h1>{contacto.nombre}</h1>
                </header>

                <nav className="acciones-contacto" aria-label="Contactar">
                    <AccionContacto href={enlaceLlamar(contacto.telefono)} icono="telefono" texto="Llamar" />
                    <AccionContacto href={enlaceEmail(contacto.email)} icono="correo" texto="Email" />
                    <AccionContacto href={enlaceWhatsapp(contacto.telefono)} icono="whatsapp" texto="WhatsApp" />
                </nav>

                <section className="tarjeta">
                    {edicion ? (
                        <>
                            <QInput label="Nombre" nombre="nombre" valor={edicion.nombre} onChange={(nombre) => setEdicion({ ...edicion, nombre })} />
                            <CamposContacto
                                formulario={edicion}
                                cambiar={(cambios) => setEdicion({ ...edicion, ...cambios })}
                                conCiudad
                                clienteBloqueado={!acceso}
                            />
                            <Errores errores={errores} />
                            <div className="acciones">
                                <QBoton variante="borde" onClick={() => setEdicion(null)}>
                                    Cancelar
                                </QBoton>
                                <QBoton deshabilitado={procesando} onClick={guardarEdicion}>
                                    Guardar
                                </QBoton>
                            </div>
                        </>
                    ) : (
                        <>
                            <Dato titulo="E-mail">{contacto.email || "Sin datos"}</Dato>
                            <Dato titulo="Teléfono">{contacto.telefono || "Sin datos"}</Dato>
                            <Dato titulo="Dirección">
                                {[contacto.direccion, contacto.codPostal, contacto.ciudad].filter(Boolean).join(", ") || "Sin datos"}
                            </Dato>
                            <Dato titulo="Cliente">
                                {contacto.codCliente ? (
                                    <Link to={rutasSmartsales.fichaCliente(contacto.codCliente)}>{nombreCliente ?? contacto.codCliente}</Link>
                                ) : (
                                    "Sin cliente"
                                )}
                            </Dato>
                            <div className="acciones">
                                <QBoton
                                    variante="borde"
                                    tamaño="pequeño"
                                    onClick={() => {
                                        setErrores([]);
                                        setEdicion(formularioEdicion(contacto, nombreCliente));
                                    }}
                                >
                                    Editar datos
                                </QBoton>
                            </div>
                        </>
                    )}
                    {puede("crm.contacto.revisar_contacto") && (
                        <QCheckbox
                            label="Contacto revisado"
                            nombre="revisado"
                            valor={contacto.datosRevisados}
                            deshabilitado={procesando}
                            onChange={(valor) => cambiarRevisado(valor === "true")}
                        />
                    )}
                </section>

                <section className="tarjeta">
                    <h2>Eventos ({eventos.length})</h2>
                    {eventos.length === 0 && <p className="vacio">Sin eventos</p>}
                    <ul className="lista">
                        {eventos.map((evento) => (
                            <li key={evento.codigo}>
                                <strong>{evento.nombre}</strong>
                                <span className="secundario">{fecha(evento.fecha)}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {acceso && (
                    <>
                        <section className="tarjeta">
                            <header>
                                <h2>Tratos</h2>
                                <QCheckbox
                                    label="Ver histórico"
                                    nombre="historico_tratos"
                                    valor={historicoTratos}
                                    onChange={(valor) => setHistoricoTratos(valor === "true")}
                                />
                            </header>
                            {tratosVisibles.length === 0 && <p className="vacio">Sin tratos</p>}
                            <ul className="lista">
                                {tratosVisibles.map((trato) => (
                                    <li key={trato.id}>
                                        <Link to={rutasSmartsales.trato(trato.id)}>
                                            <strong>{trato.titulo}</strong>
                                            <span className="secundario">
                                                {textoEstadoTrato(trato.estado)} · {euros.format(trato.valor)} · {fecha(trato.fecha)}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="tarjeta tareas">
                            <header>
                                <h2>Tareas</h2>
                                <QCheckbox
                                    label="Ver histórico"
                                    nombre="historico_tareas"
                                    valor={historicoTareas}
                                    onChange={(valor) => setHistoricoTareas(valor === "true")}
                                />
                            </header>
                            {tareasVisibles.length === 0 && <p className="vacio">Sin tareas</p>}
                            {tareasVisibles.map(({ tarea }) => (
                                <TarjetaTarea key={tarea.id} tarea={tarea} />
                            ))}
                        </section>
                    </>
                )}

                <section className="tarjeta">
                    <h2>Notas</h2>
                    {acceso && (
                        <>
                            <QTextArea label="Nueva nota" nombre="nota" rows={3} valor={nuevaNota} onChange={(valor) => setNuevaNota(valor)} />
                            <div className="acciones">
                                <QBoton tamaño="pequeño" deshabilitado={procesando || !nuevaNota.trim()} onClick={guardarNota}>
                                    Añadir nota
                                </QBoton>
                            </div>
                        </>
                    )}
                    {notas.length === 0 && <p className="vacio">Sin notas</p>}
                    <ul className="lista-notas">
                        {notas.map((nota) => (
                            <li key={nota.id}>
                                <span className="secundario">{fecha(nota.fecha)}</span>
                                <p>{nota.texto}</p>
                            </li>
                        ))}
                    </ul>
                </section>

                {acceso && (
                    <div className="borrar">
                        <QBoton variante="borde" onClick={() => setConfirmarBorrado(true)}>
                            Borrar contacto
                        </QBoton>
                    </div>
                )}

                <QModal nombre="borrar_contacto" titulo="Borrar contacto" abierto={confirmarBorrado} onCerrar={() => setConfirmarBorrado(false)}>
                    <div className="dialogo">
                        <p>El contacto se eliminará definitivamente.</p>
                        <div className="acciones">
                            <QBoton variante="borde" onClick={() => setConfirmarBorrado(false)}>
                                Cancelar
                            </QBoton>
                            <QBoton deshabilitado={procesando} onClick={() => borrar()}>
                                Borrar
                            </QBoton>
                        </div>
                    </div>
                </QModal>
            </div>
        </LayoutSmartsales>
    );
};
