import { formatearFechaString } from "@olula/lib/dominio.ts";
import { formatearImporte, ResumenImportacion as Resumen } from "./dominio.ts";

/** Resumen de la factura que se va a crear, en la confirmación final. */
export const ResumenImportacion = ({ resumen }: { resumen: Resumen }) => (
    <div className="ResumenImportacion">
        <dl>
            <dt>Proveedor</dt>
            <dd>{resumen.proveedor || "—"}</dd>
            <dt>Nº factura</dt>
            <dd>{resumen.numeroProveedor || "—"}</dd>
            <dt>Fecha</dt>
            <dd>{resumen.fecha ? formatearFechaString(resumen.fecha) : "—"}</dd>
            <dt>Total</dt>
            <dd className={resumen.estadoTotal ? `total-${resumen.estadoTotal}` : ""}>
                {formatearImporte(resumen.totalCalculado)}
                {resumen.estadoTotal === "ok" && " ✓"}
                {resumen.estadoTotal === "error" &&
                    ` ✗ (leído ${formatearImporte(resumen.totalLeido)})`}
                {resumen.diferenciaAceptada && " · diferencia aceptada"}
            </dd>
            <dt>Líneas</dt>
            <dd>{resumen.numLineas}</dd>
            <dt>Albaranes</dt>
            <dd>{resumen.albaranes.length > 0 ? resumen.albaranes.join(", ") : "Ninguno"}</dd>
        </dl>
        {resumen.avisos.length > 0 && (
            <ul className="avisos-resumen">
                {resumen.avisos.map((a) => (
                    <li key={a}>⚠ {a}</li>
                ))}
            </ul>
        )}
    </div>
);
