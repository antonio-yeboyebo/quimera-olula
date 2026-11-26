import { formatearFechaString } from "@olula/lib/dominio.ts";
import { formatearImporte, ResumenImportacion as Resumen } from "./dominio.ts";
import { useTCompras } from "#/compras/i18n/index.ts";

/** Resumen de la factura que se va a crear, en la confirmación final. */
export const ResumenImportacion = ({ resumen }: { resumen: Resumen }) => {
    const t = useTCompras();
    return (
    <div className="ResumenImportacion">
        <dl>
            <dt>{t("comun.campos.proveedor")}</dt>
            <dd>{resumen.proveedor || "—"}</dd>
            <dt>{t("factura.importacion.resumen.numeroFactura")}</dt>
            <dd>{resumen.numeroProveedor || "—"}</dd>
            <dt>{t("comun.campos.fecha")}</dt>
            <dd>{resumen.fecha ? formatearFechaString(resumen.fecha) : "—"}</dd>
            <dt>{t("comun.campos.total")}</dt>
            <dd className={resumen.estadoTotal ? `total-${resumen.estadoTotal}` : ""}>
                {formatearImporte(resumen.totalCalculado)}
                {resumen.estadoTotal === "ok" && " ✓"}
                {resumen.estadoTotal === "error" &&
                    t("factura.importacion.resumen.leido", { importe: formatearImporte(resumen.totalLeido) })}
                {resumen.diferenciaAceptada && t("factura.importacion.resumen.diferenciaAceptada")}
            </dd>
            <dt>{t("comun.documento.pestanas.lineas")}</dt>
            <dd>{resumen.numLineas}</dd>
            <dt>{t("proveedor.documentos.albaranes")}</dt>
            <dd>{resumen.albaranes.length > 0 ? resumen.albaranes.join(", ") : t("factura.importacion.resumen.ninguno")}</dd>
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
};
