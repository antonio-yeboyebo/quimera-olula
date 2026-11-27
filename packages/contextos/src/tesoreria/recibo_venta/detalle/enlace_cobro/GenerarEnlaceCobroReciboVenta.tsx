import { CuentaBancariaSelect } from "#/tesoreria/comun/componentes/cuenta_bancaria_select.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { MetaModelo } from "@olula/lib/dominio.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useContext, useState } from "react";
import { TransferenciaBancaria } from "../../../comun/componentes/TransferenciaBancaria.tsx";
import { ReciboVenta } from "../../diseño.js";
import { EnlaceCobroReciboVentaApi, postEnlaceCobroReciboVenta } from "../../infraestructura.js";
import "./GenerarEnlaceCobroReciboVenta.css";
import { useTTesoreria } from "../../../i18n/index.ts";

type ModeloCuenta = { cuenta_banco_id: string; nombre_cuenta: string };

const metaCuenta: MetaModelo<ModeloCuenta> = {
    campos: {
        cuenta_banco_id: { requerido: true },
    },
};

const vacio: ModeloCuenta = { cuenta_banco_id: "", nombre_cuenta: "" };

/**
 * Cobro al cliente: genera un enlace que la empresa le envía para que pague
 * el recibo desde su banco a la cuenta de la empresa que se elija aquí.
 */
export const GenerarEnlaceCobroReciboVenta = ({
    recibo,
    publicar,
}: {
    recibo: ReciboVenta;
    publicar: EmitirEvento;
}) => {
    const t = useTTesoreria();
    const { intentar } = useContext(ContextoError);
    const { modelo, uiProps, valido } = useModelo(metaCuenta, vacio);
    const [enlace, setEnlace] = useState<EnlaceCobroReciboVentaApi | null>(null);
    const [copiado, setCopiado] = useState(false);

    const cliente = recibo.nombreCliente || t("recibo_venta.elCliente");

    const generar = () => {
        intentar(async () => {
            setEnlace(await postEnlaceCobroReciboVenta(recibo.id, modelo.cuenta_banco_id));
        });
    };

    const copiar = async () => {
        if (!enlace) return;
        try {
            await navigator.clipboard.writeText(enlace.url);
            setCopiado(true);
        } catch {
            setCopiado(false);
        }
    };

    const cerrar = () => publicar("enlace_cobro_cerrado");

    return (
        <QModal
            abierto={true}
            nombre="generar_enlace_cobro"
            titulo={t("recibo_venta.cobrarACliente", { cliente })}
            onCerrar={cerrar}
        >
            <div className="GenerarEnlaceCobroReciboVenta">
                {!enlace ? (
                    <>
                        <p>
                            {t("recibo_venta.seGeneraraUnEnlaceParaQue")}{" "}<strong>{cliente}</strong>{" "}{t("recibo_venta.pagueElRecibo")}{" "}{recibo.codigo}{" "}{t("recibo_venta.desdeSuBancoEligeLaCuenta")}
                        </p>
                        <quimera-formulario>
                            <CuentaBancariaSelect
                                label={t("recibo_venta.cuentaDeLaEmpresaQueRecibe")}
                                {...uiProps("cuenta_banco_id", "nombre_cuenta")}
                            />
                        </quimera-formulario>
                        <div className="botones maestro-botones">
                            <QBoton onClick={generar} deshabilitado={!valido}>
                                {t("recibo_venta.generarEnlaceDeCobro")}
                            </QBoton>
                        </div>
                    </>
                ) : (
                    <>
                        <TransferenciaBancaria
                            envia={{ nombre: enlace.pagador.nombre }}
                            recibe={enlace.beneficiario}
                            importe={recibo.importe}
                            referencia={enlace.referencia}
                        />
                        <p>
                            {t("recibo_venta.enviaEsteEnlaceA")}{" "}<strong>{enlace.pagador.nombre}</strong>{" "}{t("recibo_venta.porCorreoOWhatsappAlAbrirlo")}{" "}<strong>{enlace.beneficiario.nombre}</strong>.
                        </p>
                        <quimera-formulario>
                            <QInput label={t("recibo_venta.enlaceDeCobro")} nombre="url" valor={enlace.url} soloLectura />
                        </quimera-formulario>
                        <div className="botones maestro-botones">
                            <QBoton onClick={copiar}>
                                {copiado ? t("recibo_venta.enlaceCopiado") : t("recibo_venta.copiarEnlace")}
                            </QBoton>
                            <QBoton onClick={cerrar} variante="borde">
                                {t("recibo_venta.cerrar")}
                            </QBoton>
                        </div>
                    </>
                )}
            </div>
        </QModal>
    );
};
