import { QInput } from "@olula/componentes/index.js";
import { HookModelo } from "@olula/lib/useModelo.js";
import { ModeloClienteVentaNoRegistrado } from "./cliente_venta.ts";
import { useTVentas } from "../../../../i18n/index.ts";

export const ClienteVentaNoRegistrado = <T extends ModeloClienteVentaNoRegistrado>({
    cliente,
}: {
    cliente: HookModelo<T>;
}) => {

    const { uiProps } = cliente
    const t = useTVentas();

    return (
        <>
            <QInput label={t("comun.campos.nombre")}
                {...uiProps("nombre")}
            />
            <QInput label={t("comun.campos.dniNif")}
                {...uiProps("idFiscal")}
            />
            <QInput label={t("comun.campos.direccionCorta")}
                {...uiProps("nombreVia")}
            />
            <QInput label={t("comun.campos.codPostalCorto")}
                {...uiProps("codPostal")}
            />
        </>
    );
};