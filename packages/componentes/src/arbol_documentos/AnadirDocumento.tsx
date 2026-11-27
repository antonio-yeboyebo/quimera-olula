import { QGestorDocumentos, QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useCallback } from "react";
import "./AnadirDocumento.css";
import { useTComponentes } from "../i18n/textos.ts";

/**
 * Modal de alta de documentos dentro del árbol documental.
 *
 * Patrón:
 *   - El padre lo renderiza condicionalmente cuando estado === "anadiendo_documento".
 *   - Envuelve QGestorDocumentos y emite:
 *       "documento_anadido"           al terminar la subida (recarga el árbol y cierra el modal)
 *       "adicion_documento_cancelada" al cancelar la subida o cerrar el modal (sin recargar)
 *   - No recibe prop `activo`; la visibilidad la controla el padre.
 *   - `archivosIniciales`: cuando el padre ya tiene archivos elegidos por el selector nativo
 *     en móvil (ver useSeleccionArchivosMovil), se pasan aquí para que QGestorDocumentos
 *     arranque subiéndolos directamente, sin mostrar la zona de arrastrar y soltar.
 */
export interface AnadirDocumentoProps {
  vinculoTipo: string;
  vinculoId: string;
  archivosIniciales?: File[];
  tamanioMaximoBytes?: number;
  publicar: EmitirEvento;
}

export const AnadirDocumento = ({
  vinculoTipo,
  vinculoId,
  archivosIniciales,
  tamanioMaximoBytes,
  publicar,
}: AnadirDocumentoProps) => {
  const t = useTComponentes();
  const handleDocumentoSubido = useCallback(() => {
    publicar("documento_anadido");
  }, [publicar]);

  const cancelar = useCallback(
    () => publicar("adicion_documento_cancelada"),
    [publicar]
  );

  return (
    <QModal
      abierto={true}
      nombre="mostrar"
      titulo={t("ui.arbolDocumentos.anadirDocumento")}
      onCerrar={cancelar}
    >
      <div className={"AnadirDocumento"}>
        <QGestorDocumentos
          vinculoTipo={vinculoTipo}
          vinculoId={vinculoId}
          tipoDocumento={t("ui.arbolDocumentos.documento")}
          archivosIniciales={archivosIniciales}
          tamanioMaximoBytes={tamanioMaximoBytes}
          onDocumentoSubido={handleDocumentoSubido}
          onCancelar={cancelar}
        />
      </div>
    </QModal>
  );
};
