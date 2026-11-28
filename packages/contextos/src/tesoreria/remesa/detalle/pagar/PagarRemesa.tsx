import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate, QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { metaPagoRemesa, pagoRemesaVacio } from "./dominio.js";
import { useTTesoreria } from "../../../i18n/index.ts";

export const PagarRemesa = ({ publicar }: { publicar: EmitirEvento }) => {
  const t = useTTesoreria();
  const inicial = useMemo(pagoRemesaVacio, []);

  const { modelo, uiProps, valido } = useModelo(metaPagoRemesa, inicial);

  const pagar_ = useCallback(
    async () => publicar("pago_confirmado", modelo.fecha),
    [modelo, publicar]
  );

  const cancelar_ = useCallback(() => publicar("pago_cancelado"), [publicar]);

  const [pagar, cancelar] = useForm(pagar_, cancelar_);

  return (
    <QModal
      abierto={true}
      nombre="pagar_remesa"
      titulo={t("remesa.pagarRemesaDeCobro")}
      onCerrar={cancelar}
    >
      <div className="PagarRemesa">
        <quimera-formulario>
          <QDate label={t("remesa.fecha")} {...uiProps("fecha")} />
        </quimera-formulario>
        <div className="botones maestro-botones">
          <QBoton onClick={pagar} deshabilitado={!valido}>
            {t("remesa.pagar")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
