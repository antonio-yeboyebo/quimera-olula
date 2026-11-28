import { CuentaBancariaSelect } from "#/tesoreria/comun/componentes/cuenta_bancaria_select.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { MetaModelo } from "@olula/lib/dominio.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useContext, useState } from "react";
import { ibanLegible } from "../../../comun/banca.ts";
import { TransferenciaBancaria } from "../../../comun/componentes/TransferenciaBancaria.tsx";
import { ReciboCompra } from "../../diseño.js";
import { OrdenPagoReciboCompraApi, postOrdenarPagoReciboCompra } from "../../infraestructura.js";
import { useTTesoreria } from "../../../i18n/index.ts";

type ModeloCuenta = { cuenta_banco_id: string; nombre_cuenta: string };

const metaCuenta: MetaModelo<ModeloCuenta> = {
    campos: {
        cuenta_banco_id: { requerido: true },
    },
};

const vacio: ModeloCuenta = { cuenta_banco_id: "", nombre_cuenta: "" };

/**
 * Pago al proveedor: la empresa le transfiere el importe del recibo desde la
 * cuenta que se elija aquí. Si el proveedor bancario no puede ejecutar el
 * pago directamente, hay que autorizarlo en el banco de la empresa.
 */
export const OrdenarPagoReciboCompra = ({
    recibo,
    publicar,
}: {
    recibo: ReciboCompra;
    publicar: EmitirEvento;
}) => {
    const t = useTTesoreria();
    const { intentar } = useContext(ContextoError);
    const { modelo, uiProps, valido } = useModelo(metaCuenta, vacio);
    const [orden, setOrden] = useState<OrdenPagoReciboCompraApi | null>(null);

    const proveedor = recibo.nombreProveedor || t("recibo_compra.elProveedor");

    const ordenar = () => {
        intentar(async () => {
            setOrden(await postOrdenarPagoReciboCompra(recibo.id, modelo.cuenta_banco_id));
        });
    };

    const cerrar = () => publicar("ordenar_pago_cerrado");

    return (
        <QModal
            abierto={true}
            nombre="ordenar_pago"
            titulo={t("recibo_compra.pagarAProveedor", { proveedor })}
            onCerrar={cerrar}
        >
            <div className="OrdenarPagoReciboCompra">
                {!orden ? (
                    <>
                        <p>
                            {t("recibo_compra.laEmpresaPagaraElRecibo")}{" "}{recibo.codigo}{" "}{t("recibo_compra.a")}{" "}
                            <strong>{proveedor}</strong>{t("recibo_compra.enSuCuentaDePagoElige")}
                        </p>
                        <quimera-formulario>
                            <CuentaBancariaSelect
                                label={t("recibo_compra.cuentaDeLaEmpresaQueEnvia")}
                                {...uiProps("cuenta_banco_id", "nombre_cuenta")}
                            />
                        </quimera-formulario>
                        <div className="botones maestro-botones">
                            <QBoton onClick={ordenar} deshabilitado={!valido}>
                                {t("recibo_compra.prepararPago")}
                            </QBoton>
                        </div>
                    </>
                ) : (
                    <>
                        <TransferenciaBancaria
                            envia={orden.ordenante}
                            recibe={orden.beneficiario}
                            importe={recibo.importe}
                            referencia={orden.referencia}
                        />
                        {orden.requiere_autorizacion && orden.url ? (
                            <>
                                <p>
                                    {t("recibo_compra.elDineroNoSaleHastaQue")}{" "}
                                    <strong>{orden.ordenante.nombre}</strong>{" "}{t("recibo_compra.autoriceLaTransferenciaEnSuBanco")}{" "}{ibanLegible(orden.ordenante.iban)}{t("recibo_compra.elBancoSoloPermitiraPagarDesde")}
                                </p>
                                <div className="botones maestro-botones">
                                    <QBoton
                                        onClick={() =>
                                            window.open(orden.url ?? "", "_blank", "noopener,noreferrer")
                                        }
                                    >
                                        {t("recibo_compra.autorizarEnElBanco")}
                                    </QBoton>
                                    <QBoton onClick={cerrar} variante="borde">
                                        {t("recibo_compra.cerrar")}
                                    </QBoton>
                                </div>
                            </>
                        ) : (
                            <>
                                <p>
                                    {t("recibo_compra.pagoEnviado")}{" "}<strong>{orden.beneficiario.nombre}</strong>{" "}
                                    {t("recibo_compra.recibiraLaTransferenciaDe")}{" "}
                                    <strong>{orden.ordenante.nombre}</strong>.
                                </p>
                                <div className="botones maestro-botones">
                                    <QBoton onClick={cerrar}>{t("recibo_compra.cerrar")}</QBoton>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </QModal>
    );
};
