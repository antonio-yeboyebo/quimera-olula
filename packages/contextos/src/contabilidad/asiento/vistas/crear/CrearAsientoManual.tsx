import { TipoDocumentoAsiento } from "#/contabilidad/comun/componentes/TipoDocumentoAsiento.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import {
    metaNuevoAsientoManual,
    nuevoAsientoManualVacio,
} from "../../dominio.ts";
import { postAsientoManual } from "../../infraestructura.ts";
import { EditorPartidasManual } from "../comun/EditorPartidasManual.tsx";
import "../comun/camposAsiento.css";
import { useTContabilidad } from "../../../i18n/index.ts";

export const CrearAsientoManual = ({
    publicar,
    ejercicioId,
}: {
    publicar: EmitirEvento;
    ejercicioId: string;
}) => {
    const t = useTContabilidad();
    const inicial = useMemo(
        () => nuevoAsientoManualVacio(ejercicioId),
        [ejercicioId]
    );
    const { modelo, set, valido } = useModelo(metaNuevoAsientoManual, inicial);

    const crear_ = useCallback(async () => {
        const { id } = await postAsientoManual(modelo);
        publicar("asiento_creado", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_asiento_cancelada"),
        [publicar]
    );

    const [crear, cancelar, aceptando] = useForm(crear_, cancelar_);
    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearAsientoManual"
            titulo={t("asiento.nuevoAsientoManual")}
            onCerrar={cancelar}
        >
            <div className="CamposAsientoManual">
                <quimera-formulario>
                    <QInput
                        label={t("asiento.ejercicio")}
                        nombre="ejercicioId"
                        valor={modelo.ejercicioId}
                        soloLectura
                    />
                    <QInput
                        label={t("asiento.fecha")}
                        nombre="fecha"
                        tipo="fecha"
                        valor={modelo.fecha.toISOString().slice(0, 10)}
                        onChange={(v) =>
                            set({ ...modelo, fecha: new Date(`${v}T12:00:00`) })
                        }
                        ref={focus}
                    />
                    <TipoDocumentoAsiento
                        valor={modelo.tipoDocumento}
                        onChange={(opcion) =>
                            set({
                                ...modelo,
                                tipoDocumento: opcion?.valor ?? "",
                            })
                        }
                    />
                    <QInput
                        label={t("asiento.documento")}
                        nombre="documento"
                        valor={modelo.documento}
                        onChange={(v) => set({ ...modelo, documento: v })}
                        opcional
                    />
                    <QInput
                        label={t("asiento.concepto")}
                        nombre="concepto"
                        valor={modelo.concepto}
                        onChange={(v) => set({ ...modelo, concepto: v })}
                    />
                </quimera-formulario>
            </div>
            <EditorPartidasManual
                partidas={modelo.partidas}
                ejercicioId={modelo.ejercicioId}
                onChange={(partidas) => set({ ...modelo, partidas })}
            />
            <div className="botones maestro-botones">
                <QBoton onClick={crear} deshabilitado={!valido || aceptando}>
                    {t("asiento.crearAsiento")}
                </QBoton>
            </div>
        </QModal>
    );
};
