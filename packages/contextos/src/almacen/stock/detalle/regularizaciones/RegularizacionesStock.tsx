import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { formatearFechaString } from "@olula/lib/dominio.ts";
import { RegularizacionStock } from "../../diseño.ts";
import { tAlmacen } from "../../../i18n/index.ts";

const numero = (n: number) => n.toLocaleString("es-ES");

/** Regularizaciones del stock, la más reciente primero. */
export const RegularizacionesStock = ({
    regularizaciones,
    onBorrar,
}: {
    regularizaciones: RegularizacionStock[];
    onBorrar: (regularizacion: RegularizacionStock) => void;
}) => (
    <details className="DetalleStock-regularizaciones" open={regularizaciones.length > 0}>
        <summary>{tAlmacen("stock.regularizacionesLength", { length: regularizaciones.length })}</summary>
        <table>
            <thead>
                <tr>
                    <th>{tAlmacen("stock.fecha")}</th>
                    <th>{tAlmacen("stock.hora")}</th>
                    <th>{tAlmacen("stock.inicial")}</th>
                    <th>{tAlmacen("stock.final")}</th>
                    <th>{tAlmacen("stock.motivo")}</th>
                    <th>{tAlmacen("stock.inventario")}</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {regularizaciones.map((r) => (
                    <tr key={r.id}>
                        <td>{formatearFechaString(r.fecha)}</td>
                        <td>{r.hora}</td>
                        <td>{numero(r.cantidadInicial)}</td>
                        <td>{numero(r.cantidadFinal)}</td>
                        <td>{r.motivo ?? ""}</td>
                        <td>{r.inventarioId ?? ""}</td>
                        <td>
                            <QBoton tamaño="pequeño" variante="texto" onClick={() => onBorrar(r)}>
                                {tAlmacen("stock.borrar")}
                            </QBoton>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </details>
);
