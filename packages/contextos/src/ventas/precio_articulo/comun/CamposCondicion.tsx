import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { UiProps } from "@olula/lib/useModelo.ts";
import { pvpIgnorado, tramoValido } from "../dominio.ts";
import "./CamposCondicion.css";
import { useTVentas } from "../../i18n/index.ts";

type Condicion = { cantidadMin: number; cantidadMax: number; dtoPorcentual: number; pvp: number };

/**
 * Tramo, descuento y precio neto, comunes al alta y al cambio.
 *
 * Con descuento el precio neto no se usa (el precio sale de la tarifa del
 * cliente o de la ficha del artículo), así que se deshabilita.
 */
export const CamposCondicion = ({
    uiProps,
    modelo,
}: {
    uiProps: (campo: string, secundario?: string) => UiProps;
    modelo: Condicion;
}) => {
    const t = useTVentas();
    const errorTramo = tramoValido(modelo);

    return (
        <>
            <QInput label={t("precioArticulo.campos.cantidadDesde")} {...uiProps("cantidadMin")} />
            <QInput label={t("precioArticulo.campos.cantidadHasta")} {...uiProps("cantidadMax")} />
            <QInput label={t("precioArticulo.campos.descuento")} {...uiProps("dtoPorcentual")} />
            <QInput
                label={t("precioArticulo.campos.precioNeto")}
                {...uiProps("pvp")}
                divisa="EUR"
                deshabilitado={pvpIgnorado(modelo)}
            />
            {errorTramo !== true && <span className="texto-validacion">{errorTramo}</span>}
            {pvpIgnorado(modelo) && (
                <p className="nota">
                    {t("precioArticulo.campos.ayudaDescuento")}
                </p>
            )}
        </>
    );
};
