import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { TipoTarea } from "../../comun/diseño.ts";
import { textoTipoTarea } from "../../comun/dominio.ts";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { useAgenteSeguido } from "../../comun/useAgenteSeguido.ts";
import { EtiquetaAfinidad } from "../../comun/componentes/EtiquetaAfinidad.tsx";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { NotaDictada } from "../../comun/componentes/NotaDictada.tsx";
import { FormularioTarea, Motivo, Sugerencia, TipoProducto, TratoCliente } from "../diseño.ts";
import { erroresFormulario, formularioVacio, MAX_NOTA, sugerenciasVisibles, tareaParaAPI } from "../dominio.ts";
import {
    buscarClientes,
    buscarProductos,
    crearTarea,
    crearTareaUnica,
    getMotivos,
    getNombreCliente,
    getSugerencias,
    getTratosAbiertosCliente,
} from "../infraestructura.ts";
import "./NuevaTarea.css";

const TIPOS: TipoTarea[] = ["Cita", "Llamada", "Email", "Whatsapp"];
const SIN_TRATO = "sin_trato";

const nivelesProducto: { valor: TipoProducto; descripcion: string }[] = [
    { valor: "articulo", descripcion: "Artículo" },
    { valor: "familia", descripcion: "Familia" },
    { valor: "subfamilia", descripcion: "Subfamilia" },
];

