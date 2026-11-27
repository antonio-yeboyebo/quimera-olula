import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import type { JSONContent } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useMemo, useState } from "react";
import { QBoton } from "../../atomos/qboton.tsx";
import { QIcono } from "../../atomos/qicono.tsx";
import { QModal } from "../qmodal.tsx";
import "./qeditor_enriquecido.css";
import { tComponentes, useTComponentes } from "../../i18n/textos.ts";

export type { JSONContent } from "@tiptap/react";

const DOC_VACIO: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export type QEditorEnriquecidoProps = {
  valor?: JSONContent;
  className?: string;
  deshabilitado?: boolean;
  mostrarBarra?: boolean;
  marcadorPosicion?: string;
  onChange?: (valor: JSONContent, html: string) => void;
};

const sonContenidoIgual = (
  contenidoA: JSONContent | undefined,
  contenidoB: JSONContent | undefined
) =>
  JSON.stringify(contenidoA ?? DOC_VACIO) ===
  JSON.stringify(contenidoB ?? DOC_VACIO);

export const QEditorEnriquecido = ({
  valor,
  className,
  deshabilitado = false,
  mostrarBarra = true,
  marcadorPosicion = tComponentes("ui.moleculas.escribeAqui"),
  onChange,
}: QEditorEnriquecidoProps) => {
  const t = useTComponentes();
  const [modalEnlaceAbierto, setModalEnlaceAbierto] = useState(false);
  const [etiquetaEnlace, setEtiquetaEnlace] = useState("");
  const [urlEnlace, setUrlEnlace] = useState("https://");

  const clases = ["quimera-editor-enriquecido", className]
    .filter(Boolean)
    .join(" ");

  const contenidoInicial = useMemo(() => valor ?? DOC_VACIO, [valor]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      TextAlign.configure({
        types: ["paragraph"],
      }),
      Placeholder.configure({
        placeholder: marcadorPosicion,
      }),
    ],
    content: contenidoInicial,
    editable: !deshabilitado,
    editorProps: {
      attributes: {
        "aria-label": t("ui.moleculas.editorDeTextoEnriquecido"),
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor: instanciaEditor }) => {
      onChange?.(instanciaEditor.getJSON(), instanciaEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const contenidoActual = editor.getJSON();
    if (sonContenidoIgual(contenidoActual, valor)) return;

    editor.commands.setContent(valor ?? DOC_VACIO, { emitUpdate: false });
  }, [editor, valor]);

  useEffect(() => {
    if (!editor) return;

    editor.setEditable(!deshabilitado);
  }, [editor, deshabilitado]);

  if (!editor) return null;

  const abrirModalEnlace = () => {
    const { from, to } = editor.state.selection;
    const textoSeleccionado = editor.state.doc
      .textBetween(from, to, " ")
      .trim();
    const enlaceActual = editor.getAttributes("link").href as
      | string
      | undefined;

    setEtiquetaEnlace(textoSeleccionado);
    setUrlEnlace(enlaceActual || "https://");
    setModalEnlaceAbierto(true);
  };

  const aplicarEnlace = () => {
    const url = urlEnlace.trim();
    if (!url) return;

    const { from, to, empty } = editor.state.selection;
    const textoSeleccionado = editor.state.doc
      .textBetween(from, to, " ")
      .trim();
    const etiquetaFinal = (etiquetaEnlace || textoSeleccionado || url).trim();

    if (!etiquetaFinal) return;

    if (empty) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: etiquetaFinal,
          marks: [{ type: "link", attrs: { href: url } }],
        })
        .run();
    } else {
      editor.commands.insertContentAt(
        { from, to },
        {
          type: "text",
          text: etiquetaFinal,
          marks: [{ type: "link", attrs: { href: url } }],
        }
      );
      editor.commands.focus();
    }

    setModalEnlaceAbierto(false);
  };

  return (
    <div className={clases}>
      <div className="qeditor-wrapper">
        {mostrarBarra && (
          <div
            className="qeditor-toolbar"
            role="toolbar"
            aria-label={t("ui.moleculas.herramientasDeTexto")}
          >
            <button
              type="button"
              className={`qeditor-boton ${editor.isActive("bold") ? "activo" : ""}`}
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={
                deshabilitado ||
                !editor.can().chain().focus().toggleBold().run()
              }
            >
              B
            </button>
            <button
              type="button"
              className={`qeditor-boton ${editor.isActive("italic") ? "activo" : ""}`}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={
                deshabilitado ||
                !editor.can().chain().focus().toggleItalic().run()
              }
            >
              I
            </button>
            <button
              type="button"
              className={`qeditor-boton ${editor.isActive("underline") ? "activo" : ""}`}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={
                deshabilitado ||
                !editor.can().chain().focus().toggleUnderline().run()
              }
            >
              U
            </button>
            <button
              type="button"
              className={`qeditor-boton ${editor.isActive("link") ? "activo" : ""}`}
              onClick={abrirModalEnlace}
              disabled={deshabilitado}
              title={t("ui.moleculas.enlace")}
              aria-label={t("ui.moleculas.enlace")}
            >
              <QIcono nombre="enlace" tamaño="sm" />
            </button>
            <span className="qeditor-separador" aria-hidden="true" />
            <button
              type="button"
              className={`qeditor-boton ${editor.isActive({ textAlign: "left" }) ? "activo" : ""}`}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              disabled={deshabilitado}
              title={t("ui.moleculas.alinearIzquierda")}
              aria-label={t("ui.moleculas.alinearIzquierda")}
            >
              <QIcono nombre="alinear_izquierda" tamaño="sm" />
            </button>
            <button
              type="button"
              className={`qeditor-boton ${editor.isActive({ textAlign: "center" }) ? "activo" : ""}`}
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              disabled={deshabilitado}
              title={t("ui.moleculas.alinearCentro")}
              aria-label={t("ui.moleculas.alinearCentro")}
            >
              <QIcono nombre="alinear_centro" tamaño="sm" />
            </button>
            <button
              type="button"
              className={`qeditor-boton ${editor.isActive({ textAlign: "right" }) ? "activo" : ""}`}
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              disabled={deshabilitado}
              title={t("ui.moleculas.alinearDerecha")}
              aria-label={t("ui.moleculas.alinearDerecha")}
            >
              <QIcono nombre="alinear_derecha" tamaño="sm" />
            </button>
            <span className="qeditor-separador" aria-hidden="true" />
            <button
              type="button"
              className="qeditor-boton"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={
                deshabilitado || !editor.can().chain().focus().undo().run()
              }
              title={t("ui.moleculas.deshacer")}
              aria-label={t("ui.moleculas.deshacer")}
            >
              <QIcono nombre="deshacer" tamaño="sm" />
            </button>
            <button
              type="button"
              className="qeditor-boton"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={
                deshabilitado || !editor.can().chain().focus().redo().run()
              }
              title={t("ui.moleculas.rehacer")}
              aria-label={t("ui.moleculas.rehacer")}
            >
              <QIcono nombre="rehacer" tamaño="sm" />
            </button>
          </div>
        )}
        <div className="qeditor-contenido">
          <EditorContent editor={editor} />
        </div>
      </div>

      <QModal
        nombre="qeditor-enlace"
        titulo={t("ui.moleculas.insertarEnlace")}
        abierto={modalEnlaceAbierto}
        onCerrar={() => setModalEnlaceAbierto(false)}
      >
        <div className="qeditor-modal-enlace">
          <label>
            {t("ui.moleculas.etiqueta")}
            <input
              type="text"
              value={etiquetaEnlace}
              onChange={(e) => setEtiquetaEnlace(e.target.value)}
              placeholder={t("ui.moleculas.textoVisible")}
            />
          </label>
          <label>
            {t("ui.moleculas.url")}
            <input
              type="url"
              value={urlEnlace}
              onChange={(e) => setUrlEnlace(e.target.value)}
              placeholder="https://"
            />
          </label>
          <div className="qeditor-modal-enlace-acciones">
            <QBoton
              variante="borde"
              onClick={() => setModalEnlaceAbierto(false)}
            >
              {t("ui.moleculas.cancelar")}
            </QBoton>
            <QBoton onClick={aplicarEnlace}>{t("ui.moleculas.guardarEnlace")}</QBoton>
          </div>
        </div>
      </QModal>
    </div>
  );
};
