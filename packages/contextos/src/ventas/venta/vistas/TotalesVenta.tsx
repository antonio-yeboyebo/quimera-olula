import { QBoton } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { formatearMoneda, plugin } from "@olula/lib/dominio.ts";
import { HookModelo } from "@olula/lib/useModelo.js";
import { Venta } from "../diseño.ts";
import {
  DIVISA_EMPRESA,
  enDivisaExtranjera,
  mostrarImporte,
} from "../dominio.ts";
import "./TotalesVenta.css";
import { useTVentas } from "../../i18n/index.ts";

interface TotalesVentaProps<T extends Venta> {
  modeloVenta: HookModelo<T>;
  publicar: EmitirEvento;
  /** `ticket`: recuadro a la derecha, un concepto por línea (documentos).
   *  `linea`: todo en una fila, más compacto (TPV). */
  formato?: "ticket" | "linea";
}

export const TotalesVenta = <T extends Venta>({
  modeloVenta,
  publicar,
  formato = "ticket",
}: TotalesVentaProps<T>) => {
  const t = useTVentas();
  const venta = modeloVenta.modelo;
  const pluginDtoCabeceraVentaActivo =
    plugin("dto_cabecera_venta") === "activo";

  return (
    <div className={`totales-venta totales-venta--${formato}`}>
      {modeloVenta.editable && pluginDtoCabeceraVentaActivo && (
        <div className="botones maestro-botones ">
          <QBoton onClick={() => publicar("descuento_solicitado", venta)}>
            {t("documento.totales.descuento")}
          </QBoton>
        </div>
      )}

      {venta.dtoPorcentual !== 0 && (
        <>
          <div className="totales-venta-item">
            <label>{t("documento.totales.netoSinDto")}</label>
            <span>{formatearMoneda(venta.netoSinDto, venta.divisa_id)}</span>
          </div>
          <div className="totales-venta-item">
            <label>
              {t("documento.totales.dto", { porcentaje: venta.dtoPorcentual })}
            </label>
            <span>
              {formatearMoneda(venta.netoSinDto - venta.neto, venta.divisa_id)}
            </span>
          </div>
        </>
      )}
      <div className="totales-venta-item">
        <label>{t("documento.totales.baseImponible")}</label>
        <span>{formatearMoneda(venta.neto, venta.divisa_id)}</span>
      </div>
      <div className="totales-venta-item">
        <label>{t("documento.totales.iva")}</label>
        <span>{formatearMoneda(venta.total_iva, venta.divisa_id)}</span>
      </div>
      {mostrarImporte(venta.total_recargo) && (
        <div className="totales-venta-item">
          <label>{t("documento.totales.recargo")}</label>
          <span>{formatearMoneda(venta.total_recargo, venta.divisa_id)}</span>
        </div>
      )}
      {mostrarImporte(venta.total_irpf) && (
        <div className="totales-venta-item">
          <label>{t("documento.totales.irpf")}</label>
          <span>{formatearMoneda(venta.total_irpf, venta.divisa_id)}</span>
        </div>
      )}
      <div className="totales-venta-item totales-venta-item--total">
        <label>{t("documento.totales.total")}</label>
        <span>{formatearMoneda(venta.total, venta.divisa_id)}</span>
      </div>
      {enDivisaExtranjera(venta) && (
        <div className="totales-venta-item totales-venta-item--divisa-empresa">
          <label>
            {t("documento.totales.totalEn", { divisa: DIVISA_EMPRESA })}
          </label>
          <span>
            {formatearMoneda(venta.total_divisa_empresa, DIVISA_EMPRESA)}
          </span>
        </div>
      )}
    </div>
  );
};
