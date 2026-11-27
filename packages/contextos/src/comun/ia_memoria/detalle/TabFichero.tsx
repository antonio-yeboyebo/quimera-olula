import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { ArrastraSuelta } from "@olula/componentes/gestor_documentos/ArrastraSuelta.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { formatearFechaDate } from "@olula/lib/dominio.js";
import { useCallback, useState } from "react";
import { leerComoBase64 } from "../crear/crear.js";
import { IaMemoria } from "../diseño.js";
import { obtenerUrlDescargaFicheroIaMemoria, patchIaMemoriaDesdeFichero } from "../infraestructura.js";
import "./TabFichero.css";
import { useTComun } from "../../i18n/index.ts";

interface TabFicheroProps {
    iaMemoria: IaMemoria;
    onReemplazado: () => void;
}

/**
 * Tab de una memoria con origen "fichero" o "externo": el texto extraído se
 * muestra de solo lectura (editarlo a mano lo desincronizaría de la fuente
 * sin indicarlo en ningún sitio).
 *   - "fichero": para corregirlo hay que reemplazar el fichero subido, que
 *     re-extrae el texto y dispara un nuevo reindexado en el backend.
 *   - "externo": el contenido lo mantiene sincronizado el job periódico del
 *     conector (ver comandos/comun/ia_memoria/aplicacion/sincronizar_externo)
 *     — no hay ni descarga ni reemplazo manual, solo se informa del origen.
 */
export const TabFichero = ({ iaMemoria, onReemplazado }: TabFicheroProps) => {
    const t = useTComun();
    const [reemplazando, setReemplazando] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [descargando, setDescargando] = useState(false);

    const esExterno = iaMemoria.origen === "externo";

    const descargarOriginal = useCallback(
        async () => {
            setDescargando(true);
            try {
                const url = await obtenerUrlDescargaFicheroIaMemoria(iaMemoria.id);
                window.open(url, "_blank", "noopener,noreferrer");
            } finally {
                setDescargando(false);
            }
        },
        [iaMemoria.id]
    );

    const manejarArchivoSeleccionado: EmitirEvento = useCallback(
        async (evento, payload) => {
            if (evento !== "archivos_seleccionados") return;
            const [archivo] = payload as File[];
            if (!archivo) return;
            setCargando(true);
            try {
                const contenidoBase64 = await leerComoBase64(archivo);
                await patchIaMemoriaDesdeFichero(iaMemoria.id, {
                    nombreFichero: archivo.name,
                    tipoMime: archivo.type || "application/octet-stream",
                    contenidoBase64,
                });
                setReemplazando(false);
                onReemplazado();
            } finally {
                setCargando(false);
            }
        },
        [iaMemoria.id, onReemplazado]
    );

    return (
        <div className="TabFichero">
            <dl>
                {esExterno ? (
                    <>
                        <dt>{t("iaMemoria.sincronizadoDesde")}</dt>
                        <dd>
                            {iaMemoria.proveedorExterno || "-"}
                            {iaMemoria.externoModificadoEn
                                ? t("iaMemoria.ultimaSincronizacionExternomodificadoen", { externoModificadoEn: formatearFechaDate(iaMemoria.externoModificadoEn) })
                                : ""}
                        </dd>
                    </>
                ) : (
                    <>
                        <dt>{t("iaMemoria.fichero")}</dt>
                        <dd>{iaMemoria.nombreFichero || "-"}</dd>
                    </>
                )}
            </dl>

            {!esExterno && (
                <div className="TabFichero-acciones">
                    <QBoton
                        variante="borde"
                        onClick={descargarOriginal}
                        deshabilitado={descargando}
                    >
                        {t("iaMemoria.descargarOriginal")}
                    </QBoton>
                    <QBoton
                        variante="borde"
                        onClick={() => setReemplazando(true)}
                        deshabilitado={cargando || reemplazando}
                    >
                        {t("iaMemoria.reemplazarFichero")}
                    </QBoton>
                </div>
            )}

            {reemplazando && (
                <div className="TabFichero-reemplazo">
                    <ArrastraSuelta emitir={manejarArchivoSeleccionado} />
                    <QBoton variante="texto" onClick={() => setReemplazando(false)} deshabilitado={cargando}>
                        {t("iaMemoria.cancelar")}
                    </QBoton>
                </div>
            )}

            <quimera-formulario>
                <QTextArea label={t("iaMemoria.contenidoExtraido")} nombre="contenido" rows={12} valor={iaMemoria.contenido} soloLectura />
            </quimera-formulario>
        </div>
    );
};
