import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { useAgenteSeguido } from "../../comun/useAgenteSeguido.ts";
import { EtiquetaAfinidad } from "../../comun/componentes/EtiquetaAfinidad.tsx";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { ListaArticulos } from "../../comun/componentes/ListaArticulos.tsx";
import { SelectorAgente } from "../../comun/componentes/SelectorAgente.tsx";
import { buscarProductos } from "../../nueva_tarea/infraestructura.ts";
import { FormularioCampania, TipoCampania } from "../diseño.ts";
import { contextoInicial, textoTipoCampania, tipoProductoDe } from "../dominio.ts";
import { getMaquina } from "../maquina.ts";
import "../maestro/Campanias.css";

const TIPOS = (Object.keys(textoTipoCampania) as TipoCampania[]).map((valor) => ({ valor, descripcion: textoTipoCampania[valor] }));

const Errores = ({ errores }: { errores: string[] }) =>
    errores.length > 0 ? (
        <ul className="errores">
            {errores.map((error) => (
                <li key={error}>{error}</li>
            ))}
        </ul>
    ) : null;

export const NuevaCampania = () => {
    const navigate = useNavigate();
    const { agenteSeguido } = useAgenteSeguido();
    const { ctx, emitir } = useMaquina(getMaquina, contextoInicial);
    const { estado, formulario, clientes, errores } = ctx;
    const [enviando, setEnviando] = useState(false);

    const enviar = (evento: string) => {
        setEnviando(true);
        emitir(evento)
            .catch(() => undefined)
            .finally(() => setEnviando(false));
    };

    const cambiar = (cambios: Partial<FormularioCampania>) => emitir("cambiar", cambios);

    useEffect(() => {
        emitir("fijar_agente", agenteSeguido);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agenteSeguido]);

    useEffect(() => {
        if (estado === "CREADA" && ctx.idCampania) navigate(rutasSmartsales.campania(ctx.idCampania));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [estado]);

    const tipoProducto = tipoProductoDe(formulario);

    if (estado !== "DEFINIENDO") {
        return (
            <LayoutSmartsales>
                <div className="Campanias">
                    <header>
                        <h1>{formulario.nombre}</h1>
                    </header>
                    <p className="secundario">
                        {clientes.length} {clientes.length === 1 ? "cliente entrará" : "clientes entrarán"} en la campaña. Se creará un trato
                        publicado para cada uno.
                    </p>
                    <ul className="lista">
                        {clientes.map((cliente) => (
                            <li key={cliente.codCliente}>
                                <div>
                                    <strong>{cliente.nombre}</strong>
                                    {cliente.ciudad && <span className="secundario"> · {cliente.ciudad}</span>}
                                </div>
                                {cliente.afinidad !== null && <EtiquetaAfinidad score={cliente.afinidad} conPorcentaje />}
                            </li>
                        ))}
                    </ul>
                    <Errores errores={errores} />
                    <div className="acciones">
                        <QBoton variante="borde" deshabilitado={enviando} onClick={() => enviar("volver")}>
                            Volver
                        </QBoton>
                        <QBoton deshabilitado={enviando || estado !== "REVISANDO" || clientes.length === 0} onClick={() => enviar("crear")}>
                            Crear campaña
                        </QBoton>
                    </div>
                </div>
            </LayoutSmartsales>
        );
    }

    return (
        <LayoutSmartsales>
            <div className="Campanias">
                <header>
                    <h1>Nueva campaña</h1>
                </header>

                <SelectorAgente />

                <QSelect
                    label="Tipo de campaña"
                    nombre="tipo"
                    valor={formulario.tipo}
                    opciones={TIPOS}
                    onChange={(opcion) => opcion && cambiar({ tipo: opcion.valor as TipoCampania })}
                />

                {formulario.tipo === "inactivos" && (
                    <>
                        <QInput
                            label="Días sin comprar"
                            nombre="dias"
                            valor={String(formulario.dias)}
                            onChange={(valor) => cambiar({ dias: Number(valor) || 0 })}
                        />
                        <QSelect
                            label="Producto"
                            nombre="tipo_producto"
                            valor={formulario.tipoProducto}
                            opciones={[
                                { valor: "subfamilia", descripcion: "Una subfamilia" },
                                { valor: "listadearticulos", descripcion: "Unos artículos" },
                            ]}
                            onChange={(opcion) => opcion && cambiar({ tipoProducto: opcion.valor as FormularioCampania["tipoProducto"] })}
                        />
                    </>
                )}

                {formulario.tipo === "ventaCruzada" && (
                    <div className="fechas">
                        <QDate label="Compras desde" nombre="desde" valor={formulario.desde} onChange={(desde) => cambiar({ desde })} />
                        <QDate label="Hasta" nombre="hasta" valor={formulario.hasta} onChange={(hasta) => cambiar({ hasta })} />
                    </div>
                )}

                {formulario.tipo === "captacion" && (
                    <QInput
                        label="Afinidad mínima (%)"
                        nombre="umbral"
                        valor={String(Math.round(formulario.umbral * 100))}
                        onChange={(valor) => cambiar({ umbral: (Number(valor) || 0) / 100 })}
                    />
                )}

                {tipoProducto === "subfamilia" ? (
                    <QAutocompletar
                        label="Subfamilia"
                        nombre="subfamilia"
                        valor={formulario.subfamilia?.codigo ?? ""}
                        descripcion={formulario.subfamilia?.descripcion}
                        obtenerOpciones={async (texto) =>
                            (await buscarProductos("subfamilia", texto)).map((p) => ({ valor: p.codigo, descripcion: p.descripcion }))
                        }
                        onChange={(opcion) => cambiar({ subfamilia: opcion ? { codigo: opcion.valor, descripcion: opcion.descripcion } : null })}
                    />
                ) : (
                    <ListaArticulos
                        label={formulario.tipo === "ventaCruzada" ? "Compran estos artículos" : "Artículos"}
                        nombre="articulos"
                        articulos={formulario.articulos}
                        onChange={(articulos) => cambiar({ articulos })}
                    />
                )}

                {formulario.tipo === "ventaCruzada" && (
                    <>
                        <QSelect
                            label="Deben haber comprado"
                            nombre="modo_incluidos"
                            valor={formulario.modoIncluidos}
                            opciones={[
                                { valor: "alguno", descripcion: "Alguno de ellos" },
                                { valor: "todos", descripcion: "Todos" },
                            ]}
                            onChange={(opcion) => opcion && cambiar({ modoIncluidos: opcion.valor as FormularioCampania["modoIncluidos"] })}
                        />
                        <ListaArticulos
                            label="Y no compran estos artículos"
                            nombre="excluidos"
                            articulos={formulario.excluidos}
                            onChange={(excluidos) => cambiar({ excluidos })}
                        />
                        {formulario.excluidos.length > 0 && (
                            <QSelect
                                label="Quedan fuera si compraron"
                                nombre="modo_excluidos"
                                valor={formulario.modoExcluidos}
                                opciones={[
                                    { valor: "ninguno", descripcion: "Alguno de ellos" },
                                    { valor: "alguno", descripcion: "Todos" },
                                ]}
                                onChange={(opcion) => opcion && cambiar({ modoExcluidos: opcion.valor as FormularioCampania["modoExcluidos"] })}
                            />
                        )}
                    </>
                )}

                <QInput label="Nombre" nombre="nombre" maxLength={100} valor={formulario.nombre} onChange={(nombre) => cambiar({ nombre })} />
                <QTextArea
                    label="Descripción u objetivo"
                    nombre="descripcion"
                    rows={3}
                    valor={formulario.descripcion}
                    onChange={(descripcion) => cambiar({ descripcion })}
                />

                <Errores errores={errores} />

                <div className="acciones">
                    <QBoton variante="borde" onClick={() => navigate(-1)}>
                        Cancelar
                    </QBoton>
                    <QBoton deshabilitado={enviando} onClick={() => enviar("previsualizar")}>
                        Ver clientes
                    </QBoton>
                </div>
            </div>
        </LayoutSmartsales>
    );
};
