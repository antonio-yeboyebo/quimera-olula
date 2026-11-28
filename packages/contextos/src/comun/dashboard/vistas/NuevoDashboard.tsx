import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { useState } from "react";
import { componentesDesdePropuestaDashboard } from "../dominio.ts";
import { crearDashboard, proponerDashboard } from "../infraestructura.ts";
import "./ConfigurarComponente.css";
import { tComun, useTComun } from "../../i18n/index.ts";

const ejemplos = () => [
  tComun("dashboard.seguimientoDeVentasYClientes"),
  tComun("dashboard.tesoreriaCobrosYPagosPendientes"),
  tComun("dashboard.comprasYProveedoresDeEsteAno"),
  tComun("dashboard.stockYArticulosSinDisponible"),
];

/**
 * Nuevo dashboard en blanco o propuesto por la IA a partir de lo que se quiere seguir.
 * La propuesta se crea ya colocada y se abre en edición para retocarla.
 */
export const NuevoDashboard = ({
  onCreado,
  onCancelar,
}: {
  onCreado: (id: string) => void;
  onCancelar: () => void;
}) => {
  const t = useTComun();
  const [peticion, setPeticion] = useState("");
  const [creando, setCreando] = useState<"blanco" | "ia" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const enBlanco = async () => {
    setCreando("blanco");
    try {
      onCreado(await crearDashboard({ nombre: t("dashboard.nuevoDashboard"), componentes: [] }));
    } finally {
      setCreando(null);
    }
  };

  const proponer = async (texto = peticion) => {
    if (!texto.trim() || creando) return;
    setPeticion(texto);
    setCreando("ia");
    setError(null);
    try {
      const propuesta = await proponerDashboard(texto);
      onCreado(
        await crearDashboard({
          nombre: propuesta.nombre,
          componentes: componentesDesdePropuestaDashboard(propuesta),
        })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : t("dashboard.noSeHaPodidoPreguntarA2"));
    } finally {
      setCreando(null);
    }
  };

  return (
    <QModal nombre="nuevo-dashboard" titulo={t("dashboard.nuevoDashboard")} abierto={true} onCerrar={onCancelar}>
      <div className="configurar-componente nuevo-dashboard">
        <p className="nuevo-dashboard-intro">
          {t("dashboard.cuentaleALaIaQueQuieres")}
        </p>
        <form
          className="preguntar-ia-pregunta"
          onSubmit={(evento) => {
            evento.preventDefault();
            proponer();
          }}
        >
          <QInput
            label={t("dashboard.queQuieresSeguir")}
            nombre="peticion_dashboard"
            valor={peticion}
            maxLength={500}
            autoFocus
            onChange={setPeticion}
          />
          <QBoton tipo="submit" deshabilitado={!peticion.trim() || creando !== null}>
            {creando === "ia" ? t("dashboard.montando") : t("dashboard.proponer")}
          </QBoton>
        </form>

        {creando !== "ia" && (
          <div className="preguntar-ia-ejemplos">
            <span>{t("dashboard.porEjemplo")}</span>
            {ejemplos().map((ejemplo) => (
              <QBoton
                key={ejemplo}
                variante="borde"
                tamaño="pequeño"
                deshabilitado={creando !== null}
                onClick={() => proponer(ejemplo)}
              >
                {ejemplo}
              </QBoton>
            ))}
          </div>
        )}

        {creando === "ia" && (
          <p className="nuevo-dashboard-progreso" role="status">
            {t("dashboard.eligiendoLosIndicadoresYComprobandoCada")}
          </p>
        )}

        {error && (
          <p className="preguntar-ia-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <footer className="configurar-componente-pie">
        <QBoton variante="borde" onClick={onCancelar}>
          {t("dashboard.cancelar")}
        </QBoton>
        <QBoton variante="borde" deshabilitado={creando !== null} onClick={enBlanco}>
          {t("dashboard.empezarEnBlanco")}
        </QBoton>
      </footer>
    </QModal>
  );
};
