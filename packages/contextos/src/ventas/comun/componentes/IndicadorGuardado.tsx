import { QError } from "@olula/lib/contexto.ts";
import { useEffect, useRef, useState } from "react";
import "./IndicadorGuardado.css";
import { useTVentas } from "../../i18n/index.ts";

export const IndicadorGuardado = ({
  modificado,
  error = null,
  guardados = 0,
  msVisible = 1500,
}: {
  modificado: boolean;
  error?: QError | null;
  guardados?: number;
  msVisible?: number;
}) => {
  const t = useTVentas();
  const [guardadoReciente, setGuardadoReciente] = useState(false);
  const guardadosPrevio = useRef(guardados);

  useEffect(() => {
    const seAcabaDeGuardar = guardados > guardadosPrevio.current;
    guardadosPrevio.current = guardados;

    if (!seAcabaDeGuardar) return;

    setGuardadoReciente(true);
    const temporizador = setTimeout(() => setGuardadoReciente(false), msVisible);
    return () => clearTimeout(temporizador);
  }, [guardados, msVisible]);

  if (error) {
    return (
      <span
        className="indicador-guardado error"
        role="alert"
        title={error.descripcion}
      >
        {t("comun.guardado.error")}
      </span>
    );
  }

  if (modificado) {
    return (
      <span className="indicador-guardado pendiente" role="status">
        {t("comun.guardado.sinGuardar")}
      </span>
    );
  }

  if (guardadoReciente) {
    return (
      <span className="indicador-guardado guardado" role="status">
        {t("comun.guardado.guardado")}
      </span>
    );
  }

  return null;
};
