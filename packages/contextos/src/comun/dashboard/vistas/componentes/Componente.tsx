import { ComponenteDashboard } from "../../diseño.ts";
import { etiquetaPeriodo, problemaComponente, sinDatos } from "../../dominio.ts";
import { useDatosComponente } from "../../useDatosComponente.ts";
import { useRecursos } from "../../useRecursos.ts";
import { Barras, Circular, Temporal } from "./Graficos.tsx";
import { Embudo } from "./Embudo.tsx";
import { Mapa } from "./Mapa.tsx";
import { MarcoComponente } from "./MarcoComponente.tsx";
import { Tabla } from "./Tabla.tsx";
import { Objetivo, Tarjeta } from "./Tarjeta.tsx";
import { useTComun } from "../../../i18n/index.ts";

/**
 * Un componente del dashboard con sus datos. `espera` (ms) retrasa la carga: la vista
 * previa del editor no pide datos a cada tecla.
 */
export const Componente = ({
  componente,
  espera = 0,
}: {
  componente: ComponenteDashboard;
  espera?: number;
}) => {
  const t = useTComun();
  const { respuestas, cargando, error } = useDatosComponente(componente, espera);
  const recursos = useRecursos();
  const problema = problemaComponente(componente);
  const [respuesta] = respuestas;
  const esTarjeta = componente.tipo === "tarjeta" || componente.tipo === "objetivo";

  if (componente.tipo === "texto") {
    return (
      <MarcoComponente titulo={componente.titulo}>
        <p className="dashboard-texto">{componente.opciones.texto}</p>
      </MarcoComponente>
    );
  }

  /* Tarjeta y objetivo usan la misma cáscara que los widgets del maestro. */
  if (esTarjeta) {
    if (problema) {
      return (
        <MarcoComponente titulo={componente.titulo} aviso={problema} />
      );
    }
    if (error) {
      return <MarcoComponente titulo={componente.titulo} error={error} />;
    }
    if (cargando && !respuesta) {
      return <MarcoComponente titulo={componente.titulo} cargando />;
    }
    if (!respuesta) return <MarcoComponente titulo={componente.titulo} cargando />;
    return componente.tipo === "objetivo" ? (
      <Objetivo componente={componente} respuesta={respuesta} cargando={cargando} />
    ) : (
      <Tarjeta componente={componente} respuesta={respuesta} cargando={cargando} />
    );
  }

  const vacio =
    !sinDatos(componente.tipo) &&
    respuesta !== undefined &&
    respuesta.grupos.length === 0;

  const contenido = () => {
    if (!respuesta) return null;
    switch (componente.tipo) {
      case "temporal":
        return <Temporal componente={componente} respuesta={respuesta} />;
      case "barras":
        return <Barras componente={componente} respuesta={respuesta} />;
      case "ranking":
        return <Barras componente={componente} respuesta={respuesta} horizontal />;
      case "circular":
        return <Circular componente={componente} respuesta={respuesta} />;
      case "mapa":
        return <Mapa componente={componente} respuesta={respuesta} />;
      case "embudo":
        return <Embudo componente={componente} respuestas={respuestas} />;
      case "tabla":
        return (
          <Tabla
            componente={componente}
            respuesta={respuesta}
            recurso={recursos.find((r) => r.id === componente.consultas[0].recurso)}
          />
        );
      default:
        return (
          <p className="dashboard-componente-estado">{t("dashboard.esteTipoDeComponenteLlegaraPronto")}</p>
        );
    }
  };

  return (
    <MarcoComponente
      titulo={componente.titulo}
      periodo={etiquetaPeriodo(componente.consultas[0])}
      cargando={cargando}
      error={error}
      vacio={vacio}
      aviso={problema}
    >
      {contenido()}
    </MarcoComponente>
  );
};
