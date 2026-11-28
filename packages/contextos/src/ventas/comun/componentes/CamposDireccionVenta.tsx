import { PaisSelector } from "#/comun/componentes/pais/pais.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { UiProps } from "@olula/lib/useModelo.ts";
import "./CamposDireccionVenta.css";
import { useTVentas } from "../../i18n/index.ts";

/**
 * Campos de dirección en snake_case, compartidos por el alta de documento de
 * venta con cliente no registrado y por el cambio de cliente del detalle.
 *
 * Devuelve un fragmento: tiene que ser hijo directo de `quimera-formulario`
 * para que las columnas del grid apliquen. El contenedor del formulario debe
 * llevar la clase `campos-direccion`.
 */
export const CamposDireccionVenta = ({
  uiProps,
}: {
  uiProps: (campo: string, secundario?: string) => UiProps;
}) => {
  const t = useTVentas();
  return (
    <>
      <QInput label={t("comun.direccion.tipoVia")} {...uiProps("tipo_via")} />
      <QInput
        label={t("comun.direccion.nombreVia")}
        {...uiProps("nombre_via")}
      />
      <QInput label={t("comun.direccion.numero")} {...uiProps("numero")} />
      <QInput label={t("comun.direccion.otros")} {...uiProps("otros")} />
      <QInput
        label={t("comun.direccion.codPostal")}
        {...uiProps("cod_postal")}
      />
      <QInput label={t("comun.direccion.ciudad")} {...uiProps("ciudad")} />
      <QInput
        label={t("comun.direccion.provincia")}
        {...uiProps("provincia")}
      />
      <PaisSelector label={t("comun.direccion.pais")} {...uiProps("pais_id")} />
      <QInput label={t("comun.direccion.telefono")} {...uiProps("telefono")} />
    </>
  );
};
