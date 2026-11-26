import { PaisSelector } from "#/comun/componentes/pais/pais.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { UiProps } from "@olula/lib/useModelo.ts";
import "./CamposDireccionProveedor.css";
import { useTCompras } from "#/compras/i18n/index.ts";

export const CamposDireccionProveedor = ({
  uiProps,
}: {
  uiProps: (campo: string, secundario?: string) => UiProps;
}) => {
  const t = useTCompras();
  return (
  <>
    <QInput label={t("comun.direccion.tipoVia")} {...uiProps("tipoVia")} />
    <QInput label={t("comun.direccion.nombreVia")} {...uiProps("nombreVia")} />
    <QInput label={t("comun.direccion.numero")} {...uiProps("numero")} />
    <QInput label={t("comun.direccion.otros")} {...uiProps("otros")} />
    <QInput label={t("comun.direccion.codPostal")} {...uiProps("codPostal")} />
    <QInput label={t("comun.direccion.ciudad")} {...uiProps("ciudad")} />
    <QInput label={t("comun.direccion.provincia")} {...uiProps("provincia")} />
    <PaisSelector label={t("comun.direccion.pais")} {...uiProps("paisId", "pais")} />
    <QInput label={t("comun.direccion.telefono")} {...uiProps("telefono")} />
  </>
  );
};
