import { Venta } from "#/ventas/venta/diseño.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useMemo } from "react";
import { CambiarDescuento as CambiarDescuentoType } from "./diseño.ts";
import { cambiarDescuentoVacio, metaCambiarDescuento } from "./dominio.ts";
import { useTVentas } from "../../../../i18n/index.ts";

interface CambiarDescuentoProps {
  publicar: EmitirEvento;
  venta: Venta;
}

export const CambiarDescuento = ({
  publicar,
  venta,
}: CambiarDescuentoProps) => {
  const t = useTVentas();
  const descuentoInicial = useMemo(
    () => ({
      ...cambiarDescuentoVacio,
      dto_porcentual: venta.dtoPorcentual,
    }),
    [venta]
  );

  const { modelo, uiProps, valido, init } = useModelo(
    metaCambiarDescuento,
    descuentoInicial
  );

  const guardar = async () => {
    const cambio: CambiarDescuentoType = {
      dto_porcentual: modelo.dto_porcentual,
    };
    await publicar("descuento_aplicado", cambio);
    init(descuentoInicial);
  };

  const cancelar = () => {
    publicar("descuento_cancelado");
    init(descuentoInicial);
  };

  return (
    <QModal
      abierto={true}
      nombre="cambiar_descuento"
      titulo={t("comun.campos.descuento")}
      onCerrar={cancelar}
    >
      <div className="CambiarDescuento">
        <quimera-formulario>
          <QInput
            label={t("comun.campos.descuentoPorcentaje")}
            {...uiProps("dto_porcentual")}
          />
        </quimera-formulario>
        <div className="botones maestro-botones">
          <QBoton onClick={guardar} deshabilitado={!valido}>
            {t("comun.aplicar")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
