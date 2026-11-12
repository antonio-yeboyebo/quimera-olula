import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { formatearFechaHoraString, formatearMoneda } from "@olula/lib/dominio.ts";
import { useEffect, useState } from "react";
import { CobroOnline, GetCobrosOnline } from "../diseño.ts";
import { TEXTO_ESTADO, VARIANTE_ESTADO, textoIncidencia } from "../dominio.ts";
import "./CobrosOnline.css";

/**
 * Cobros con tarjeta de un documento: estado de cada enlace y lo que haya que
 * revisar (incidencias del webhook). No muestra nada si no hay ninguno.
 * `recarga` cambia para volver a leerlos (p.ej. al cerrar el modal del enlace).
 */
export const CobrosOnline = ({ getCobros, recarga = 0 }: { getCobros: GetCobrosOnline; recarga?: number }) => {
    const [cobros, setCobros] = useState<CobroOnline[]>([]);

    useEffect(() => {
        let vigente = true;
        getCobros()
            .then((datos) => vigente && setCobros(datos))
            .catch(() => vigente && setCobros([]));
        return () => {
            vigente = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recarga]);

    if (!cobros.length) return null;

    return (
        <section className="CobrosOnline">
            <h3>Cobros con tarjeta</h3>
            <ul>
                {cobros.map((cobro) => (
                    <li key={cobro.id}>
                        <div className="fila">
                            <QEtiqueta variante={VARIANTE_ESTADO[cobro.estado]}>
                                {TEXTO_ESTADO[cobro.estado]}
                            </QEtiqueta>
                            <span className="importe">{formatearMoneda(cobro.importe, cobro.divisaId)}</span>
                            <span className="fecha">
                                {cobro.pagadoEn
                                    ? `Pagado el ${formatearFechaHoraString(cobro.pagadoEn)}`
                                    : `Creado el ${formatearFechaHoraString(cobro.creadoEn)}`}
                            </span>
                            {cobro.modo === "test" && <QEtiqueta variante="gris">test</QEtiqueta>}
                            {cobro.urlPanel && (
                                <a
                                    className="panel"
                                    href={cobro.urlPanel}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Abrir el pago en el panel de Stripe"
                                >
                                    Ver en Stripe
                                    <QIcono nombre="arriba_derecha" tamaño="sm" />
                                </a>
                            )}
                        </div>
                        {cobro.incidencia && (
                            <QAviso variante="advertencia">{textoIncidencia(cobro.incidencia)}</QAviso>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
};
