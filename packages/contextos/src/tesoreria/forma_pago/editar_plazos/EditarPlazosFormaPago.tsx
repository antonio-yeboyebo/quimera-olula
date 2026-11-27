import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback, useState } from "react";
import { FormaPago, PlazoFormaPago } from "../diseño.ts";
import { errorPlazos, nuevoPlazo, totalAplazado } from "../dominio.ts";
import { patchFormaPago } from "../infraestructura.ts";
import { useTTesoreria } from "../../i18n/index.ts";

/**
 * Tabla de plazos de Eneboo `formaspago.ui` (`plazos.ui`): se editan todos a
 * la vez y se guardan juntos para que la suma sea siempre el 100 %.
 */
export const EditarPlazosFormaPago = ({
    formaPago,
    publicar,
}: {
    formaPago: FormaPago;
    publicar: EmitirEvento;
}) => {
    const t = useTTesoreria();
    const [plazos, setPlazos] = useState<PlazoFormaPago[]>(
        formaPago.plazos.length > 0 ? formaPago.plazos : [nuevoPlazo([])]
    );

    const cambiarPlazo = (i: number, campo: keyof PlazoFormaPago, valor: string) =>
        setPlazos((actuales) =>
            actuales.map((p, j) => (j === i ? { ...p, [campo]: Number(valor) } : p))
        );

    const quitarPlazo = (i: number) =>
        setPlazos((actuales) => actuales.filter((_, j) => j !== i));

    const anadirPlazo = () => setPlazos((actuales) => [...actuales, nuevoPlazo(actuales)]);

    const error = errorPlazos(plazos);

    const guardar_ = useCallback(async () => {
        await patchFormaPago(formaPago.id, { plazos });
        publicar("plazos_guardados");
    }, [formaPago.id, plazos, publicar]);

    const cancelar_ = useCallback(() => publicar("edicion_de_plazos_cancelada"), [publicar]);

    const [guardar, cancelar] = useForm(guardar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="editarPlazosFormaPago"
            titulo={t("forma_pago.plazosDeId", { id: formaPago.id })}
            onCerrar={cancelar}
        >
            <div className="EditarPlazosFormaPago">
                {plazos.map((plazo, i) => (
                    <quimera-formulario key={`plazo-${i}`}>
                        <QInput
                            label={t("forma_pago.diasAplazados")}
                            nombre={`dias_${i}`}
                            tipo="entero"
                            valor={String(plazo.dias)}
                            onChange={(valor) => cambiarPlazo(i, "dias", valor)}
                        />
                        <QInput
                            label={t("forma_pago.aplazado")}
                            nombre={`aplazado_${i}`}
                            tipo="decimal"
                            decimales={2}
                            valor={String(plazo.aplazado)}
                            onChange={(valor) => cambiarPlazo(i, "aplazado", valor)}
                        />
                        <QBoton variante="borde" advertencia onClick={() => quitarPlazo(i)}>
                            {t("forma_pago.quitar")}
                        </QBoton>
                    </quimera-formulario>
                ))}
                <p>{t("forma_pago.totalAplazadoValor", { valor: totalAplazado(plazos) })}</p>
                {error && <p className="error">{error}</p>}
                <div className="botones maestro-botones">
                    <QBoton variante="borde" onClick={anadirPlazo}>
                        {t("forma_pago.anadirPlazo")}
                    </QBoton>
                    <QBoton onClick={guardar} deshabilitado={!!error}>
                        {t("forma_pago.guardar")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
