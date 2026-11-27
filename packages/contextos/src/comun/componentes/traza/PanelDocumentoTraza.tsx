import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { NodoTraza } from "./diseño.ts";
import { etiquetaNodo, nombreTipo, resumenDocumento } from "./dominio.ts";
import { tComun } from "../../i18n/index.ts";

export const PanelDocumentoTraza = ({
  nodo,
  esRaiz,
  url,
  onVer,
}: {
  nodo: NodoTraza;
  esRaiz: boolean;
  url: string | null;
  onVer: (url: string) => void;
}) => {
  const { datos } = nodo;
  const resumen = resumenDocumento(datos);
  const destino = !esRaiz && datos.visible ? url : null;

  return (
    <section className="traza-panel" aria-live="polite">
      <header>
        <span className="traza-panel-tipo">{nombreTipo(datos.tipo)}</span>
        <strong className="traza-panel-codigo">{etiquetaNodo(datos)}</strong>
      </header>

      {datos.visible ? (
        <dl>
          {resumen.map(({ etiqueta, valor }) => (
            <div key={etiqueta}>
              <dt>{etiqueta}</dt>
              <dd>{valor}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="traza-panel-aviso">{tComun("componentes.noTienesAccesoALosDatos")}</p>
      )}

      <div className="botones">
        <QBoton
          variante="borde"
          deshabilitado={!destino}
          props={{ disabled: !destino }}
          onClick={() => destino && onVer(destino)}
        >
          {esRaiz ? tComun("componentes.documentoActual") : tComun("componentes.verDocumento")}
        </QBoton>
      </div>
    </section>
  );
};
