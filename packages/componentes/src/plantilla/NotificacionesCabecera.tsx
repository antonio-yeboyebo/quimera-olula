import { getTotalComunicacionesNoLeidas } from "@olula/lib/api/notificaciones.ts";
import { onGlobalServerSentEvent } from "@olula/lib/api/server_sent_events_session.ts";
import { plugin, puede } from "@olula/lib/dominio.ts";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { QIcono } from "../atomos/qicono.tsx";
import { estaAutentificado } from "./autenticacion";
import "./NotificacionesCabecera.css";
import { useTComponentes } from "../i18n/textos.ts";

const COMUNICACIONES_URL = "/comun/comunicacion";

type EventoComunicacionResumen = {
  total_no_leidas?: number | string;
};

export const NotificacionesCabecera = () => {
  const t = useTComponentes();
  const autenticado = estaAutentificado();
  const tienePermisoComunicacion = puede("comun.comunicacion");
  const pluginSseActivo = plugin("eventos_sse") === "activo";
  const [totalNoLeidas, setTotalNoLeidas] = useState(0);

  useEffect(() => {
    if (!autenticado || !tienePermisoComunicacion || !pluginSseActivo) {
      setTotalNoLeidas(0);
      return;
    }

    getTotalComunicacionesNoLeidas()
      .then((total) => setTotalNoLeidas(total))
      .catch(() => setTotalNoLeidas(0));

    return onGlobalServerSentEvent("comun.comunicacion.resumen", (event) => {
      try {
        console.log(
          "Evento SSE recibido: comun.comunicacion.resumen",
          event.data
        );
        const evento = JSON.parse(
          String(event.data ?? "{}")
        ) as EventoComunicacionResumen;

        const total = Number(evento.total_no_leidas);

        if (Number.isFinite(total) && total >= 0) {
          setTotalNoLeidas(Math.trunc(total));
        }
      } catch {
        // Ignora payloads inválidos sin romper la vista.
      }
    });
  }, [autenticado, tienePermisoComunicacion, pluginSseActivo]);

  if (!autenticado || !tienePermisoComunicacion || !pluginSseActivo)
    return null;

  return (
    <Link
      to={COMUNICACIONES_URL}
      className="accion-cabecera-notificaciones"
      aria-label={t("ui.plantilla.irAComunicacionesTotalnoleidasNotificaci", { totalNoLeidas })}
      title={t("ui.plantilla.notificaciones")}
    >
      <QIcono nombre="bell" tamaño="sm" />
      <span className="accion-cabecera-notificaciones-badge">
        {totalNoLeidas}
      </span>
    </Link>
  );
};
