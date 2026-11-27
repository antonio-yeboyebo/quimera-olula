import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import {
  descargarDocumento,
  DocumentoGenerico,
  DocumentosAPI,
  filtroVinculoDocumentos,
} from "@olula/lib/api/documentos.ts";
import { useEffect, useMemo, useState } from "react";
import { QListaDocumentosProps } from "./diseño.ts";
import "./QListaDocumentos.css";
import { useTComponentes } from "../i18n/textos.ts";

export const QListaDocumentos = ({
  vinculoTipo,
  vinculoId,
  paginacion = { limite: 50, pagina: 1 },
  refreshCounter,
  onError,
}: QListaDocumentosProps) => {
  const t = useTComponentes();
  const [documentos, setDocumentos] = useState<DocumentoGenerico[]>([]);
  const [cargando, setCargando] = useState(false);
  const [ordenActual, setOrdenActual] = useState<[string, "ASC" | "DESC"]>([
    "fechaSubida",
    "DESC",
  ]);
  const [documentoAEliminar, setDocumentoAEliminar] =
    useState<DocumentoGenerico | null>(null);
  // Contador interno de recargas: se incrementa tras borrar para refrescar la lista
  // sin depender de que el padre cambie `refreshCounter`.
  const [recargas, setRecargas] = useState(0);

  // Memoizar paginación para evitar cambios innecesarios: se compara por limite/pagina
  // en vez de por la identidad del objeto `paginacion`, que puede cambiar en cada render
  // del padre aunque su contenido sea el mismo.
  const paginacionMemoizada = useMemo(
    () => ({ ...paginacion }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginacion.limite, paginacion.pagina]
  );

  useEffect(() => {
    const cargarDocumentos = async () => {
      try {
        setCargando(true);
        const filtro = filtroVinculoDocumentos(vinculoTipo, vinculoId);
        const resultado = await DocumentosAPI.obtener(
          filtro,
          [],
          paginacionMemoizada
        );
        setDocumentos(resultado.datos);
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error(t("ui.listaDocumentos.errorDesconocido"));
        onError?.(err);
        console.error("Error cargando documentos:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarDocumentos();
    // onError se excluye a propósito: es un callback del padre que no se memoiza,
    // y no debe disparar una recarga en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vinculoId, paginacionMemoizada, vinculoTipo, refreshCounter, recargas]);

  const handleOrdenar = (columna: string) => {
    if (ordenActual[0] === columna) {
      setOrdenActual([columna, ordenActual[1] === "ASC" ? "DESC" : "ASC"]);
    } else {
      setOrdenActual([columna, "ASC"]);
    }
  };

  const handleDescargar = async (doc: DocumentoGenerico) => {
    try {
      const blob = await DocumentosAPI.descargar(doc.id);
      await descargarDocumento(blob, doc.nombre);
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error(t("ui.listaDocumentos.errorDescargandoDocumento"));
      onError?.(err);
      console.error("Error descargando documento:", err);
    }
  };

  const handleEliminar = async () => {
    if (!documentoAEliminar) return;
    try {
      await DocumentosAPI.eliminar(documentoAEliminar.id);
      setDocumentoAEliminar(null);
      setRecargas((n) => n + 1);
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error(t("ui.listaDocumentos.errorBorrandoDocumento"));
      onError?.(err);
      console.error("Error borrando documento:", err);
      throw err;
    }
  };

  const documentosOrdenados = [...documentos].sort((a, b) => {
    const [columna, direccion] = ordenActual;
    const valorA = String(a[columna as keyof DocumentoGenerico] ?? "");
    const valorB = String(b[columna as keyof DocumentoGenerico] ?? "");

    if (valorA < valorB) return direccion === "ASC" ? -1 : 1;
    if (valorA > valorB) return direccion === "ASC" ? 1 : -1;
    return 0;
  });

  const metaTabla: MetaTabla<DocumentoGenerico> = [
    {
      id: "nombre",
      cabecera: t("ui.listaDocumentos.nombre"),
      prioridad: "alta",
      esTitulo: true,
      ancho: "40%",
    },
    {
      id: "fechaSubida",
      cabecera: t("ui.listaDocumentos.fecha"),
      tipo: "fecha",
      prioridad: "media",
      ancho: "15%",
    },
    {
      id: "horaSubida",
      cabecera: t("ui.listaDocumentos.hora"),
      tipo: "hora",
      prioridad: "media",
      ancho: "15%",
    },
    {
      id: "id",
      cabecera: t("ui.listaDocumentos.acciones"),
      prioridad: "alta",
      ancho: "15%",
      render: (doc) => (
        <div className="QListaDocumentos-acciones">
          <QBoton tamaño="pequeño" onClick={() => handleDescargar(doc)}>
            {t("ui.listaDocumentos.descargar")}
          </QBoton>
          <QBoton
            tamaño="pequeño"
            // variante="texto"
            destructivo
            onClick={() => setDocumentoAEliminar(doc)}
          >
            {t("ui.listaDocumentos.eliminar")}
          </QBoton>
        </div>
      ),
    },
  ];

  const modalEliminar = documentoAEliminar && (
    <QModalConfirmacion
      nombre="eliminarDocumento"
      abierto={true}
      titulo={t("ui.listaDocumentos.eliminarDocumento")}
      mensaje={t("ui.listaDocumentos.estaSeguroDeQueDeseaEliminar", { nombre: documentoAEliminar.nombre })}
      onCerrar={() => setDocumentoAEliminar(null)}
      onAceptar={handleEliminar}
      labelAceptar={t("ui.listaDocumentos.eliminar")}
    />
  );

  if (documentos.length === 0 && !cargando) {
    return (
      <div className="QListaDocumentos">
        <p className="QListaDocumentos-sin-datos">{t("ui.listaDocumentos.noHayDocumentosAdjuntos")}</p>
        {modalEliminar}
      </div>
    );
  }

  // console.log("mimensaje_documentos", documentos);

  return (
    <div className="QListaDocumentos">
      <QTabla
        metaTabla={metaTabla}
        datos={documentosOrdenados}
        cargando={cargando}
        orden={ordenActual}
        onOrdenar={handleOrdenar}
      />
      {modalEliminar}
    </div>
  );
};
