import { CuentaBancariaSelect } from "#/tesoreria/comun/componentes/cuenta_bancaria_select.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate, QInput, QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useMemo } from "react";
import { DevolucionRecibo } from "../../../recibo_venta/detalle/devolver/diseño.js";
import { metaDevolucionRecibo } from "../../../recibo_venta/detalle/devolver/dominio.js";
import { ReciboCompra } from "../../diseño.js";
import { cuentaUltimoPagoCompra, enDivisaExtranjeraCompra } from "../../dominio.js";
import { useTTesoreria } from "../../../i18n/index.ts";

/** TES-02: devolución del recibo pagado, por la cuenta del último pago. */
export const DevolverReciboCompra = ({
  recibo,
  publicar,
}: {
  recibo: ReciboCompra;
  publicar: EmitirEvento;
}) => {
  // Memoizado: useModelo reinicia el modelo cada vez que cambia el inicial.
  const t = useTTesoreria();
  const devolucionInicial = useMemo((): DevolucionRecibo => {
    const cuenta = cuentaUltimoPagoCompra(recibo);
    return {
      cuenta_pago_id: cuenta?.id ?? "",
      nombre_cuenta_pago: cuenta?.nombre ?? "",
      fecha: new Date(),
      tasa_conversion: 0,
    };
  }, [recibo]);

  const enDivisa = enDivisaExtranjeraCompra(recibo);
  const meta = useMemo(() => {
    const base = metaDevolucionRecibo(enDivisa);
    // Pagado desde caja, el pago no tiene cuenta: la devolución tampoco.
    return { ...base, campos: { ...base.campos, cuenta_pago_id: { requerido: false } } };
  }, [enDivisa]);

  const { modelo, uiProps, valido } = useModelo(meta, devolucionInicial);

  const devolver = async () => {
    const devolucion: DevolucionRecibo = { ...modelo };
    await publicar("devolucion_confirmada", devolucion);
  };

  const cancelar = () => publicar("devolucion_cancelada");

  return (
    <QModal
      abierto={true}
      nombre="devolver_recibo_compra"
      titulo={t("recibo_compra.devolverRecibo")}
      onCerrar={cancelar}
    >
      <div className="DevolverReciboCompra">
        <quimera-formulario>
          <CuentaBancariaSelect
            label={t("recibo_compra.cuentaDePago")}
            {...uiProps("cuenta_pago_id", "nombre_cuenta_pago")}
            deshabilitado
          />
          <QDate label={t("recibo_compra.fecha")} {...uiProps("fecha")} />
          {enDivisa && (
            <QInput
              label={t("recibo_compra.tasaDeCambioDivisaidDivisaempresaid", { divisaId: recibo.divisaId, divisaEmpresaId: recibo.divisaEmpresaId })}
              {...uiProps("tasa_conversion")}
            />
          )}
        </quimera-formulario>
        <div className="botones maestro-botones">
          <QBoton onClick={devolver} deshabilitado={!valido}>
            {t("recibo_compra.devolver")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
