import { CodigoQr } from "#/tesoreria/cobro_online/componentes/CodigoQr.tsx";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { useEffect, useReducer, useRef } from "react";
import { escucharVisor } from "./canal.ts";
import { CobroVisor, MetodoCobroVisor, PagadoVisor, VentaVisor } from "./diseño.ts";
import { DURACION_PAGADO_MS, aplicarMensajeVisor, cambioDeEfectivo, estadoVisorVacio } from "./dominio.ts";
import "./VisorClienteTpv.css";

const TEXTO_METODO: Record<MetodoCobroVisor, string> = {
    efectivo: "Pago en efectivo",
    tarjeta: "Pago con tarjeta",
    vale: "Pago con vale",
    qr: "Escanea para pagar",
};

/**
 * Visor de cliente: se abre en una segunda ventana del TPV y se lleva a la
 * pantalla que mira al cliente. Muestra los artículos de la venta, el total y
 * el cobro en curso, sea cual sea el método de pago.
 */
export const VisorClienteTpv = () => {
    const [estado, aplicar] = useReducer(aplicarMensajeVisor, estadoVisorVacio);

    useEffect(() => escucharVisor(aplicar), []);

    const { venta, cobro, pagado } = estado;

    useEffect(() => {
        if (!pagado) return;
        const temporizador = setTimeout(() => aplicar({ tipo: "limpiar" }), DURACION_PAGADO_MS);
        return () => clearTimeout(temporizador);
    }, [pagado]);

    return (
        <main className="VisorClienteTpv">
            {pagado ? (
                <Pagado pagado={pagado} />
            ) : venta ? (
                <div className="venta">
                    <Lineas venta={venta} />
                    <Resumen venta={venta} cobro={cobro} cambio={cambioDeEfectivo(estado)} />
                </div>
            ) : (
                <section className="espera">
                    <h1>Bienvenido</h1>
                </section>
            )}
        </main>
    );
};

const Lineas = ({ venta }: { venta: VentaVisor }) => {
    const final = useRef<HTMLLIElement>(null);
    const numLineas = venta.lineas.length;

    // El último artículo añadido siempre a la vista.
    useEffect(() => {
        final.current?.scrollIntoView?.({ block: "end", behavior: "smooth" });
    }, [numLineas]);

    if (numLineas === 0) {
        return (
            <section className="lineas vacia" aria-label="Artículos">
                <p>Todavía no hay artículos</p>
            </section>
        );
    }

    return (
        <section className="lineas" aria-label="Artículos">
            <ul>
                {venta.lineas.map((linea, i) => (
                    <li key={linea.id} ref={i === numLineas - 1 ? final : undefined}>
                        <span className="descripcion">{linea.descripcion}</span>
                        <span className="importe-linea">{formatearMoneda(linea.total, venta.divisaId)}</span>
                        <span className="detalle-linea">
                            {linea.cantidad} × {formatearMoneda(linea.pvpUnitario, venta.divisaId)}
                            {linea.dtoPorcentual ? ` · Dto. ${linea.dtoPorcentual}%` : ""}
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
};

const Resumen = ({ venta, cobro, cambio }: { venta: VentaVisor; cobro: CobroVisor | null; cambio: number }) => {
    const devolucion = venta.total < 0;
    const hayPagos = venta.pagado !== 0 && venta.pendiente !== 0;
    const articulos = venta.lineas.reduce((suma, l) => suma + l.cantidad, 0);

    return (
        <aside className="resumen" aria-live="polite">
            <div className="totales">
                <p className="etiqueta">
                    {devolucion ? "Total a devolver" : "Total a pagar"}
                    <span className="num-articulos">
                        {articulos} {Math.abs(articulos) === 1 ? "artículo" : "artículos"}
                    </span>
                </p>
                <p className="total">{formatearMoneda(Math.abs(venta.total), venta.divisaId)}</p>
                {hayPagos && (
                    <dl className="parciales">
                        <div>
                            <dt>Pagado</dt>
                            <dd>{formatearMoneda(venta.pagado, venta.divisaId)}</dd>
                        </div>
                        <div className="pendiente">
                            <dt>Pendiente</dt>
                            <dd>{formatearMoneda(venta.pendiente, venta.divisaId)}</dd>
                        </div>
                    </dl>
                )}
            </div>

            {cobro && <Cobro venta={venta} cobro={cobro} cambio={cambio} />}
        </aside>
    );
};

const Cobro = ({ venta, cobro, cambio }: { venta: VentaVisor; cobro: CobroVisor; cambio: number }) => (
    <section className={`cobro cobro-${cobro.metodo}`}>
        <h2>{TEXTO_METODO[cobro.metodo]}</h2>

        {cobro.metodo === "efectivo" && cobro.entregado !== undefined && cobro.entregado > 0 && (
            <dl className="parciales">
                <div>
                    <dt>Entregado</dt>
                    <dd>{formatearMoneda(cobro.entregado, venta.divisaId)}</dd>
                </div>
                <div className="cambio">
                    <dt>Cambio</dt>
                    <dd>{formatearMoneda(cambio, venta.divisaId)}</dd>
                </div>
            </dl>
        )}

        {cobro.metodo === "tarjeta" && <p>Sigue las indicaciones del datáfono.</p>}

        {cobro.metodo === "qr" &&
            (cobro.qr ? (
                <>
                    <div className="qr">
                        <CodigoQr url={cobro.qr.url} tamaño={480} />
                    </div>
                    <p>Con la cámara del móvil. Puedes pagar con tarjeta, Apple Pay o Google Pay.</p>
                    {cobro.qr.modo === "test" && <p className="test">Modo test: no se cobra de verdad.</p>}
                </>
            ) : (
                <p>Preparando el código…</p>
            ))}
    </section>
);

const Pagado = ({ pagado }: { pagado: PagadoVisor }) => (
    <section className="pagado" aria-live="polite">
        <h1>Pago recibido</h1>
        <p className="total">{formatearMoneda(Math.abs(pagado.importe), pagado.divisaId)}</p>
        {pagado.cambio > 0 && (
            <p className="cambio">Su cambio: {formatearMoneda(pagado.cambio, pagado.divisaId)}</p>
        )}
        <p>Gracias por su compra.</p>
    </section>
);
