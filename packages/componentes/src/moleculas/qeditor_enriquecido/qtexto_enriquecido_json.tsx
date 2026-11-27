import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import type { JSONContent } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import "./qeditor_enriquecido.css";
import { useTComponentes } from "../../i18n/textos.ts";

const DOC_VACIO: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

const sonContenidoIgual = (
  contenidoA: JSONContent | undefined,
  contenidoB: JSONContent | undefined
) =>
  JSON.stringify(contenidoA ?? DOC_VACIO) ===
  JSON.stringify(contenidoB ?? DOC_VACIO);

export type QTextEnriquecidoJSONProps = {
  valor?: JSONContent;
  className?: string;
};

export const QTextEnriquecidoJSON = ({
  valor,
  className,
}: QTextEnriquecidoJSONProps) => {
  const t = useTComponentes();
  const clases = ["quimera-texto-enriquecido-json", className]
    .filter(Boolean)
    .join(" ");

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
        openOnClick: true,
        autolink: true,
      }),
      TextAlign.configure({
        types: ["paragraph"],
      }),
    ],
    content: valor ?? DOC_VACIO,
    editable: false,
    editorProps: {
      attributes: {
        "aria-label": t("ui.moleculas.vistaDeTextoEnriquecido"),
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const contenidoActual = editor.getJSON();
    if (sonContenidoIgual(contenidoActual, valor)) return;

    editor.commands.setContent(valor ?? DOC_VACIO, { emitUpdate: false });
  }, [editor, valor]);

  if (!editor) return null;

  return (
    <div className={clases}>
      <div className="qtexto-json-wrapper">
        <div className="qtexto-json-contenido">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};
