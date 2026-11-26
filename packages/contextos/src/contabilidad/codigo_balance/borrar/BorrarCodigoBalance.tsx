import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { CodigoBalance } from "../diseño.ts";
import { etiquetaCodigoBalance } from "../dominio.ts";
import { deleteCodigoBalance } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const BorrarCodigoBalance = ({
    publicar,
    codigoBalance,
}: {
    codigoBalance: CodigoBalance;
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const borrar_ = useCallback(async () => {
        await deleteCodigoBalance(codigoBalance.id);
        publicar("codigo_balance_borrado", codigoBalance);
    }, [publicar, codigoBalance]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarCodigoBalance"
            abierto={true}
            titulo={t("codigo_balance.borrarCodigoDeBalance")}
            mensaje={t("codigo_balance.confirmaBorrarCodigobalanceNoSePuede", { codigoBalance: etiquetaCodigoBalance(codigoBalance) })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
