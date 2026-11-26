import { Agente } from "#/ventas/comun/componentes/agente.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useMemo } from "react";
import "./CambiarAgente.css";
import { CambioAgente } from "./diseño.ts";
import { cambioAgenteVacio, metaCambioAgente } from "./dominio.ts";
import { useTVentas } from "../../../../i18n/index.ts";

interface CambiarAgenteProps {
  publicar: EmitirEvento;
  agenteId: string;
  nombreAgente: string;
  porComision: number;
  titulo?: string;
}

export const CambiarAgente = ({
  publicar,
  agenteId,
  nombreAgente,
  porComision,
  titulo: tituloProp,
}: CambiarAgenteProps) => {
  const t = useTVentas();
  const titulo = tituloProp ?? t("comun.agente");
  const agenteInicial = useMemo(
    () => ({
      ...cambioAgenteVacio,
      agente_id: agenteId ?? "",
      nombre_agente: nombreAgente ?? "",
      por_comision: porComision ?? 0,
    }),
    [agenteId, nombreAgente, porComision]
  );

  const { modelo, uiProps, valido, init } = useModelo(
    metaCambioAgente,
    agenteInicial
  );

  const guardar = async () => {
    const cambio: CambioAgente = {
      agente_id: modelo.agente_id,
      nombre_agente: modelo.nombre_agente,
      por_comision: modelo.por_comision,
    };
    await publicar("cambio_agente_listo", cambio);
    init(agenteInicial);
  };

  const cancelar = () => {
    publicar("cambio_agente_cancelado");
    init(agenteInicial);
  };

  return (
    <QModal
      abierto={true}
      nombre="cambiar_agente"
      titulo={titulo}
      onCerrar={cancelar}
    >
      <div className="CambiarAgente">
        <quimera-formulario>
          <Agente {...uiProps("agente_id", "nombre_agente")} />
          <QInput
            label={t("comun.campos.comision")}
            {...uiProps("por_comision")}
          />
        </quimera-formulario>
        <div className="botones maestro-botones">
          <QBoton onClick={guardar} deshabilitado={!valido}>
            {t("comun.guardar")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
