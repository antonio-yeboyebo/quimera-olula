import { CuentaBancariaSelect } from "#/empresa/comun/componentes/cuenta_bancaria_select.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate, QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { PagoRecibo } from "./diseño.js";
import { metaPagoRecibo, pagoReciboVacio } from "./dominio.js";

export const PagarReciboVenta = ({ publicar }: { publicar: EmitirEvento }) => {
  const { modelo, uiProps, valido, init } = useModelo(
    metaPagoRecibo,
    pagoReciboVacio
  );

  const pagar = async () => {
    const pago: PagoRecibo = { ...modelo };
    await publicar("pago_confirmado", pago);
    init(pagoReciboVacio);
  };

  const cancelar = () => {
    publicar("pago_cancelado");
    init(pagoReciboVacio);
  };

  return (
    <QModal
      abierto={true}
      nombre="pagar_recibo_venta"
      titulo="Pagar recibo"
      onCerrar={cancelar}
    >
      <div className="PagarReciboVenta">
        <quimera-formulario>
          <CuentaBancariaSelect
            label="Cuenta de pago"
            {...uiProps("cuenta_pago_id", "nombre_cuenta_pago")}
          />
          <QDate label="Fecha" {...uiProps("fecha")} />
        </quimera-formulario>
        <div className="botones maestro-botones">
          <QBoton onClick={pagar} deshabilitado={!valido}>
            Pagar
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
