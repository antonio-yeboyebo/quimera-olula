import { Divisa } from "#/comun/componentes/divisa.tsx";
import { FormaPago } from "#/comun/componentes/formapago.tsx";
import { GrupoIvaNegocio } from "#/comun/componentes/grupo_iva_negocio.tsx";
import { ContactoSelector } from "#/crm/comun/componentes/contacto.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Proveedor } from "../diseño.ts";
import "./TabComercial.css";
import { useTCompras } from "#/compras/i18n/index.ts";

export const TabComercial = ({ form }: { form: HookModelo<Proveedor> }) => {
    const t = useTCompras();
    const { uiProps } = form;

    return (
        <div className="TabComercial">
            <quimera-formulario>
                <QInput label={t("comun.campos.serie")} {...uiProps("serieId")} nombre="proveedor/serieId" />
                <Divisa {...uiProps("divisaId")} nombre="proveedor/divisaId" />
                <FormaPago {...uiProps("formaPagoId")} nombre="proveedor/formaPagoId" />
                <GrupoIvaNegocio
                    {...uiProps("grupoIvaNegocioId")}
                    nombre="proveedor/grupoIvaNegocioId"
                />
                <ContactoSelector
                    label={t("comun.campos.contacto")}
                    {...uiProps("contactoId")}
                    nombre="proveedor/contactoId"
                />
                <QInput label={t("comun.campos.subcuenta")} {...uiProps("subcuentaCodigo")} />
                <QInput label={t("comun.campos.idSubcuenta")} {...uiProps("subcuentaId")} />
            </quimera-formulario>
        </div>
    );
};
