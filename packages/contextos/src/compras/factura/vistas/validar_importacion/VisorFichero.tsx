import { FicheroOriginal } from "./diseño.ts";
import { useTCompras } from "#/compras/i18n/index.ts";

/** El fichero original de la factura, a la derecha de la validación. */
export const VisorFichero = ({
    fichero,
    cargando = false,
}: {
    fichero: FicheroOriginal | null;
    cargando?: boolean;
}) => {
    const t = useTCompras();
    return (
    <div className="VisorFichero">
        {cargando ? (
            <div className="visor-mensaje">{t("factura.importacion.visor.cargando")}</div>
        ) : !fichero ? (
            <div className="visor-mensaje">{t("factura.importacion.visor.noDisponible")}</div>
        ) : fichero.tipo === "imagen" ? (
            <img src={fichero.url} alt={t("factura.importacion.visor.facturaOriginal")} />
        ) : (
            <iframe src={fichero.url} title={t("factura.importacion.visor.facturaOriginal")} />
        )}
    </div>
    );
};
