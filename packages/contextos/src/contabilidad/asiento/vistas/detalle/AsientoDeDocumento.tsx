import { formatearFechaDate } from "@olula/lib/dominio.ts";
import { Asiento } from "../../diseño.ts";
import { getAsiento } from "../../infraestructura.ts";
import { CabeceraAsiento } from "./CabeceraAsiento.tsx";
import { PartidasAsientoLista } from "./PartidasAsientoLista.tsx";
import "./AsientoDeDocumento.css";
import { useEffect, useState } from "react";
import { useTContabilidad } from "../../../i18n/index.ts";

/** El asiento de un documento (factura de compra o de venta, regularización
 * de IVA...). Recibe solo el id: el documento no trae el asiento. Sin
 * cabecera muestra solo la tabla de partidas, para documentos que ya enseñan
 * el número y la fecha del asiento en su formulario. Con título lo pinta
 * encima junto al número y la fecha (varios asientos en un formulario, como
 * los del cierre de un ejercicio). */
interface AsientoDeDocumentoProps {
    asientoId: string | null;
    conCabecera?: boolean;
    titulo?: string;
    /** Pestaña Contabilidad de una factura: quita de la cabecera tipo de
     * documento, documento y concepto, y las partidas van sin título y siempre
     * en tabla. */
    sinDatosDocumento?: boolean;
}

export const AsientoDeDocumento = ({
    asientoId,
    conCabecera = true,
    titulo,
    sinDatosDocumento = false,
}: AsientoDeDocumentoProps) => {
    const t = useTContabilidad();
    const [asiento, setAsiento] = useState<Asiento | null>(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!asientoId) {
            setAsiento(null);
            return;
        }
        setCargando(true);
        setError("");
        getAsiento(asientoId)
            .then(setAsiento)
            // El asiento puede haberse borrado desde contabilidad y devolver 404:
            // mejor un mensaje que una promesa rechazada sin gestionar.
            .catch(() => setError(t("asiento.noSeHaPodidoCargarEl")))
            .finally(() => setCargando(false));
    }, [asientoId, t]);

    if (!asientoId) {
        return <p>{t("asiento.estaFacturaTodaviaNoEstaContabilizada")}</p>;
    }

    if (cargando) return <p>{t("asiento.cargandoAsiento")}</p>;
    if (error) return <p>{error}</p>;
    if (!asiento) return null;

    return (
        <div className="AsientoDeDocumento">
            {titulo && (
                <h3 className="titulo-asiento">
                    {`${titulo} · Nº ${asiento.numero} · ${formatearFechaDate(asiento.fecha)}`}
                </h3>
            )}
            {conCabecera && <CabeceraAsiento asiento={asiento} sinDatosDocumento={sinDatosDocumento} />}
            <PartidasAsientoLista partidas={asiento.partidas} simple={sinDatosDocumento} />
        </div>
    );
};
