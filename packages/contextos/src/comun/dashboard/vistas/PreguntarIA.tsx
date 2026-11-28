import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { useState } from "react";
import { ComponenteDashboard, PropuestaComponente } from "../diseño.ts";
import {
  ALTO_FILA_DASHBOARD,
  alternativasTipo,
  cambiarTipo,
  componenteDesdePropuesta,
  definicionTipo,
} from "../dominio.ts";
import { proponerComponente } from "../infraestructura.ts";
import { Componente } from "./componentes/Componente.tsx";
import "./ConfigurarComponente.css";
import { tComun, useTComun } from "../../i18n/index.ts";

const ejemplos = () => [
  tComun("dashboard.ventasDeEsteAnoPorProvincia"),
  tComun("dashboard.los5ClientesQueMasNos"),
  tComun("dashboard.facturacionMensualDeLosUltimos12"),
  tComun("dashboard.recibosPendientesDeCobroMasAntiguos"),
];

/**
 * Crear un componente describiéndolo: la IA propone la consulta y el tipo, se ve con
 * datos reales y se puede cambiar de tipo o retocar a mano antes de añadirlo. Se guarda
 * la consulta (no el resultado): se recalcula con los permisos de quien lo mire.
 */
export const PreguntarIA = ({
  componente,
  onGuardar,
  onAjustar,
  onCancelar,
}: {
  componente: ComponenteDashboard;
  onGuardar: (componente: ComponenteDashboard) => void;
  onAjustar: (componente: ComponenteDashboard) => void;
  onCancelar: () => void;
}) => {
  const t = useTComun();
  const [pregunta, setPregunta] = useState("");
  const [preguntando, setPreguntando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [propuesta, setPropuesta] = useState<PropuestaComponente | null>(null);
  const [resultado, setResultado] = useState<ComponenteDashboard | null>(null);

  const preguntar = async (texto = pregunta) => {
    if (!texto.trim() || preguntando) return;
    setPregunta(texto);
    setPreguntando(true);
    setError(null);
    try {
      const nueva = await proponerComponente(texto);
      setPropuesta(nueva);
      setResultado(componenteDesdePropuesta(componente, nueva, texto));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("dashboard.noSeHaPodidoPreguntarA2"));
    } finally {
      setPreguntando(false);
    }
  };

  return (
    <QModal
      nombre="preguntar-ia"
      titulo={t("dashboard.crearComponentePreguntando")}
      abierto={true}
      onCerrar={onCancelar}
      anchoEstable
    >
      <div className="configurar-componente">
        <div className="configurar-componente-formulario">
          <form
            className="preguntar-ia-pregunta"
            onSubmit={(evento) => {
              evento.preventDefault();
              preguntar();
            }}
          >
            <QInput
              label={t("dashboard.queQuieresVer")}
              nombre="pregunta_ia"
              valor={pregunta}
              maxLength={500}
              autoFocus
              onChange={setPregunta}
            />
            <QBoton tipo="submit" deshabilitado={!pregunta.trim() || preguntando}>
              {preguntando ? t("dashboard.preguntando") : t("dashboard.preguntar")}
            </QBoton>
          </form>

          {!propuesta && !preguntando && (
            <div className="preguntar-ia-ejemplos">
              <span>{t("dashboard.porEjemplo")}</span>
              {ejemplos().map((ejemplo) => (
                <QBoton
                  key={ejemplo}
                  variante="borde"
                  tamaño="pequeño"
                  onClick={() => preguntar(ejemplo)}
                >
                  {ejemplo}
                </QBoton>
              ))}
            </div>
          )}

          {error && (
            <p className="preguntar-ia-error" role="alert">
              {error}
            </p>
          )}

          {propuesta && resultado && (
            <>
              <div className="preguntar-ia-entendido">
                <span className="configurar-componente-etiqueta">{t("dashboard.loHeEntendidoAsi")}</span>
                <p>{propuesta.explicacion}</p>
              </div>
              {alternativasTipo(resultado.consultas[0]).length > 1 && (
                <fieldset className="preguntar-ia-tipos">
                  <legend>{t("dashboard.mostrarComo")}</legend>
                  {alternativasTipo(resultado.consultas[0]).map((tipo) => (
                    <QBoton
                      key={tipo}
                      variante={resultado.tipo === tipo ? "solido" : "borde"}
                      tamaño="pequeño"
                      onClick={() => setResultado(cambiarTipo(resultado, tipo))}
                    >
                      {definicionTipo(tipo).nombre}
                    </QBoton>
                  ))}
                </fieldset>
              )}
            </>
          )}
        </div>

        <div className="configurar-componente-vista-previa" aria-label={t("dashboard.vistaPrevia")}>
          <span className="configurar-componente-etiqueta">{t("dashboard.vistaPreviaConDatosReales")}</span>
          <div
            className="configurar-componente-marco"
            style={{ height: `${Math.min(resultado?.h ?? 8, 10) * ALTO_FILA_DASHBOARD}px` }}
          >
            {resultado ? (
              <Componente componente={resultado} />
            ) : (
              <p className="preguntar-ia-vacio">
                {preguntando ? t("dashboard.pensandoLaConsulta") : t("dashboard.aquiVerasElResultado")}
              </p>
            )}
          </div>
        </div>
      </div>

      <footer className="configurar-componente-pie">
        <QBoton variante="borde" onClick={onCancelar}>
          {t("dashboard.cancelar")}
        </QBoton>
        {resultado && (
          <QBoton variante="borde" onClick={() => onAjustar(resultado)}>
            {t("dashboard.ajustarAMano")}
          </QBoton>
        )}
        <QBoton deshabilitado={!resultado} onClick={() => resultado && onGuardar(resultado)}>
          {t("dashboard.anadir")}
        </QBoton>
      </footer>
    </QModal>
  );
};
