import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { DocumentosAPI } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.js";
import { useCallback, useContext, useEffect, useRef } from "react";
import { ArchivosSeleccionados } from "./ArchivosSeleccionados.tsx";
import { ArrastraSuelta } from "./ArrastraSuelta.tsx";
import {
  ConfiguracionGestorDocumentos,
  EstadoGestorDocumentos,
} from "./diseño.ts";
import { superaTamanioMaximo } from "./dominio.ts";
import { getMaquinaGestorDocumentos } from "./maquina.ts";
import "./QGestorDocumentos.css";
import { tComponentes, useTComponentes } from "../i18n/textos.ts";

export interface QGestorDocumentosProps {
  vinculoTipo: string;
  vinculoId: string;
  tipoDocumento?: string;
  tamanioMaximoBytes?: number;
  archivosIniciales?: File[];
  onDocumentoSubido?: () => void;
  onCancelar?: () => void;
  onError?: (error: Error) => void;
}

export const QGestorDocumentos = ({
  vinculoTipo,
  vinculoId,
  tipoDocumento = tComponentes("ui.gestorDocumentos.documento"),
  tamanioMaximoBytes,
  archivosIniciales,
  onDocumentoSubido,
  onCancelar,
  onError,
}: QGestorDocumentosProps) => {
  // Memoizar callbacks para evitar cambios referenciales innecesarios
  const t = useTComponentes();
  const handleDocumentoSubido = useCallback(
    () => onDocumentoSubido?.(),
    [onDocumentoSubido]
  );
  const handleCancelar = useCallback(() => onCancelar?.(), [onCancelar]);
  const handleError = useCallback(
    (error: Error) => onError?.(error),
    [onError]
  );

  const configuracion: ConfiguracionGestorDocumentos = {
    vinculoTipo,
    vinculoId,
    tipoDocumento,
    tamanioMaximoBytes,
  };

  // Con archivos preseleccionados (selector nativo en móvil) se arranca directamente en
  // "subiendo": no tiene sentido pedir confirmación de algo que el usuario ya eligió en
  // el selector del sistema. El efecto de subida más abajo ya hace el resto (sube y cierra).
  const estadoInicial: EstadoGestorDocumentos =
    archivosIniciales && archivosIniciales.length > 0 ? "subiendo" : "lista";

  const { ctx, emitir } = useMaquina(getMaquinaGestorDocumentos, {
    estado: estadoInicial,
    documentos: [],
    cargando: false,
    configuracion,
    archivosSeleccionados: archivosIniciales ?? [],
  });
  const { intentar } = useContext(ContextoError);
  const estadoAnteriorRef = useRef(ctx.estado);

  useEffect(() => {
    // Si ya venimos con archivos preseleccionados (p.ej. selector nativo en móvil),
    // no recargar: "cargar_documentos" solo existe en el estado "lista" y además
    // vaciaría archivosSeleccionados.
    if (!archivosIniciales || archivosIniciales.length === 0) {
      emitir("cargar_documentos");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vinculoId]);

  useEffect(() => {
    // Solo el botón "Cancelar" de la selección de archivos produce esta transición
    if (
      estadoAnteriorRef.current === "archivos-seleccionados" &&
      ctx.estado === "lista"
    ) {
      handleCancelar();
    }
    estadoAnteriorRef.current = ctx.estado;
  }, [ctx.estado, handleCancelar]);

  useEffect(() => {
    if (ctx.estado === "subiendo" && ctx.archivosSeleccionados.length > 0) {
      (async () => {
        try {
          await intentar(async () => {
            // Normalizar vinculoTipo para guardar sin sufijo _id
            const vinculoTipoNormalizado = vinculoTipo.endsWith("_id")
              ? vinculoTipo.slice(0, -3)
              : vinculoTipo;

            let subidoAlguno = false;

            for (const file of ctx.archivosSeleccionados) {
              if (superaTamanioMaximo(file, tamanioMaximoBytes)) continue;

              const formData = new FormData();
              formData.append("nombre", file.name);
              formData.append("tipo_documento", tipoDocumento);
              formData.append("nombre_fichero", file.name);
              formData.append("fichero", file);
              formData.append("vinculo_tipo", vinculoTipoNormalizado);
              formData.append("vinculo_id", vinculoId);

              await DocumentosAPI.crear(formData);
              subidoAlguno = true;
            }

            if (!subidoAlguno) {
              throw new Error(
                t("ui.gestorDocumentos.ningunArchivoSeHaSubidoTodos")
              );
            }
          });
          emitir("documentos_subidos");
          handleDocumentoSubido();
        } catch (error) {
          handleError(
            error instanceof Error ? error : new Error(t("ui.gestorDocumentos.errorDesconocido"))
          );
          emitir("subida_cancelada");
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.estado, ctx.archivosSeleccionados]);

  return (
    <div className="QGestorDocumentos">
      {(ctx.estado === "lista" || ctx.estado === "archivos-seleccionados") && (
        <ArrastraSuelta emitir={emitir} />
      )}
      {ctx.estado === "archivos-seleccionados" &&
        ctx.archivosSeleccionados.length > 0 && (
          <ArchivosSeleccionados
            archivos={ctx.archivosSeleccionados}
            tamanioMaximoBytes={tamanioMaximoBytes}
            emitir={emitir}
          />
        )}
      {ctx.estado === "subiendo" && (
        <div className="QGestorDocumentos-subiendo">
          <p>{t("ui.gestorDocumentos.subiendoArchivos")}</p>
        </div>
      )}
    </div>
  );
};
