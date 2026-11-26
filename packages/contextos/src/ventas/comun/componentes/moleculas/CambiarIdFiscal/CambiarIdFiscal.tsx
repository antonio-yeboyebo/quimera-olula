import { TipoIdFiscal } from "#/comun/componentes/tipoIdFiscal.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useMemo } from "react";
import { useTVentas } from "#/ventas/i18n/index.ts";
import "./CambiarIdFiscal.css";
import { CambioIdFiscal } from "./diseño.ts";
import {
  cambioIdFiscalVacio,
  metaCambioIdFiscal,
  validacionIdFiscal,
  validacionTipoIdFiscal,
} from "./dominio.ts";

interface CambiarIdFiscalProps {
  publicar: EmitirEvento;
  tipoIdFiscal: string;
  idFiscal: string;
  titulo?: string;
}

export const CambiarIdFiscal = ({
  publicar,
  tipoIdFiscal,
  idFiscal,
  titulo,
}: CambiarIdFiscalProps) => {
  const t = useTVentas();
  const idFiscalInicial = useMemo(
    () => ({
      ...cambioIdFiscalVacio,
      tipo_id_fiscal: tipoIdFiscal ?? "",
      id_fiscal: idFiscal ?? "",
    }),
    [tipoIdFiscal, idFiscal]
  );

  const { modelo, uiProps, valido, modificado, init } = useModelo(
    metaCambioIdFiscal,
    idFiscalInicial
  );

  const guardar = async () => {
    const cambio: CambioIdFiscal = {
      tipo_id_fiscal: modelo.tipo_id_fiscal,
      id_fiscal: modelo.id_fiscal,
    };
    await publicar("cambio_id_fiscal_listo", cambio);
    init(idFiscalInicial);
  };

  const cancelar = () => {
    publicar("cambio_id_fiscal_cancelado");
    init(idFiscalInicial);
  };

  const mensaje = (validacion: string | boolean) =>
    modificado && validacion !== true ? String(validacion) : "";

  return (
    <QModal
      abierto={true}
      nombre="cambiar_id_fiscal"
      titulo={titulo ?? t("comun.idFiscal")}
      onCerrar={cancelar}
    >
      <div className="CambiarIdFiscal">
        <quimera-formulario>
          <TipoIdFiscal
            {...uiProps("tipo_id_fiscal")}
            textoValidacion={mensaje(validacionTipoIdFiscal(modelo))}
          />
          <QInput
            label={t("comun.idFiscal")}
            {...uiProps("id_fiscal")}
            textoValidacion={mensaje(validacionIdFiscal(modelo))}
          />
        </quimera-formulario>
        <div className="botones maestro-botones">
          <QBoton onClick={guardar} deshabilitado={!valido}>
            {t("cliente.botones.guardar")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
