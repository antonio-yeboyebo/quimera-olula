import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Tarea } from "../../comun/diseño.ts";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { EtiquetaAfinidad } from "../../comun/componentes/EtiquetaAfinidad.tsx";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { TarjetaTarea } from "../../comun/componentes/TarjetaTarea.tsx";
import { Sugerencia } from "../../nueva_tarea/diseño.ts";
import { getSugerencias } from "../../nueva_tarea/infraestructura.ts";
import { DocumentoCliente, ResumenCliente, TipoDocumento, TratoFicha } from "../diseño.ts";
import { enlaceComoLlegar, enlaceEmail, enlaceLlamar, enlaceWhatsapp, textoEstadoTrato } from "../dominio.ts";
import {
    documentoConPdf,
    getDocumentosCliente,
    getPdfDocumento,
    getResumenCliente,
    getTareasCliente,
    getTratosCliente,
} from "../infraestructura.ts";
import "../maestro/Clientes.css";
import "./FichaCliente.css";

type Pestaña = "resumen" | "actividad" | "tratos" | "documentos";

const pestañas: [Pestaña, string][] = [
    ["resumen", "Resumen"],
    ["actividad", "Actividad"],
    ["tratos", "Tratos"],
    ["documentos", "Documentos"],
];

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

const Casilla = ({ valor, texto }: { valor: string; texto: string }) => (
    <div className="casilla">
        <strong>{valor}</strong>
        <span>{texto}</span>
    </div>
);

const tituloDocumentos: Record<TipoDocumento, string> = {
    presupuesto: "Presupuestos",
    pedido: "Pedidos",
    factura: "Facturas",
};

