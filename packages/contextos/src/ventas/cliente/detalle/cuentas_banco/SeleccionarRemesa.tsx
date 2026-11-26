import { useTVentas } from "../../../i18n/index.ts";
import { CuentaBancaria } from "#/tesoreria/comun/componentes/cuenta_bancaria.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useState } from "react";
import "./SeleccionarRemesa.css";

export const SeleccionarRemesa = ({
  cuentaRemesaId,
  descripcionCuentaRemesa,
  emitir,
}: {
  cuentaRemesaId: string;
  descripcionCuentaRemesa: string;
  emitir: (evento: string, payload?: unknown) => void;
}) => {
  const t = useTVentas();
  const [seleccion, setSeleccion] = useState<{
    valor: string;
    descripcion: string;
  } | null>(
    cuentaRemesaId
      ? { valor: cuentaRemesaId, descripcion: descripcionCuentaRemesa }
      : null
  );

  const guardar = () =>
    seleccion &&
    emitir("remesa_elegida", {
      cuenta_id: seleccion.valor,
      descripcion: seleccion.descripcion,
    });

  return (
    <div className="SeleccionarRemesa">
      <quimera-formulario>
        <CuentaBancaria
          label={t("cliente.cuentas.buscarCuenta")}
          valor={seleccion?.valor ?? ""}
          descripcion={seleccion?.descripcion ?? ""}
          onChange={setSeleccion}
        />
      </quimera-formulario>
      <div className="botones">
        <QBoton onClick={guardar} deshabilitado={!seleccion}>
          {t("cliente.botones.guardar")}
        </QBoton>
        <QBoton
          tipo="reset"
          variante="texto"
          onClick={() => emitir("remesa_cancelada")}
        >
          {t("cliente.botones.cancelar")}
        </QBoton>
      </div>
    </div>
  );
};
