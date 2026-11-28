import { useCallback, useContext, useEffect, useRef, useState } from "react";

import { ContextoError, QError } from "./contexto.js";
import { Modelo, TipoInput, ValorCampoUI } from "./diseño.js";
import { FormModelo, getFormProps, MetaModelo, modeloEsValido, modeloModificado } from "./dominio.js";
import { tLib } from "./i18n/textos.ts";

const aQError = (error: unknown): QError => {
    const apiError = error as QError;
    const errorJS = error as Error;

    return {
        nombre: apiError?.nombre ?? tLib("gen.useModelo.error"),
        descripcion: apiError?.descripcion ?? errorJS?.message,
    };
};

export function useModelo<T extends Modelo>(
    meta: MetaModelo<T>,
    modeloInicialProp: T,
    onModeloListo?: (t: T, campo?: string) => Promise<void | T>
): HookModelo<T> {

    const [modelo, setModelo] = useState(modeloInicialProp);
    const [modeloInicial, setModeloInicial] = useState<T>(modeloInicialProp);
    const [errorGuardado, setErrorGuardado] = useState<QError | null>(null);
    const [guardados, setGuardados] = useState(0);

    const { intentar } = useContext(ContextoError);

    // Evita que el setModelo interno de onModeloListoConError vuelva a disparar el callback
    const enCambioDesdeCallback = useRef(false);
    // Modelo en el último disparo exitoso; evita llamadas redundantes al servidor
    const modeloUltimoDisparo = useRef<T>(modeloInicialProp);

    const onModeloListoConError = useCallback(
        async (modelo: T, campo?: string) => {
            if (!onModeloListo) return;
            // No disparar si el modelo no cambió desde el último disparo exitoso
            if (!modeloModificado(modeloUltimoDisparo.current, modelo)) return;
            enCambioDesdeCallback.current = true;
            try {
                await intentar(async () => {
                    const nuevoModelo = await onModeloListo(modelo, campo);
                    if (nuevoModelo) {
                        setModelo(nuevoModelo); // directo, sin pasar por setExterno
                    }
                    // Actualizar solo en caso de éxito; si falla, el siguiente blur reintenta
                    modeloUltimoDisparo.current = nuevoModelo ?? modelo;
                });
                setErrorGuardado(null);
                setGuardados((n) => n + 1);
            } catch (error) {
                setErrorGuardado(aQError(error));
            } finally {
                enCambioDesdeCallback.current = false;
            }
        },
        [intentar, onModeloListo]
    );

    // Uso interno: onChange de QInput (sin disparar onModeloListo en cada tecla)
    const cambiarModelo = useCallback((nuevoModelo: T) => {
        setErrorGuardado(null);
        setModelo(nuevoModelo);
    }, []);

    // Uso externo: set() del HookModelo — evalúa onModeloListo si el modelo es válido
    const setExterno = useCallback((nuevoModelo: T, campo?: string) => {
        setErrorGuardado(null);
        setModelo(nuevoModelo);
        if (!enCambioDesdeCallback.current && onModeloListo && modeloEsValido(meta)(nuevoModelo)) {
            void onModeloListoConError(nuevoModelo, campo);
        }
    }, [meta, onModeloListo, onModeloListoConError]);

    const init = useCallback((nuevoModelo?: T) => {
        const modeloAUsar = nuevoModelo || modeloInicialProp;
        setErrorGuardado(null);
        setModelo(modeloAUsar);
        setModeloInicial(modeloAUsar);
        modeloUltimoDisparo.current = modeloAUsar;
    }, [modeloInicialProp]);

    // Prop del último resincronizado; en el montaje el estado ya sale de modeloInicialProp,
    // así que resincronizar ahí solo serviría para pisar lo que un hijo haya puesto desde su
    // efecto (los efectos del hijo corren antes que los del padre).
    const propInicialPrevia = useRef(modeloInicialProp);

    useEffect(() => {
        if (propInicialPrevia.current === modeloInicialProp) return;
        propInicialPrevia.current = modeloInicialProp;
        setErrorGuardado(null);
        setModelo(modeloInicialProp);
        setModeloInicial(modeloInicialProp);
        modeloUltimoDisparo.current = modeloInicialProp;
    }, [modeloInicialProp]);

    const subModelo = useCallback(<SubT extends Modelo>(campo: string): FormModelo & { modelo: SubT; set: (sub: SubT) => void } => {
        const subMeta = (meta.campos?.[campo]?.meta ?? {}) as MetaModelo<SubT>;
        const subValor = (modelo[campo] ?? {}) as SubT;
        const subInicial = (modeloInicial[campo] ?? {}) as SubT;

        const subCambiarModelo = (nuevoSub: SubT) => {
            cambiarModelo({ ...modelo, [campo]: nuevoSub } as T);
        };

        const subOnModeloListo = onModeloListo
            ? async (nuevoSub: SubT, _subcampo: string): Promise<void | SubT> => {
                const padreActualizado = { ...modelo, [campo]: nuevoSub } as T;
                await onModeloListoConError(padreActualizado, campo);
            }
            : undefined;

        return {
            modelo: subValor,
            set: (nuevoSub: SubT) => setExterno({ ...modelo, [campo]: nuevoSub } as T, campo),
            ...getFormProps(subValor, subInicial, subMeta, subCambiarModelo, subOnModeloListo, errorGuardado),
        };
    }, [meta, modelo, modeloInicial, cambiarModelo, setExterno, onModeloListoConError, onModeloListo, errorGuardado]);

    return {
        modelo,
        modeloInicial: modeloInicial || modeloInicialProp,
        init,
        set: setExterno,
        subModelo,
        errorGuardado,
        guardados,
        ...getFormProps(modelo, modeloInicial, meta, cambiarModelo, onModeloListoConError, errorGuardado),
    } as const;
}

export type HookModelo<T extends Modelo> = {
    modelo: T,
    modeloInicial: T,
    uiProps: (campo: string, secundario?: string) => UiProps,
    init: (entidad?: T) => void,
    set: (entidad: T, campo?: string) => void,
    /** Devuelve props de formulario para un campo sub-objeto declarado con `meta` en MetaModelo. */
    subModelo: <SubT extends Modelo>(campo: string) => import("./dominio.js").FormModelo & { modelo: SubT; set: (sub: SubT) => void },
    modificado: boolean,
    valido: boolean,
    editable: boolean,
    errorGuardado: QError | null,
    guardados: number,
}

type ParamOpcion = {
    valor: string;
    descripcion?: string
};

export type ValorControl = null | boolean | string | ParamOpcion;

export type UiProps = {
    nombre: string;
    valor: ValorCampoUI;
    tipo: TipoInput;
    textoValidacion: string;
    deshabilitado: boolean;
    erroneo: boolean;
    advertido: boolean;
    opcional: boolean;
    valido: boolean;
    modificado: boolean;
    soloLectura: boolean;
    onChange: (valor: ValorControl) => void;
    evaluarCambio: () => void;
    descripcion?: string;
    divisa?: string;
    decimales?: number;
}
