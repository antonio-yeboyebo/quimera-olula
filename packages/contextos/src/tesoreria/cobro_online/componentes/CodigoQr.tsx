import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { tTesoreria } from "../../i18n/index.ts";

/** Código QR de una URL, como imagen. Margen y corrección de errores pensados
 * para leerse con el móvil desde una pantalla. */
export const CodigoQr = ({ url, tamaño = 280, texto = tTesoreria("cobro_online.codigoQrDePago") }: {
    url: string;
    tamaño?: number;
    texto?: string;
}) => {
    const [imagen, setImagen] = useState<string | null>(null);

    useEffect(() => {
        let vigente = true;
        QRCode.toDataURL(url, { errorCorrectionLevel: "M", margin: 2, width: tamaño })
            .then((datos) => vigente && setImagen(datos))
            .catch(() => vigente && setImagen(null));
        return () => {
            vigente = false;
        };
    }, [url, tamaño]);

    if (!imagen) return null;
    return <img src={imagen} width={tamaño} height={tamaño} alt={texto} style={{ imageRendering: "pixelated" }} />;
};
