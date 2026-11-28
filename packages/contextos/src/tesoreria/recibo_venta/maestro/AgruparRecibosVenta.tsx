import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { ReciboVenta } from "../diseño.ts";
import { useTTesoreria } from "../../i18n/index.ts";

const lineas = (recibos: ReciboVenta[]): string[] =>
  recibos.map(
    (recibo) =>
      `· ${recibo.codigo} — ${recibo.nombreCliente} — ${formatearMoneda(
        recibo.importe,
        "EUR"
      )}`
  );

export const AgruparRecibosVenta = ({
  recibos,
  publicar,
}: {
  recibos: ReciboVenta[];
  publicar: EmitirEvento;
}) => {
  const t = useTTesoreria();
  const agrupar_ = useCallback(
    async () => publicar("agrupado_confirmado"),
    [publicar]
  );

  const cancelar_ = useCallback(
    () => publicar("agrupado_cancelado"),
    [publicar]
  );

  const [agrupar, cancelar] = useForm(agrupar_, cancelar_);

  const total = recibos.reduce((suma, recibo) => suma + recibo.importe, 0);
  const cuantos = `${recibos.length} ${
    recibos.length === 1 ? "recibo" : "recibos"
  }`;

  const cabecera = t("recibo_venta.seCrearaUnReciboDeGrupo", { total: formatearMoneda(
    total,
    "EUR"
  ), cuantos });

  // const herencia = recibos.length
  //   ? `El grupo hereda cliente, divisa, forma de pago y fechas de ${recibos[0].codigo}.`
  //   : "";
  const herencia = "";

  return (
    <QModalConfirmacion
      nombre="agruparRecibosVenta"
      abierto={true}
      titulo={t("recibo_venta.agruparRecibos")}
      mensaje={[cabecera, "", ...lineas(recibos), "", herencia].join("\n")}
      onCerrar={cancelar}
      onAceptar={agrupar}
      labelAceptar={t("recibo_venta.agrupar")}
    />
  );
};
