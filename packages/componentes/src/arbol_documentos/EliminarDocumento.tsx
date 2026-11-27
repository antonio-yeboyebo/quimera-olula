import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import {
  DocumentosAPI,
  esCarpetaArbol,
  NodoArbol,
} from "@olula/lib/api/documentos.ts";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useCallback } from "react";
import { tComponentes, useTComponentes } from "../i18n/textos.ts";

/**
 * Modal de confirmación de borrado de un nodo del árbol documental.
 *
 * Sirve para documentos y para carpetas. Borrar una carpeta se lleva todo lo
 * que contiene, así que el mensaje lo advierte: es una acción irreversible y
 * desde el árbol no se ve cuánto cuelga de una carpeta cerrada.
 *
 * Patrón:
 *   - El padre lo renderiza condicionalmente cuando estado === "eliminando_documento".
 *   - Llama a DocumentosAPI.eliminar internamente y emite:
 *       "documento_eliminado"              sin payload (éxito, recarga el árbol)
 *       "eliminacion_documento_cancelada"  sin payload (cancelar)
 *   - No recibe prop `activo`; la visibilidad la controla el padre.
 */
export interface EliminarDocumentoProps {
  nodo: NodoArbol;
  publicar: EmitirEvento;
}

const mensajeDe = (nodo: NodoArbol): string => {
  if (!esCarpetaArbol(nodo)) {
    return tComponentes("ui.arbolDocumentos.estaSeguroDeQueDeseaEliminar", { nombre: nodo.nombre });
  }

  const vacia = nodo.contenido.length === 0;

  return vacia
    ? tComponentes("ui.arbolDocumentos.estaSeguroDeQueDeseaEliminar2", { nombre: nodo.nombre })
    : tComponentes("ui.arbolDocumentos.estaSeguroDeQueDeseaEliminar3", { nombre: nodo.nombre });
};

export const EliminarDocumento = ({
  nodo,
  publicar,
}: EliminarDocumentoProps) => {
  const t = useTComponentes();
  const esCarpeta = esCarpetaArbol(nodo);

  const eliminar = useCallback(async () => {
    await DocumentosAPI.eliminar(nodo.id);
    publicar("documento_eliminado");
  }, [nodo, publicar]);

  const cancelar = useCallback(
    () => publicar("eliminacion_documento_cancelada"),
    [publicar]
  );

  return (
    <QModalConfirmacion
      nombre="eliminarDocumento"
      abierto={true}
      titulo={esCarpeta ? t("ui.arbolDocumentos.eliminarCarpeta") : t("ui.arbolDocumentos.eliminarDocumento")}
      mensaje={mensajeDe(nodo)}
      onCerrar={cancelar}
      onAceptar={eliminar}
      labelAceptar={t("ui.arbolDocumentos.eliminar")}
    />
  );
};
