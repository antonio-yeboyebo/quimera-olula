import { opcionesTipoIdFiscalCompras } from "#/compras/comun/valores.ts";
import { TipoIdFiscal } from "#/comun/componentes/tipoIdFiscal.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Proveedor } from "../diseño.ts";
import "./TabGeneral.css";
import { useTCompras } from "#/compras/i18n/index.ts";

export const TabGeneral = ({
    form,
    proveedor,
}: {
    form: HookModelo<Proveedor>;
    proveedor: Proveedor;
}) => {
    const t = useTCompras();
    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label={t("comun.campos.nombre")} {...uiProps("nombre")} />
                <QInput label={t("comun.campos.nombreComercial")} {...uiProps("nombreComercial")} />
                <TipoIdFiscal
                    {...uiProps("tipoIdFiscal")}
                    opciones={opcionesTipoIdFiscalCompras(t)}
                />
                <QInput label={t("comun.campos.idFiscal")} {...uiProps("idFiscal")} />
                <QInput label={t("comun.campos.telefono1")} {...uiProps("telefono1")} />
                <QInput label={t("comun.campos.telefono2")} {...uiProps("telefono2")} />
                <QInput label={t("comun.campos.email")} {...uiProps("email")} />
                <QInput label={t("comun.campos.web")} {...uiProps("web")} />
                {proveedor.deBaja && (
                    <QDate label={t("comun.campos.fechaBaja")} {...uiProps("fechaBaja")} />
                )}
                <QTextArea label={t("comun.campos.observaciones")} {...uiProps("observaciones")} />
            </quimera-formulario>
        </div>
    );
};
