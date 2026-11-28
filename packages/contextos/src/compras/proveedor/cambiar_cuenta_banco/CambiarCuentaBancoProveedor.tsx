import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { CuentaBancoProveedor, Proveedor } from "../diseño.ts";
import { metaCuentaBancoProveedor } from "../dominio.ts";
import { patchCuentaBancoProveedor } from "../infraestructura.ts";
import "./CambiarCuentaBancoProveedor.css";
import { useTCompras } from "#/compras/i18n/index.ts";

export const CambiarCuentaBancoProveedor = ({
    proveedor,
    cuenta,
    publicar,
}: {
    proveedor: Proveedor;
    cuenta: CuentaBancoProveedor;
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    const { modelo, uiProps, valido } = useModelo(metaCuentaBancoProveedor, cuenta);

    const cambiar_ = useCallback(async () => {
        await patchCuentaBancoProveedor(proveedor.id, cuenta.id, modelo);
        publicar("cuenta_cambiada", cuenta.id);
    }, [modelo, proveedor.id, cuenta.id, publicar]);

    const cancelar_ = useCallback(
        () => publicar("cambio_de_cuenta_cancelado"),
        [publicar]
    );

    const [cambiar, cancelar] = useForm(cambiar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="cambiarCuentaBancoProveedor"
            titulo={t("proveedor.cuentas.cambiar")}
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <QInput label={t("comun.campos.descripcion")} {...uiProps("descripcion")} />
                <QInput label={t("proveedor.cuentas.iban")} {...uiProps("iban")} />
                <QInput label={t("proveedor.cuentas.bic")} {...uiProps("bic")} />
                <QInput label={t("proveedor.cuentas.codigoCuenta")} {...uiProps("codigoCuenta")} />
                <QInput label={t("comun.direccion.pais")} {...uiProps("paisId")} />
                <QInput label={t("proveedor.cuentas.entidad")} {...uiProps("entidad")} />
                <QInput label={t("proveedor.cuentas.agencia")} {...uiProps("agencia")} />
                <QInput label={t("proveedor.cuentas.digitoControl")} {...uiProps("digitoControl")} />
                <QInput label={t("proveedor.cuentas.cuenta")} {...uiProps("cuenta")} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={cambiar} deshabilitado={!valido}>
                    {t("comun.botones.cambiar")}
                </QBoton>
            </div>
        </QModal>
    );
};