export const NuevaTarea = () => {
    const { intentar } = useContext(ContextoError);
    const navigate = useNavigate();
    const [parametros] = useSearchParams();
    const { agentePropio } = useAgenteSeguido();

    const [formulario, setFormulario] = useState<FormularioTarea>(() => formularioVacio());
    const [motivos, setMotivos] = useState<Motivo[]>([]);
    const [tratos, setTratos] = useState<TratoCliente[]>([]);
    const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
    const [todasSugerencias, setTodasSugerencias] = useState(false);
    const [nivelProducto, setNivelProducto] = useState<TipoProducto>("subfamilia");
    const [errores, setErrores] = useState<string[]>([]);
    const [guardando, setGuardando] = useState(false);

    const cambiar = (cambios: Partial<FormularioTarea>) => setFormulario((actual) => ({ ...actual, ...cambios }));
    const codCliente = formulario.cliente?.codigo ?? null;

    useEffect(() => {
        const cargar = async () => setMotivos(await intentar(getMotivos));
        cargar().catch(() => undefined);
    }, [intentar]);

    useEffect(() => {
        const cliente = parametros.get("cliente");
        if (!cliente) return;
        const cargar = async () => {
            const nombre = await intentar(() => getNombreCliente(cliente));
            setFormulario((actual) => ({ ...actual, cliente: { codigo: cliente, nombre } }));
        };
        cargar().catch(() => undefined);
    }, [intentar, parametros]);

    useEffect(() => {
        setTratos([]);
        setSugerencias([]);
        if (!codCliente) return;
        const cargar = async () => {
            const [nuevosTratos, nuevasSugerencias] = await intentar(() =>
                Promise.all([getTratosAbiertosCliente(codCliente), getSugerencias(codCliente)])
            );
            setTratos(nuevosTratos);
            setSugerencias(nuevasSugerencias);
            const tratoPedido = parametros.get("trato");
            const elegido = nuevosTratos.find((t) => t.id === tratoPedido) ?? nuevosTratos[0];
            setFormulario((actual) => ({ ...actual, idTrato: elegido?.id ?? null }));
        };
        cargar().catch(() => undefined);
    }, [intentar, codCliente, parametros]);

    const guardar = async () => {
        const encontrados = erroresFormulario(formulario);
        setErrores(encontrados);
        if (encontrados.length > 0 || !formulario.cliente) return;

        setGuardando(true);
        try {
            const tarea = tareaParaAPI(formulario, motivos);
            await intentar(() =>
                formulario.idTrato
                    ? crearTarea({ ...tarea, idtrato: Number(formulario.idTrato), codagente: agentePropio ?? "" })
                    : crearTareaUnica({ ...tarea, codcliente: formulario.cliente!.codigo })
            );
            navigate(rutasSmartsales.agenda);
        } catch {
            setGuardando(false);
        }
    };

    const opcionesTrato = [
        ...tratos.map((trato) => ({ valor: trato.id, descripcion: trato.titulo })),
        { valor: SIN_TRATO, descripcion: "Sin trato: crear como tarea única" },
    ];

    return (
        <LayoutSmartsales>
            <div className="NuevaTarea">
                <h1>Nueva visita o tarea</h1>

                <section className="tarjeta formulario">
                    <QAutocompletar
                        label="Cliente"
                        nombre="cliente"
                        valor={formulario.cliente?.codigo ?? ""}
                        descripcion={formulario.cliente?.nombre}
                        obtenerOpciones={async (texto) =>
                            (await buscarClientes(texto)).map((c) => ({ valor: c.codigo, descripcion: c.nombre }))
                        }
                        onChange={(opcion) =>
                            cambiar({ cliente: opcion ? { codigo: opcion.valor, nombre: opcion.descripcion } : null, idTrato: null })
                        }
                    />

                    {formulario.cliente && (
                        <QSelect
                            label="Trato"
                            nombre="trato"
                            valor={formulario.idTrato ?? SIN_TRATO}
                            opciones={opcionesTrato}
                            onChange={(opcion) => cambiar({ idTrato: opcion && opcion.valor !== SIN_TRATO ? opcion.valor : null })}
                        />
                    )}

                    <span className="titulo-campo" id="tipo-tarea">
                        Tipo de tarea
                    </span>
                    <div className="tipos" role="radiogroup" aria-labelledby="tipo-tarea">
                        {TIPOS.map((tipo) => (
                            <button
                                key={tipo}
                                type="button"
                                role="radio"
                                aria-checked={formulario.tipo === tipo}
                                onClick={() => cambiar({ tipo })}
                            >
                                {textoTipoTarea[tipo]}
                            </button>
                        ))}
                    </div>

                    <div className="fila">
                        <QInput label="Fecha" nombre="fecha" tipo="fecha" valor={formulario.fecha} onChange={(fecha) => cambiar({ fecha })} />
                        <QInput label="Hora" nombre="hora" tipo="hora" valor={formulario.hora} onChange={(hora) => cambiar({ hora })} />
                    </div>

                    <QSelect
                        label="Motivo"
                        nombre="motivo"
                        valor={formulario.idMotivo ?? ""}
                        opcional
                        opciones={motivos.map((m) => ({ valor: m.id, descripcion: m.descripcion }))}
                        onChange={(opcion) => cambiar({ idMotivo: opcion?.valor || null })}
                    />

                    <div className="fila">
                        <QSelect
                            label="Producto"
                            nombre="nivel_producto"
                            valor={nivelProducto}
                            opciones={nivelesProducto}
                            onChange={(opcion) => {
                                if (!opcion) return;
                                setNivelProducto(opcion.valor as TipoProducto);
                                cambiar({ producto: null });
                            }}
                        />
                        <QAutocompletar
                            key={nivelProducto}
                            label={nivelesProducto.find((n) => n.valor === nivelProducto)?.descripcion ?? ""}
                            nombre="producto"
                            opcional
                            valor={formulario.producto?.codigo ?? ""}
                            descripcion={formulario.producto?.descripcion}
                            obtenerOpciones={async (texto) =>
                                (await buscarProductos(nivelProducto, texto)).map((p) => ({ valor: p.codigo, descripcion: p.descripcion }))
                            }
                            onChange={(opcion) =>
                                cambiar({
                                    producto: opcion ? { tipo: nivelProducto, codigo: opcion.valor, descripcion: opcion.descripcion } : null,
                                })
                            }
                        />
                    </div>

                    {sugerencias.length > 0 && (
                        <section className="sugerencias">
                            <header>
                                <h2>Sugerencias para este cliente</h2>
                                {sugerenciasVisibles(sugerencias, true).length > sugerenciasVisibles(sugerencias, false).length && (
                                    <QBoton variante="texto" tamaño="pequeño" onClick={() => setTodasSugerencias(!todasSugerencias)}>
                                        {todasSugerencias ? "Ver menos" : "Ver más"}
                                    </QBoton>
                                )}
                            </header>
                            <ul>
                                {sugerenciasVisibles(sugerencias, todasSugerencias).map((s) => (
                                    <li key={s.codSubfamilia}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNivelProducto("subfamilia");
                                                cambiar({ producto: { tipo: "subfamilia", codigo: s.codSubfamilia, descripcion: s.descripcion } });
                                            }}
                                        >
                                            <span>{s.descripcion}</span>
                                            <EtiquetaAfinidad score={s.score} conPorcentaje />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <NotaDictada label="Notas" valor={formulario.nota} maximo={MAX_NOTA} onChange={(nota) => cambiar({ nota })} />
                </section>

                {errores.length > 0 && (
                    <ul className="errores">
                        {errores.map((error) => (
                            <li key={error}>{error}</li>
                        ))}
                    </ul>
                )}

                <div className="acciones">
                    <QBoton variante="borde" ancho onClick={() => navigate(-1)}>
                        Cancelar
                    </QBoton>
                    <QBoton ancho deshabilitado={guardando} onClick={() => guardar()}>
                        Guardar
                    </QBoton>
                </div>
            </div>
        </LayoutSmartsales>
    );
};
