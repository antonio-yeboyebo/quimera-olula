import { CuentaBancariaSelect } from "#/tesoreria/comun/componentes/cuenta_bancaria_select.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate, QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearMoneda, MetaModelo } from "@olula/lib/dominio.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo, useState } from "react";
import { ReciboCompra } from "../diseño.js";
import { NuevaRemesaRecibos } from "./diseño.js";
import { useTTesoreria } from "../../i18n/index.ts";

type FechaPagoForm = { fechaPago: Date };

const metaFechaPago: MetaModelo<FechaPagoForm> = {
  campos: {
    fechaPago: { tipo: "fecha", requerido: true },
  },
};

export const RemesarRecibosCompra = ({
  recibos,
  publicar,
}: {
  recibos: ReciboCompra[];
  publicar: EmitirEvento;
}) => {
  const t = useTTesoreria();
  const [cuentaId, setCuentaId] = useState("");

  const inicial = useMemo((): FechaPagoForm => ({ fechaPago: new Date() }), []);
  const { modelo, uiProps, valido } = useModelo(metaFechaPago, inicial);

  const remesar_ = useCallback(
    async () =>
      publicar("remesado_confirmado", {
        cuentaId,
        fechaPago: modelo.fechaPago,
      } satisfies NuevaRemesaRecibos),
    [cuentaId, modelo, publicar]
  );

  const cancelar_ = useCallback(
    () => publicar("remesado_cancelado"),
    [publicar]
  );

  const [remesar, cancelar] = useForm(remesar_, cancelar_);

  const total = recibos.reduce((suma, recibo) => suma + recibo.importe, 0);
  const cuantos = `${recibos.length} ${
    recibos.length === 1 ? "recibo" : "recibos"
  }`;

  return (
    <QModal
      abierto={true}
      nombre="remesar_recibos_compra"
      titulo={t("recibo_compra.crearRemesaDePago")}
      onCerrar={cancelar}
    >
      <div className="RemesarRecibosCompra">
        <p>{t("recibo_compra.seCrearaUnaRemesaDePago", { cuantos, total: formatearMoneda(
          total,
          "EUR"
        ) })}</p>
        <quimera-formulario>
          <CuentaBancariaSelect
            nombre="cuenta_id"
            label={t("recibo_compra.cuentaDeCargo")}
            valor={cuentaId}
            onChange={(opcion) => setCuentaId(opcion?.valor ?? "")}
          />
          <QDate label={t("recibo_compra.fechaDePagoPrevista")} {...uiProps("fechaPago")} />
        </quimera-formulario>
        <div className="botones maestro-botones">
          <QBoton onClick={remesar} deshabilitado={!cuentaId || !valido}>
            {t("recibo_compra.remesar")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
