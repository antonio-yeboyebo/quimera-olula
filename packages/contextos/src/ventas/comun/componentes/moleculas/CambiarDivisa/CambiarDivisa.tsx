import { Divisa } from "#/comun/componentes/divisa.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useMemo } from "react";
import "./CambiarDivisa.css";
import { CambioDivisa } from "./diseño.ts";
import { cambioDivisaVacio, metaCambioDivisa } from "./dominio.ts";
import { useTVentas } from "../../../../i18n/index.ts";

interface CambiarDivisaProps {
  publicar: EmitirEvento;
  divisaId: string;
  tasaConversion: number;
  titulo?: string;
}

export const CambiarDivisa = ({
  publicar,
  divisaId,
  tasaConversion,
  titulo: tituloProp,
}: CambiarDivisaProps) => {
  const t = useTVentas();
  const titulo = tituloProp ?? t("comun.campos.divisa");
  const divisaInicial = useMemo(
    () => ({
      ...cambioDivisaVacio,
      divisa_id: divisaId ?? "",
      tasa_conversion: tasaConversion ?? 0,
    }),
    [divisaId, tasaConversion]
  );

  const { modelo, uiProps, valido, init } = useModelo(
    metaCambioDivisa,
    divisaInicial
  );

  const guardar = async () => {
    const cambio: CambioDivisa = {
      divisa_id: modelo.divisa_id,
      tasa_conversion: modelo.tasa_conversion,
    };
    await publicar("cambio_divisa_listo", cambio);
    init(divisaInicial);
  };

  const cancelar = () => {
    publicar("cambio_divisa_cancelado");
    init(divisaInicial);
  };

  return (
    <QModal
      abierto={true}
      nombre="cambiar_divisa"
      titulo={titulo}
      onCerrar={cancelar}
    >
      <div className="CambiarDivisa">
        <quimera-formulario>
          <Divisa {...uiProps("divisa_id")} />
          <QInput
            label={t("comun.campos.tasaConversion")}
            {...uiProps("tasa_conversion")}
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
