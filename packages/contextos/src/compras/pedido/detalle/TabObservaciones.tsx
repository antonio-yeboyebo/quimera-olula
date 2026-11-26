import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Pedido } from "../diseño.ts";
import { useTCompras } from "#/compras/i18n/index.ts";

export const TabObservaciones = ({ form }: { form: HookModelo<Pedido> }) => {
    const t = useTCompras();
    return (
    <div className="TabObservaciones">
        <quimera-formulario>
            <QTextArea label={t("comun.campos.observaciones")} {...form.uiProps("observaciones")} />
        </quimera-formulario>
    </div>
    );
};