export const FichaCliente = () => {
    const { codCliente = "" } = useParams();
    const { intentar } = useContext(ContextoError);
    const [pestaña, setPestaña] = useState<Pestaña>("resumen");
    const [resumen, setResumen] = useState<ResumenCliente | null>(null);
    const [oportunidades, setOportunidades] = useState<Sugerencia[]>([]);
    const [tareas, setTareas] = useState<Tarea[] | null>(null);
    const [tratos, setTratos] = useState<TratoFicha[] | null>(null);
    const [documentos, setDocumentos] = useState<DocumentoCliente[][] | null>(null);

    useEffect(() => {
        setResumen(null);
        setTareas(null);
        setTratos(null);
        setDocumentos(null);
        const cargar = async () => {
            const [nuevoResumen, nuevasOportunidades] = await intentar(() =>
                Promise.all([getResumenCliente(codCliente), getSugerencias(codCliente).catch(() => [])])
            );
            setResumen(nuevoResumen);
            setOportunidades(nuevasOportunidades);
        };
        cargar().catch(() => undefined);
    }, [intentar, codCliente]);

    useEffect(() => {
        const cargar = async () => {
            if (pestaña === "actividad" && tareas === null) setTareas(await intentar(() => getTareasCliente(codCliente)));
            if (pestaña === "tratos" && tratos === null) setTratos(await intentar(() => getTratosCliente(codCliente)));
            if (pestaña === "documentos" && documentos === null) {
                setDocumentos(
                    await intentar(() =>
                        Promise.all(
                            (["presupuesto", "pedido", "factura"] as TipoDocumento[]).map((tipo) => getDocumentosCliente(tipo, codCliente))
                        )
                    )
                );
            }
        };
        cargar().catch(() => undefined);
    }, [intentar, pestaña, codCliente, tareas, tratos, documentos]);

    const abrirPdf = async (documento: DocumentoCliente) => {
        const pdf = await intentar(() => getPdfDocumento(documento.tipo, documento.id));
        window.open(URL.createObjectURL(new Blob([pdf], { type: "application/pdf" })), "_blank");
    };

    if (!resumen) {
        return (
            <LayoutSmartsales>
                <p>Cargando…</p>
            </LayoutSmartsales>
        );
    }

    return (
        <LayoutSmartsales>
            <div className="FichaCliente">
                <header className="cabecera-ficha">
                    <h1>{resumen.nombre}</h1>
                    <div className="subtitulo">
                        <span className="secundario">
                            {[resumen.direccion?.ciudad, resumen.clienteDesde && `Cliente desde ${new Date(resumen.clienteDesde).getFullYear()}`]
                                .filter(Boolean)
                                .join(" · ")}
                        </span>
                        <QEtiqueta variante={resumen.activo ? "exito" : "gris"}>{resumen.activo ? "Activo" : "Inactivo"}</QEtiqueta>
                    </div>
                </header>

                <nav className="acciones-contacto" aria-label="Contactar">
                    <AccionContacto href={enlaceLlamar(resumen.telefono)} icono="telefono" texto="Llamar" />
                    <AccionContacto href={enlaceEmail(resumen.email)} icono="correo" texto="Email" />
                    <AccionContacto href={enlaceWhatsapp(resumen.telefono)} icono="whatsapp" texto="WhatsApp" />
                    <AccionContacto href={enlaceComoLlegar(resumen.direccion)} icono="casa" texto="Cómo llegar" />
                </nav>

                <div className="pestañas" role="tablist">
                    {pestañas.map(([valor, texto]) => (
                        <button key={valor} type="button" role="tab" aria-selected={pestaña === valor} onClick={() => setPestaña(valor)}>
                            {texto}
                        </button>
                    ))}
                </div>

                {pestaña === "resumen" && (
                    <>
                        <div className="casillas">
                            <Casilla valor={resumen.ventas12Meses === null ? "—" : euros.format(resumen.ventas12Meses)} texto="Ventas 12 meses" />
                            <Casilla valor={String(resumen.tratosAbiertos)} texto="Tratos abiertos" />
                            <Casilla valor={fecha(resumen.ultimaVisita)} texto="Última visita" />
                            <Casilla valor={fecha(resumen.ultimaCompra)} texto="Última compra" />
                        </div>

                        {resumen.proximasAcciones === 0 && (
                            <div className="sin-proxima-accion">
                                <QIcono nombre="relojarena" />
                                <div>
                                    <strong>Sin próxima acción</strong>
                                    <span>Este cliente no tiene ninguna tarea futura programada.</span>
                                </div>
                                <QBoton enlace={rutasSmartsales.nuevaTareaPara(codCliente)} variante="borde" tamaño="pequeño">
                                    + Programar visita
                                </QBoton>
                            </div>
                        )}

                        <section className="tarjeta">
                            <h2>Oportunidades recomendadas</h2>
                            {oportunidades.length === 0 && <p className="vacio">Sin recomendaciones para este cliente</p>}
                            <ul className="oportunidades">
                                {oportunidades.map((o) => (
                                    <li key={o.codSubfamilia}>
                                        <span>{o.descripcion}</span>
                                        <EtiquetaAfinidad score={o.score} conPorcentaje />
                                        <QBoton
                                            variante="borde"
                                            tamaño="pequeño"
                                            enlace={rutasSmartsales.nuevoTratoDesde(codCliente, { tipo: "subfamilia", codigo: o.codSubfamilia })}
                                        >
                                            Crear trato
                                        </QBoton>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </>
                )}

                {pestaña === "actividad" && (
                    <section className="tarjeta tareas">
                        {tareas?.length === 0 && <p className="vacio">Sin tareas con este cliente</p>}
                        {tareas?.map((tarea) => (
                            <TarjetaTarea key={tarea.id} tarea={tarea} />
                        ))}
                    </section>
                )}

                {pestaña === "tratos" && tratos?.length === 0 && <p className="vacio">Sin tratos con este cliente</p>}
                {pestaña === "tratos" && !!tratos?.length && (
                    <ul className="lista tarjeta">
                        {tratos?.map((trato) => (
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
                )}

                {pestaña === "documentos" &&
                    documentos?.map((lista, indice) => {
                        const tipo = (["presupuesto", "pedido", "factura"] as TipoDocumento[])[indice];
                        return (
                            <section key={tipo} className="tarjeta">
                                <h2>{tituloDocumentos[tipo]}</h2>
                                {lista.length === 0 && <p className="vacio">Sin documentos</p>}
                                <ul className="lista">
                                    {lista.map((doc) => (
                                        <li key={doc.id} className="documento">
                                            <div>
                                                <strong>{doc.codigo}</strong>
                                                <span className="secundario">
                                                    {fecha(doc.fecha)} · {euros.format(doc.total)}
                                                </span>
                                            </div>
                                            {documentoConPdf(tipo) && (
                                                <QBoton variante="borde" tamaño="pequeño" onClick={() => abrirPdf(doc).catch(() => undefined)}>
                                                    PDF
                                                </QBoton>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        );
                    })}
            </div>
        </LayoutSmartsales>
    );
};
