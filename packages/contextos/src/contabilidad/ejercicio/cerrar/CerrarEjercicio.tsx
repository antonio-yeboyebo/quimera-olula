import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { MetaModelo } from "@olula/lib/dominio.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo, useState } from "react";
import { Ejercicio, OpcionesCierre } from "../diseño.ts";
import {
    ejerciciosApertura,
    esAvisoCuentasSinCodigoBalance,
    etiquetaEjercicio,
    opcionesCierreAEnviar,
    opcionesCierreIniciales,
    textoAviso,
    validarOpcionesCierre,
} from "../dominio.ts";
import { patchCerrarEjercicio } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

const metaOpcionesCierre = (ejercicio: Ejercicio): MetaModelo<OpcionesCierre> => ({
    campos: {
        fecha: { requerido: true, tipo: "fecha" },
        regularizar: { tipo: "checkbox" },
        cerrar: { tipo: "checkbox" },
        abrir: { tipo: "checkbox" },
        ejercicioDestinoId: { requerido: false, tipo: "selector" },
        ignorarCuentasSinCodigoBalance: { tipo: "checkbox" },
    },
    validacion: (m) => validarOpcionesCierre(ejercicio, m),
});

/** co_cerrarejer: fecha de los asientos, pérdidas y ganancias y cierre
 * (siempre), y apertura en el ejercicio que se elija. */
export const CerrarEjercicio = ({
    ejercicio,
    ejercicios,
    publicar,
}: {
    ejercicio: Ejercicio;
    ejercicios: Ejercicio[];
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const inicial = useMemo(
        () => opcionesCierreIniciales(ejercicio, ejercicios),
        [ejercicio, ejercicios]
    );
    const meta = useMemo(() => metaOpcionesCierre(ejercicio), [ejercicio]);
    const { modelo, uiProps, valido } = useModelo(meta, inicial);
    const [aviso, setAviso] = useState("");

    const destinos = useMemo(
        () => ejerciciosApertura(ejercicio, ejercicios)
            .map((e) => ({ valor: e.id, descripcion: etiquetaEjercicio(e) })),
        [ejercicios, ejercicio],
    );

    const aceptar_ = useCallback(async () => {
        try {
            await patchCerrarEjercicio(ejercicio.id, opcionesCierreAEnviar(ejercicio, {
                ...modelo,
                ignorarCuentasSinCodigoBalance: !!aviso || modelo.ignorarCuentasSinCodigoBalance,
            }));
        } catch (error) {
            if (esAvisoCuentasSinCodigoBalance(error) && !aviso) {
                setAviso(textoAviso(error));
                return;
            }
            throw error;
        }
        publicar("ejercicio_cerrado");
    }, [ejercicio, modelo, aviso, publicar]);
    const [aceptar, cancelar] = useForm(aceptar_, () => publicar("cancelado"));

    return (
        <QModal abierto={true} nombre="cerrarEjercicio"
            titulo={t("ejercicio.cerrarElEjercicioEjercicio", { ejercicio: etiquetaEjercicio(ejercicio) })}
            onCerrar={cancelar}>
            <quimera-formulario>
                <QDate label={t("ejercicio.fechaDeLosAsientosDeRegularizacion")} {...uiProps("fecha")} />
                <QCheckbox label={t("ejercicio.asientoDePerdidasYGanancias")} {...uiProps("regularizar")} soloLectura />
                <QCheckbox label={t("ejercicio.asientoCierre")} {...uiProps("cerrar")} soloLectura />
                <QCheckbox label={t("ejercicio.asientoDeApertura")} {...uiProps("abrir")} />
                {modelo.abrir && (
                    <QSelect label={t("ejercicio.ejercicioDeApertura")} opciones={destinos} {...uiProps("ejercicioDestinoId")} />
                )}
            </quimera-formulario>
            {modelo.abrir && destinos.length === 0 && (
                <p className="aviso">
                    {t("ejercicio.noHayNingunEjercicioAbiertoPosterior")}
                </p>
            )}
            {aviso && (
                <p className="aviso">{t("ejercicio.avisoPulseDeNuevoCerrarPara", { aviso })}</p>
            )}
            <div className="botones maestro-botones">
                <QBoton onClick={aceptar} deshabilitado={!valido}>{t("ejercicio.cerrar")}</QBoton>
            </div>
        </QModal>
    );
};
