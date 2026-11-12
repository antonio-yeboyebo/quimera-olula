import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { puede } from "@olula/lib/dominio.js";
import { ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Tarea } from "../../comun/diseño.ts";
import { fechaIso } from "../../comun/dominio.ts";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { useAgenteSeguido } from "../../comun/useAgenteSeguido.ts";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { TarjetaTarea } from "../../comun/componentes/TarjetaTarea.tsx";
import { buscarProductos } from "../../nueva_tarea/infraestructura.ts";
import { getTareasTrato } from "../../tareas/infraestructura.ts";
import { TipoTrato } from "../../tratos/diseño.ts";
import { getTiposTrato } from "../../tratos/infraestructura.ts";
import { getContactosCliente } from "../../visita/infraestructura.ts";
import {
    DatosDocumento,
    Dialogo,
    EstadoTrato,
    FechasLicencia,
    FormularioEdicion,
    Nota,
    Opcion,
    TipoDocumentoTrato,
    TratoDetalle,
} from "../diseño.ts";
import {
    accionGanar,
    cambioEstado,
    documentoParaAPI,
    edicionParaAPI,
    erroresDocumento,
    erroresEdicion,
    erroresLicencia,
    esTratoFarma,
    EVENTO_VENTA_REGULAR,
    formularioEdicion,
    licenciaParaAPI,
    ORIGENES_MERCANCIA,
    puedeAsociarPedido,
    puedeBorrar,
    puedeCrearPresupuesto,
    puedePerder,
    textoBotonGanar,
    textoConfirmarBorrado,
} from "../dominio.ts";
import {
    actualizarTrato,
    añadirNota,
    aprobarPresupuesto,
    asociarPedido,
    borrarLicencia,
    borrarTrato,
    buscarEventos,
    buscarPedidosCliente,
    crearLicencia,
    crearPedidoTrato,
    crearPresupuestoTrato,
    esDireccionCanarias,
    getCausasPerdida,
    getDireccionesEnvio,
    getNotas,
    getTrato,
    tieneDireccionAutomatica,
} from "../infraestructura.ts";
import "./DetalleTrato.css";

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });

const fecha = (iso: string | null) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES") : "—");

const SIN_DIALOGO: Dialogo = { tipo: "ninguno" };

const datosVacios: DatosDocumento = { codDireccion: null, regimenIva: null, codEvento: null };

const Errores = ({ errores }: { errores: string[] }) =>
    errores.length > 0 ? (
        <ul className="errores">
            {errores.map((error) => (
                <li key={error}>{error}</li>
            ))}
        </ul>
    ) : null;

const Dato = ({ titulo, children }: { titulo: string; children: ReactNode }) => (
    <div className="dato">
        <span className="secundario">{titulo}</span>
        <span>{children}</span>
    </div>
);

