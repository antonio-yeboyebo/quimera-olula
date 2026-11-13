import { ReembolsoPasarela } from "#/tesoreria/cobro_online/diseño.ts";
import { pasarelaPagoActiva, textoReembolsoPasarela } from "#/tesoreria/cobro_online/dominio.ts";
import { getReembolsoPasarelaRecibo } from "#/tesoreria/cobro_online/infraestructura.ts";
import { CuentaBancariaSelect } from "#/tesoreria/comun/componentes/cuenta_bancaria_select.tsx";
import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate, QInput, QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect, useMemo, useState } from "react";
import { ReciboVenta } from "../../diseño.js";
import { enDivisaExtranjera } from "../../dominio.js";
import "./DevolverReciboVenta.css";
import { DevolucionRecibo } from "./diseño.js";
import { devolucionReciboVacia, metaDevolucionRecibo } from "./dominio.js";

export const DevolverReciboVenta = ({
  recibo,
  publicar,
}: {
  recibo: ReciboVenta;
  publicar: EmitirEvento;
}) => {
  // Memoizado: useModelo reinicia el modelo cada vez que cambia el inicial.
  const devolucionInicial = useMemo(
    () => devolucionReciboVacia(recibo),
    [recibo]
  );

  const enDivisa = enDivisaExtranjera(recibo);
  const meta = useMemo(() => metaDevolucionRecibo(enDivisa), [enDivisa]);

  const { modelo, uiProps, valido } = useModelo(meta, devolucionInicial);

  // Si el recibo se cobró con tarjeta por Stripe, se ofrece devolver también
  // el dinero allí, marcado por defecto: devolver solo en Olula deja al
  // cliente sin su dinero.
  const [reembolso, setReembolso] = useState<ReembolsoPasarela | null>(null);
  const [reembolsar, setReembolsar] = useState(true);

  useEffect(() => {
    if (!pasarelaPagoActiva()) return;
    let vigente = true;
    getReembolsoPasarelaRecibo(recibo.id)
      .then((r) => vigente && setReembolso(r))
      .catch(() => vigente && setReembolso(null));
    return () => {
      vigente = false;
    };
  }, [recibo.id]);

  const devolver = async () => {
    const devolucion: DevolucionRecibo = {
      ...modelo,
      reembolsar_en_pasarela: reembolso !== null && reembolsar,
    };
    await publicar("devolucion_confirmada", devolucion);
  };

  const cancelar = () => publicar("devolucion_cancelada");

  return (
    <QModal
      abierto={true}
      nombre="devolver_recibo_venta"
      titulo="Devolver recibo"
      onCerrar={cancelar}
    >
      <div className="DevolverReciboVenta">
        <quimera-formulario>
          <CuentaBancariaSelect
            label="Cuenta de pago"
            {...uiProps("cuenta_pago_id", "nombre_cuenta_pago")}
            deshabilitado
          />
          <QDate label="Fecha" {...uiProps("fecha")} />
          {enDivisa && (
            <QInput
              label={`Tasa de cambio ${recibo.divisaId} → ${recibo.divisaEmpresaId}`}
              {...uiProps("tasa_conversion")}
            />
          )}
        </quimera-formulario>
        {reembolso && (
          <div className="reembolso-pasarela">
            <QCheckbox
              nombre="reembolsar_en_pasarela"
              label={textoReembolsoPasarela(reembolso)}
              valor={reembolsar}
              onChange={(valor) => setReembolsar(valor === "true")}
            />
            {!reembolsar && (
              <QAviso variante="advertencia">
                El recibo quedará devuelto en Olula, pero el cliente no recibirá
                el dinero: tendrás que reembolsarlo en el panel de Stripe.
              </QAviso>
            )}
          </div>
        )}
        <div className="botones maestro-botones">
          <QBoton onClick={devolver} deshabilitado={!valido}>
            Devolver
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
