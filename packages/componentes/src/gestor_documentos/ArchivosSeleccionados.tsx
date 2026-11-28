import { QBoton, QIcono } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback } from "react";
import { superaTamanioMaximo } from "./dominio.ts";
import "./ArchivosSeleccionados.css";
import { useTComponentes } from "../i18n/textos.ts";

const formatearTamaño = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const tamaños = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + tamaños[i];
};

export const ArchivosSeleccionados = ({
  archivos,
  tamanioMaximoBytes,
  emitir,
}: {
  archivos: File[];
  tamanioMaximoBytes?: number;
  emitir: EmitirEvento;
}) => {
  const t = useTComponentes();
  const archivosValidos = archivos.filter(
    (archivo) => !superaTamanioMaximo(archivo, tamanioMaximoBytes)
  );

  const handleGuardar = useCallback(() => {
    emitir("subir_archivos_solicitado", archivosValidos);
  }, [archivosValidos, emitir]);

  const handleCancelar = useCallback(() => {
    emitir("subida_cancelada");
  }, [emitir]);

  const handleEliminar = useCallback(
    (index: number) => {
      emitir("archivo_eliminado", index);
    },
    [emitir]
  );

  return (
    <div className="ArchivosSeleccionados">
      <div className="ArchivosSeleccionados-titulo">
        <h3 aria-live="polite">
          {tamanioMaximoBytes !== undefined
            ? t("ui.gestorDocumentos.seSubiranLengthDeLength2Archivos", { length: archivosValidos.length, length2: archivos.length })
            : t("ui.gestorDocumentos.archivosSeleccionadosLength", { length: archivos.length })}
        </h3>
      </div>

      <div className="ArchivosSeleccionados-lista">
        {archivos.map((archivo, index) => {
          const excedeLimite = superaTamanioMaximo(archivo, tamanioMaximoBytes);

          return (
            <div
              key={index}
              className={`ArchivosSeleccionados-item${excedeLimite ? " ArchivosSeleccionados-item--excede" : ""}`}
            >
              <div className="ArchivosSeleccionados-info">
                <div className="ArchivosSeleccionados-icono">
                  <QIcono
                    nombre={excedeLimite ? "x_circle" : "fichero"}
                    tamaño="sm"
                  />
                </div>
                <div className="ArchivosSeleccionados-detalles">
                  <p className="ArchivosSeleccionados-nombre">
                    {archivo.name}
                  </p>
                  {excedeLimite ? (
                    <p className="ArchivosSeleccionados-aviso">
                      {t("ui.gestorDocumentos.excedeElLimiteMaxValorNo", { valor: formatearTamaño(tamanioMaximoBytes as number) })}
                    </p>
                  ) : (
                    <p className="ArchivosSeleccionados-tamaño">
                      {formatearTamaño(archivo.size)}
                    </p>
                  )}
                </div>
              </div>
              <QBoton
                tamaño="pequeño"
                variante="texto"
                destructivo
                props={{ "aria-label": t("ui.gestorDocumentos.eliminarName", { name: archivo.name }) }}
                onClick={() => handleEliminar(index)}
              >
                <QIcono nombre="eliminar" tamaño="md" />
              </QBoton>
            </div>
          );
        })}
      </div>

      <div className="ArchivosSeleccionados-botones">
        <QBoton onClick={handleCancelar}>{t("ui.gestorDocumentos.cancelar")}</QBoton>
        <QBoton
          onClick={handleGuardar}
          deshabilitado={archivosValidos.length === 0}
        >
          {t("ui.gestorDocumentos.guardar")}
        </QBoton>
      </div>
    </div>
  );
};
