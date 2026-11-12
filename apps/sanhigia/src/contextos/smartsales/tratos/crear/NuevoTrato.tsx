import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { useAgenteSeguido } from "../../comun/useAgenteSeguido.ts";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { TipoProducto } from "../../nueva_tarea/diseño.ts";
import { buscarClientes, buscarProductos, getNombreCliente } from "../../nueva_tarea/infraestructura.ts";
import { FormularioTrato, TipoTrato } from "../diseño.ts";
import { erroresTrato, tratoParaAPI } from "../dominio.ts";
import {
    crearTrato,
    getDescripcionProducto,
    getFamilia,
    getFamiliaDeProducto,
    getPvpArticulo,
    getTiposTrato,
} from "../infraestructura.ts";
import "../maestro/Tratos.css";

const formularioVacio: FormularioTrato = {
    titulo: "",
    cliente: null,
    idTipoTrato: null,
    valor: 0,
    familias: [],
    producto: null,
};

const NIVELES: TipoProducto[] = ["articulo", "familia", "subfamilia"];

const productoPedido = (parametros: URLSearchParams) => {
    const tipo = NIVELES.find((nivel) => parametros.get(nivel));
    return tipo ? { tipo, codigo: parametros.get(tipo)! } : null;
};

export const NuevoTrato = () => {
    const { intentar } = useContext(ContextoError);
    const navigate = useNavigate();
    const [parametros] = useSearchParams();
    const { usuario } = useAgenteSeguido();

    const [formulario, setFormulario] = useState<FormularioTrato>(formularioVacio);
    const [tipos, setTipos] = useState<TipoTrato[]>([]);
    const [errores, setErrores] = useState<string[]>([]);
    const [guardando, setGuardando] = useState(false);

    const cambiar = (cambios: Partial<FormularioTrato>) => setFormulario((actual) => ({ ...actual, ...cambios }));

    useEffect(() => {
        const cargar = async () => setTipos(await intentar(getTiposTrato));
        cargar().catch(() => undefined);
    }, [intentar]);

    useEffect(() => {
        const cliente = parametros.get("cliente");
        const producto = productoPedido(parametros);
        const cargar = async () => {
            if (cliente) {
                const nombre = await intentar(() => getNombreCliente(cliente));
                cambiar({ cliente: { codigo: cliente, nombre } });
            }
            if (!producto) return;
            const [descripcion, valor, familia] = await intentar(() =>
                Promise.all([
                    getDescripcionProducto(producto.tipo, producto.codigo),
                    producto.tipo === "articulo" ? getPvpArticulo(producto.codigo) : Promise.resolve(0),
                    producto.tipo === "familia" ? getFamilia(producto.codigo) : getFamiliaDeProducto(producto.tipo, producto.codigo),
                ])
            );
            cambiar({
                titulo: descripcion,
                valor,
                producto: { ...producto, descripcion },
                familias: familia ? [familia] : [],
            });
        };
        cargar().catch(() => undefined);
    }, [intentar, parametros]);

    useEffect(() => {
        if (productoPedido(parametros) && usuario?.tipoTratoVentaProducto) {
            cambiar({ idTipoTrato: usuario.tipoTratoVentaProducto });
        }
    }, [parametros, usuario?.tipoTratoVentaProducto]);

    const guardar = async () => {
        const encontrados = erroresTrato(formulario);
        setErrores(encontrados);
        if (encontrados.length > 0) return;

        setGuardando(true);
        try {
            const { pk } = await intentar(() => crearTrato(tratoParaAPI(formulario)));
            navigate(rutasSmartsales.trato(String(pk)));
        } catch {
            setGuardando(false);
        }
    };

    return (
        <LayoutSmartsales>
            <div className="NuevoTrato">
                <header>
                    <h1>Nuevo trato</h1>
                </header>

                <QInput label="Título" nombre="titulo" valor={formulario.titulo} maxLength={100} onChange={(titulo) => cambiar({ titulo })} />

                <QAutocompletar
                    label="Cliente"
                    nombre="cliente"
                    valor={formulario.cliente?.codigo ?? ""}
                    descripcion={formulario.cliente?.nombre}
                    obtenerOpciones={async (texto) => (await buscarClientes(texto)).map((c) => ({ valor: c.codigo, descripcion: c.nombre }))}
                    onChange={(opcion) => cambiar({ cliente: opcion ? { codigo: opcion.valor, nombre: opcion.descripcion } : null })}
                />

                <QSelect
                    label="Tipo de trato"
                    nombre="tipo_trato"
                    valor={formulario.idTipoTrato ?? ""}
                    opciones={tipos.map((t) => ({ valor: t.id, descripcion: t.descripcion }))}
                    onChange={(opcion) => cambiar({ idTipoTrato: opcion?.valor || null })}
                />

                <QInput
                    label="Valor"
                    nombre="valor"
                    tipo="moneda"
                    valor={String(formulario.valor)}
                    onChange={(valor) => cambiar({ valor: Number(valor) || 0 })}
                />

                {formulario.producto && (
                    <p className="producto">
                        Producto ligado: <strong>{formulario.producto.descripcion}</strong>
                    </p>
                )}

                <QAutocompletar
                    label="Añade familias de producto"
                    nombre="familia"
                    opcional
                    valor=""
                    obtenerOpciones={async (texto) =>
                        (await buscarProductos("familia", texto))
                            .filter((f) => !formulario.familias.some((elegida) => elegida.codfamilia === f.codigo))
                            .map((f) => ({ valor: f.codigo, descripcion: f.descripcion }))
                    }
                    onChange={(opcion) =>
                        opcion && cambiar({ familias: [...formulario.familias, { codfamilia: opcion.valor, descripcion: opcion.descripcion }] })
                    }
                />
                {formulario.familias.length > 0 && (
                    <ul className="familias">
                        {formulario.familias.map((familia) => (
                            <li key={familia.codfamilia}>
                                <QEtiqueta variante="neutro">
                                    {familia.descripcion}
                                    <button
                                        type="button"
                                        aria-label={`Quitar ${familia.descripcion}`}
                                        onClick={() => cambiar({ familias: formulario.familias.filter((f) => f.codfamilia !== familia.codfamilia) })}
                                    >
                                        ×
                                    </button>
                                </QEtiqueta>
                            </li>
                        ))}
                    </ul>
                )}

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
                        Crear trato
                    </QBoton>
                </div>
            </div>
        </LayoutSmartsales>
    );
};