export const DetalleTrato = () => {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const { intentar } = useContext(ContextoError);
    const { usuario, agentePropio } = useAgenteSeguido();
    const tipoTratoFarma = usuario?.tipoTratoFarma ?? null;

    const [trato, setTrato] = useState<TratoDetalle | null>(null);
    const [tareas, setTareas] = useState<Tarea[]>([]);
    const [notas, setNotas] = useState<Nota[]>([]);
    const [procesando, setProcesando] = useState(false);
    const [dialogo, setDialogo] = useState<Dialogo>(SIN_DIALOGO);
    const [errores, setErrores] = useState<string[]>([]);

    const [edicion, setEdicion] = useState<FormularioEdicion | null>(null);
    const [tipos, setTipos] = useState<TipoTrato[]>([]);
    const [contactos, setContactos] = useState<Opcion[]>([]);
    const [nuevaNota, setNuevaNota] = useState("");
    const [idCausa, setIdCausa] = useState<string | null>(null);
    const [fechasLicencia, setFechasLicencia] = useState<FechasLicencia>({ fin: "", caducidad: "" });
    const [datosDocumento, setDatosDocumento] = useState<DatosDocumento>(datosVacios);
    const [dirCanarias, setDirCanarias] = useState(false);
    const [idPedidoAsociar, setIdPedidoAsociar] = useState<string | null>(null);

    const recargar = useCallback(async () => {
        const [nuevoTrato, nuevasTareas, nuevasNotas] = await intentar(() =>
            Promise.all([getTrato(id), getTareasTrato(id), getNotas(id)])
        );
        setTrato(nuevoTrato);
        setTareas(nuevasTareas);
        setNotas(nuevasNotas);
    }, [intentar, id]);

    useEffect(() => {
        recargar().catch(() => undefined);
    }, [recargar]);

    const cerrarDialogo = () => {
        setDialogo(SIN_DIALOGO);
        setErrores([]);
    };

    const ejecutar = async (accion: () => Promise<unknown>) => {
        setProcesando(true);
        try {
            await intentar(accion);
            cerrarDialogo();
            await recargar();
        } finally {
            setProcesando(false);
        }
    };

    if (!trato) {
        return (
            <LayoutSmartsales>
                <p>Cargando…</p>
            </LayoutSmartsales>
        );
    }

    const farma = esTratoFarma(trato, tipoTratoFarma);
    const bloqueadoFarma = farma && !puede("crm.trato.farma");
    const esMio = !!agentePropio && trato.codAgente === agentePropio;

    const cambiarEstado = (estado: EstadoTrato, causa: string | null = null) => actualizarTrato(trato.id, cambioEstado(estado, causa));

    const quitarEstado = () =>
        ejecutar(async () => {
            if (farma && trato.idLicencia) await borrarLicencia(trato.idLicencia);
            await cambiarEstado("-");
        });

    const pulsarPerdido = async () => {
        if (trato.estado === "Perdido") return quitarEstado().catch(() => undefined);
        const causas = await intentar(() => getCausasPerdida(trato.idTipoTrato));
        setIdCausa(null);
        setDialogo({ tipo: "causa_perdida", causas });
    };

    const abrirDocumento = async (documento: TipoDocumentoTrato) => {
        if (!trato.codAgente) {
            setErrores([`No se puede crear el ${documento}: el trato no tiene un agente asignado`]);
            return;
        }
        if (!trato.codCliente) {
            navigate(rutasSmartsales.tratoLegacy(trato.id));
            return;
        }
        const codCliente = trato.codCliente;
        const automatica = await intentar(() => tieneDireccionAutomatica(codCliente));
        const direcciones = automatica ? [] : await intentar(() => getDireccionesEnvio(codCliente));
        setDatosDocumento(datosVacios);
        setDirCanarias(false);
        setErrores([]);
        setDialogo({ tipo: "documento", documento, conDireccion: !automatica, direcciones });
    };

    const pulsarGanado = async () => {
        if (trato.estado === "Ganado") return quitarEstado().catch(() => undefined);
        const accion = accionGanar(trato, tipoTratoFarma);
        if (accion === "ganar") return ejecutar(() => cambiarEstado("Ganado")).catch(() => undefined);
        if (accion === "aprobar_presupuesto") {
            return ejecutar(async () => {
                await aprobarPresupuesto(trato);
                await cambiarEstado("Ganado");
            }).catch(() => undefined);
        }
        if (accion === "licencia") {
            setFechasLicencia({ fin: fechaIso(new Date()), caducidad: "" });
            setDialogo({ tipo: "licencia" });
            return;
        }
        return abrirDocumento("pedido");
    };

    const confirmarCausa = () => {
        if (!idCausa) return setErrores(["Elige la causa"]);
        ejecutar(() => cambiarEstado("Perdido", idCausa)).catch(() => undefined);
    };

    const confirmarLicencia = () => {
        const encontrados = erroresLicencia(fechasLicencia);
        setErrores(encontrados);
        if (encontrados.length > 0) return;
        ejecutar(async () => {
            await crearLicencia(licenciaParaAPI(trato, fechasLicencia));
            await cambiarEstado("Ganado");
        }).catch(() => undefined);
    };

    const cambiarDireccion = async (codDireccion: string | null) => {
        const canarias = codDireccion ? await intentar(() => esDireccionCanarias(codDireccion)) : false;
        setDirCanarias(canarias);
        setDatosDocumento((actual) => ({ ...actual, codDireccion, regimenIva: canarias ? "Exportaciones" : null }));
    };

    const confirmarDocumento = async () => {
        if (dialogo.tipo !== "documento") return;
        const encontrados = erroresDocumento(datosDocumento, dialogo.conDireccion);
        setErrores(encontrados);
        if (encontrados.length > 0) return;
        const datos = documentoParaAPI(dialogo.documento, trato, datosDocumento, fechaIso(new Date()));
        setProcesando(true);
        try {
            if (dialogo.documento === "presupuesto") {
                const idPresupuesto = await intentar(() => crearPresupuestoTrato(datos));
                navigate(rutasSmartsales.presupuesto(String(idPresupuesto)));
            } else {
                const idPedido = await intentar(() => crearPedidoTrato(datos));
                await intentar(() => cambiarEstado("Ganado"));
                navigate(rutasSmartsales.pedido(String(idPedido)));
            }
        } finally {
            setProcesando(false);
        }
    };

    const confirmarAsociarPedido = () => {
        if (!idPedidoAsociar) return setErrores(["Elige el pedido"]);
        ejecutar(async () => {
            const pedido = await asociarPedido(idPedidoAsociar, trato.id);
            await actualizarTrato(trato.id, {
                ...cambioEstado("Ganado"),
                ...(trato.codCliente ? {} : { codcliente: pedido.codcliente }),
            });
        }).catch(() => undefined);
    };

    const confirmarBorrado = async () => {
        setProcesando(true);
        try {
            await intentar(() => borrarTrato(trato.id));
            navigate(rutasSmartsales.tratos);
        } finally {
            setProcesando(false);
        }
    };

    const empezarEdicion = async () => {
        const codCliente = trato.codCliente;
        const [nuevosTipos, nuevosContactos] = await intentar(() =>
            Promise.all([tipos.length ? Promise.resolve(tipos) : getTiposTrato(), codCliente ? getContactosCliente(codCliente) : Promise.resolve([])])
        );
        setTipos(nuevosTipos);
        setContactos(nuevosContactos.map((c) => ({ valor: c.codigo, descripcion: c.nombre })));
        setErrores([]);
        setEdicion(formularioEdicion(trato));
    };

    const guardarEdicion = () => {
        if (!edicion) return;
        const encontrados = erroresEdicion(edicion);
        setErrores(encontrados);
        if (encontrados.length > 0) return;
        ejecutar(async () => {
            await actualizarTrato(trato.id, edicionParaAPI(edicion));
            setEdicion(null);
        }).catch(() => undefined);
    };

    const guardarNota = () => {
        if (!nuevaNota.trim()) return;
        ejecutar(async () => {
            await añadirNota(trato.id, nuevaNota.trim());
            setNuevaNota("");
        }).catch(() => undefined);
    };

    const cambiarEdicion = (cambios: Partial<FormularioEdicion>) => setEdicion((actual) => (actual ? { ...actual, ...cambios } : actual));

    const rutaNuevaTarea = trato.codCliente
        ? rutasSmartsales.nuevaTareaPara(trato.codCliente, trato.id)
        : rutasSmartsales.nuevaTareaTratoLegacy(trato.id);

    return (
        <LayoutSmartsales>
            <div className="DetalleTrato">
                <header>
                    <div>
                        <h1>{trato.titulo}</h1>
                        <span className="secundario">
                            {fecha(trato.fecha)} {trato.hora ?? ""}
                        </span>
                    </div>
                    <span className="valor">{euros.format(trato.valor)}</span>
                </header>

                {!edicion ? (
                    <section className="tarjeta datos">
                        <Dato titulo="Cliente">
                            {trato.codCliente ? (
                                <Link to={rutasSmartsales.fichaCliente(trato.codCliente)}>{trato.nombreCliente}</Link>
                            ) : (
                                "—"
                            )}
                        </Dato>
                        {trato.codContacto && (
                            <Dato titulo="Contacto">
                                <Link to={rutasSmartsales.contacto(trato.codContacto)}>{trato.nombreContacto}</Link>
                            </Dato>
                        )}
                        <Dato titulo="Tipo">{trato.tipoTrato ?? "—"}</Dato>
                        <Dato titulo="Familias de producto">
                            {trato.familias.length === 0
                                ? "—"
                                : trato.familias.map((f) => (
                                      <QEtiqueta key={f.codfamilia} variante="neutro">
                                          {f.descripcion}
                                      </QEtiqueta>
                                  ))}
                        </Dato>
                        <QBoton variante="borde" tamaño="pequeño" onClick={() => empezarEdicion().catch(() => undefined)}>
                            Editar datos
                        </QBoton>
                    </section>
                ) : (
                    <section className="tarjeta formulario">
                        <QInput label="Título" nombre="titulo" valor={edicion.titulo} maxLength={100} onChange={(titulo) => cambiarEdicion({ titulo })} />
                        <QInput
                            label="Valor"
                            nombre="valor"
                            tipo="moneda"
                            valor={String(edicion.valor)}
                            onChange={(valor) => cambiarEdicion({ valor: Number(valor) || 0 })}
                        />
                        <QSelect
                            label="Tipo de trato"
                            nombre="tipo_trato"
                            valor={edicion.idTipoTrato ?? ""}
                            opciones={tipos.map((t) => ({ valor: t.id, descripcion: t.descripcion }))}
                            onChange={(opcion) => cambiarEdicion({ idTipoTrato: opcion?.valor || null })}
                        />
                        {trato.codCliente && (
                            <QSelect
                                label="Contacto"
                                nombre="contacto"
                                opcional
                                valor={edicion.codContacto ?? ""}
                                opciones={contactos}
                                onChange={(opcion) => cambiarEdicion({ codContacto: opcion?.valor || null })}
                            />
                        )}
                        <QAutocompletar
                            label="Añade familias de producto"
                            nombre="familia"
                            opcional
                            valor=""
                            obtenerOpciones={async (texto) =>
                                (await buscarProductos("familia", texto))
                                    .filter((f) => !edicion.familias.some((elegida) => elegida.codfamilia === f.codigo))
                                    .map((f) => ({ valor: f.codigo, descripcion: f.descripcion }))
                            }
                            onChange={(opcion) =>
                                opcion &&
                                cambiarEdicion({ familias: [...edicion.familias, { codfamilia: opcion.valor, descripcion: opcion.descripcion }] })
                            }
                        />
                        {edicion.familias.length > 0 && (
                            <ul className="familias">
                                {edicion.familias.map((familia) => (
                                    <li key={familia.codfamilia}>
                                        <QEtiqueta variante="neutro">
                                            {familia.descripcion}
                                            <button
                                                type="button"
                                                aria-label={`Quitar ${familia.descripcion}`}
                                                onClick={() =>
                                                    cambiarEdicion({ familias: edicion.familias.filter((f) => f.codfamilia !== familia.codfamilia) })
                                                }
                                            >
                                                ×
                                            </button>
                                        </QEtiqueta>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {dialogo.tipo === "ninguno" && <Errores errores={errores} />}
                        <div className="acciones">
                            <QBoton variante="borde" onClick={() => setEdicion(null)}>
                                Cancelar
                            </QBoton>
                            <QBoton deshabilitado={procesando} onClick={guardarEdicion}>
                                Guardar
                            </QBoton>
                        </div>
                    </section>
                )}

                <section className="estado" aria-label="Estado del trato">
                    <button
                        type="button"
                        className="perdido"
                        aria-pressed={trato.estado === "Perdido"}
                        disabled={procesando || !puedePerder(trato) || bloqueadoFarma}
                        onClick={() => pulsarPerdido().catch(() => undefined)}
                    >
                        Perdido
                    </button>
                    <button
                        type="button"
                        className="ganado"
                        aria-pressed={trato.estado === "Ganado"}
                        disabled={procesando || bloqueadoFarma}
                        onClick={() => pulsarGanado().catch(() => undefined)}
                    >
                        {procesando ? "Procesando…" : textoBotonGanar(trato, tipoTratoFarma)}
                    </button>
                </section>
                {trato.estado === "Perdido" && trato.causaPerdida && <p className="causa">Causa: {trato.causaPerdida}</p>}
                {!edicion && dialogo.tipo === "ninguno" && <Errores errores={errores} />}

                <section className="tarjeta documentos">
                    {trato.idPedido && (
                        <Dato titulo="Pedido">
                            <Link to={rutasSmartsales.pedido(trato.idPedido)}>{trato.codPedido}</Link>
                        </Dato>
                    )}
                    {trato.idPresupuesto && (
                        <Dato titulo="Presupuesto">
                            <Link to={rutasSmartsales.presupuesto(trato.idPresupuesto)}>{trato.codPresupuesto}</Link>
                        </Dato>
                    )}
                    {puedeCrearPresupuesto(trato) && (
                        <QBoton deshabilitado={procesando} onClick={() => abrirDocumento("presupuesto").catch(() => undefined)}>
                            Crear presupuesto
                        </QBoton>
                    )}
                    {puedeAsociarPedido(trato) && (
                        <QBoton
                            variante="borde"
                            deshabilitado={procesando}
                            onClick={() => {
                                setIdPedidoAsociar(null);
                                setErrores([]);
                                setDialogo({ tipo: "asociar_pedido" });
                            }}
                        >
                            Asociar pedido
                        </QBoton>
                    )}
                </section>

                <section className="tarjeta tareas">
                    <header>
                        <h2>Tareas</h2>
                        {(esMio || usuario?.superusuario) && (
                            <QBoton tamaño="pequeño" enlace={rutaNuevaTarea}>
                                + Tarea
                            </QBoton>
                        )}
                    </header>
                    {tareas.length === 0 && <p className="vacio">Sin tareas</p>}
                    {tareas.map((tarea) => (
                        <TarjetaTarea key={tarea.id} tarea={tarea} />
                    ))}
                </section>

                <section className="tarjeta notas">
                    <h2>Notas</h2>
                    <QTextArea label="Nueva nota" nombre="nota" rows={3} valor={nuevaNota} onChange={(valor) => setNuevaNota(valor)} />
                    <div className="acciones">
                        <QBoton tamaño="pequeño" deshabilitado={procesando || !nuevaNota.trim()} onClick={guardarNota}>
                            Añadir nota
                        </QBoton>
                    </div>
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

                {puedeBorrar(trato, agentePropio, tipoTratoFarma, puede("Trato:boton-borrar")) && (
                    <div className="borrar">
                        <QBoton variante="borde" onClick={() => setDialogo({ tipo: "borrar" })}>
                            Borrar trato
                        </QBoton>
                    </div>
                )}

                <QModal nombre="causa_perdida" titulo="Causa de pérdida" abierto={dialogo.tipo === "causa_perdida"} onCerrar={cerrarDialogo}>
                    {dialogo.tipo === "causa_perdida" && (
                        <div className="dialogo">
                            <QSelect
                                label="Causa"
                                nombre="causa"
                                valor={idCausa ?? ""}
                                opciones={dialogo.causas}
                                onChange={(opcion) => setIdCausa(opcion?.valor || null)}
                            />
                            <Errores errores={errores} />
                            <div className="acciones">
                                <QBoton variante="borde" onClick={cerrarDialogo}>
                                    Cancelar
                                </QBoton>
                                <QBoton deshabilitado={procesando} onClick={confirmarCausa}>
                                    Marcar perdido
                                </QBoton>
                            </div>
                        </div>
                    )}
                </QModal>

                <QModal nombre="licencia" titulo="Fechas de la licencia" abierto={dialogo.tipo === "licencia"} onCerrar={cerrarDialogo}>
                    <div className="dialogo">
                        <QDate
                            label="Fecha de finalización del proceso"
                            nombre="fecha_fin"
                            valor={fechasLicencia.fin}
                            onChange={(fin) => setFechasLicencia((actual) => ({ ...actual, fin }))}
                        />
                        <QDate
                            label="Fecha de caducidad de la licencia"
                            nombre="fecha_caducidad"
                            valor={fechasLicencia.caducidad}
                            onChange={(caducidad) => setFechasLicencia((actual) => ({ ...actual, caducidad }))}
                        />
                        <Errores errores={errores} />
                        <div className="acciones">
                            <QBoton variante="borde" onClick={cerrarDialogo}>
                                Cancelar
                            </QBoton>
                            <QBoton deshabilitado={procesando} onClick={confirmarLicencia}>
                                Ganar trato
                            </QBoton>
                        </div>
                    </div>
                </QModal>

                <QModal
                    nombre="documento_trato"
                    titulo={dialogo.tipo === "documento" && dialogo.documento === "pedido" ? "Crear pedido" : "Crear presupuesto"}
                    abierto={dialogo.tipo === "documento"}
                    onCerrar={cerrarDialogo}
                >
                    {dialogo.tipo === "documento" && (
                        <div className="dialogo">
                            {dialogo.conDireccion && (
                                <QSelect
                                    label="Dirección de envío"
                                    nombre="direccion"
                                    valor={datosDocumento.codDireccion ?? ""}
                                    opciones={dialogo.direcciones}
                                    onChange={(opcion) => cambiarDireccion(opcion?.valor || null).catch(() => undefined)}
                                />
                            )}
                            {dirCanarias && (
                                <QSelect
                                    label="Origen de salida"
                                    nombre="regimen_iva"
                                    valor={datosDocumento.regimenIva ?? ""}
                                    opciones={ORIGENES_MERCANCIA}
                                    onChange={(opcion) => setDatosDocumento((actual) => ({ ...actual, regimenIva: opcion?.valor || null }))}
                                />
                            )}
                            <QAutocompletar
                                label="Evento"
                                nombre="evento"
                                valor={datosDocumento.codEvento ?? ""}
                                obtenerOpciones={async (texto) => [EVENTO_VENTA_REGULAR, ...(await buscarEventos(texto))]}
                                onChange={(opcion) => setDatosDocumento((actual) => ({ ...actual, codEvento: opcion?.valor ?? null }))}
                            />
                            <Errores errores={errores} />
                            <div className="acciones">
                                <QBoton variante="borde" onClick={cerrarDialogo}>
                                    Cancelar
                                </QBoton>
                                <QBoton deshabilitado={procesando} onClick={() => confirmarDocumento().catch(() => undefined)}>
                                    Crear
                                </QBoton>
                            </div>
                        </div>
                    )}
                </QModal>

                <QModal nombre="asociar_pedido" titulo="Asociar pedido" abierto={dialogo.tipo === "asociar_pedido"} onCerrar={cerrarDialogo}>
                    <div className="dialogo">
                        <QAutocompletar
                            label="Pedido"
                            nombre="pedido"
                            valor={idPedidoAsociar ?? ""}
                            obtenerOpciones={(texto) => buscarPedidosCliente(trato.codCliente, texto)}
                            onChange={(opcion) => setIdPedidoAsociar(opcion?.valor ?? null)}
                        />
                        <Errores errores={errores} />
                        <div className="acciones">
                            <QBoton variante="borde" onClick={cerrarDialogo}>
                                Cancelar
                            </QBoton>
                            <QBoton deshabilitado={procesando} onClick={confirmarAsociarPedido}>
                                Asociar
                            </QBoton>
                        </div>
                    </div>
                </QModal>

                <QModal nombre="borrar_trato" titulo="¿Borrar trato?" abierto={dialogo.tipo === "borrar"} onCerrar={cerrarDialogo}>
                    <div className="dialogo">
                        <p>{textoConfirmarBorrado(tareas.length > 0, !!trato.idPresupuesto)}</p>
                        <div className="acciones">
                            <QBoton variante="borde" onClick={cerrarDialogo}>
                                Cancelar
                            </QBoton>
                            <QBoton deshabilitado={procesando} onClick={() => confirmarBorrado().catch(() => undefined)}>
                                Borrar
                            </QBoton>
                        </div>
                    </div>
                </QModal>
            </div>
        </LayoutSmartsales>
    );
};
