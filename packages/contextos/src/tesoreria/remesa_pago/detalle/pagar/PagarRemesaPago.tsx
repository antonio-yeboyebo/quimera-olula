import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate, QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { RemesaPago } from "../../diseño.js";
import { esRemesaDeNominas } from "../../dominio.js";
import { metaPagoRemesaPago, pagoRemesaPagoInicial } from "./dominio.js";
import { useTTesoreria } from "../../../i18n/index.ts";

export const PagarRemesaPago = ({
  remesa,
  publicar,
}: {
  remesa: RemesaPago;
  publicar: EmitirEvento;
}) => {
  const t = useTTesoreria();
  const inicial = useMemo(
    () => pagoRemesaPagoInicial(remesa.fechaPago),
    [remesa.fechaPago]
  );

  const { modelo, uiProps, valido } = useModelo(metaPagoRemesaPago, inicial);

  const pagar_ = useCallback(
    async () => publicar("pago_confirmado", modelo.fecha),
    [modelo, publicar]
  );

  const cancelar_ = useCallback(() => publicar("pago_cancelado"), [publicar]);

  const [pagar, cancelar] = useForm(pagar_, cancelar_);

  const que = esRemesaDeNominas(remesa)
    ? t("remesa_pago.susLengthNominas", { length: remesa.nominas.length })
    : t("remesa_pago.susLengthRecibos", { length: remesa.recibos.length });

  return (
    <QModal
      abierto={true}
      nombre="pagar_remesa_pago"
      titulo={t("remesa_pago.pagarRemesaDePago")}
      onCerrar={cancelar}
    >
      <div className="PagarRemesaPago">
        <p>{t("remesa_pago.sePagaraLaRemesaEnteraQue", { que, total: formatearMoneda(
          remesa.total,
          remesa.divisaId || "EUR"
        ) })}</p>
        <quimera-formulario>
          <QDate label={t("remesa_pago.fecha")} {...uiProps("fecha")} />
        </quimera-formulario>
        <div className="botones maestro-botones">
          <QBoton onClick={pagar} deshabilitado={!valido}>
            {t("remesa_pago.pagar")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
