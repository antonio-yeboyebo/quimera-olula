import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import "./AvisoObservacionesCliente.css";
import { AvisoObservacionesCliente as Aviso } from "./diseño.ts";
import { tituloAvisoObservacionesCliente } from "./dominio.ts";
import { useTVentas } from "../../../i18n/index.ts";

export const AvisoObservacionesCliente = ({
  aviso,
  onCerrar,
}: {
  aviso: Aviso;
  onCerrar: () => void;
}) => {
  const t = useTVentas();
  return (
    <QAviso variante="advertencia" className="aviso-observaciones-cliente">
      <div className="aviso-observaciones-cliente-texto">
        <strong>{tituloAvisoObservacionesCliente(aviso)}</strong>
        <span>{aviso.observaciones}</span>
      </div>
      <QBoton
        variante="texto"
        tipo="button"
        tamaño="pequeño"
        onClick={onCerrar}
      >
        {t("comun.cerrar")}
      </QBoton>
    </QAviso>
  );
};
