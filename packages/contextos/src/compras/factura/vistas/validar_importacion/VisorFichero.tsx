import { FicheroOriginal } from "./diseño.ts";

/** El fichero original de la factura, a la derecha de la validación. */
export const VisorFichero = ({
    fichero,
    cargando = false,
}: {
    fichero: FicheroOriginal | null;
    cargando?: boolean;
}) => (
    <div className="VisorFichero">
        {cargando ? (
            <div className="visor-mensaje">Cargando fichero…</div>
        ) : !fichero ? (
            <div className="visor-mensaje">Fichero original no disponible</div>
        ) : fichero.tipo === "imagen" ? (
            <img src={fichero.url} alt="Factura original" />
        ) : (
            <iframe src={fichero.url} title="Factura original" />
        )}
    </div>
);
