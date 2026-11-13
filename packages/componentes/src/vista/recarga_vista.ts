import { useState } from "react";
import { useLocation } from "react-router";

/**
 * Recarga de la pantalla actual al navegar a ella.
 *
 * Los maestros leen su estado de la URL (`?id=`, filtros) solo al montarse y luego la
 * reescriben con `history.replaceState`, fuera del router. Si se navega a la ruta en la que
 * ya se está (p. ej. el asistente propone "Ver presupuesto" estando en Presupuestos), el
 * router no remonta la pantalla: no se relee el id ni se recarga la lista, y el elemento
 * creado o cambiado no aparece.
 *
 * Quien necesite que la pantalla se recargue navega con `estadoRecargaVista()` como `state`;
 * `Vista` remonta entonces su contenido (no la cabecera, el menú ni el panel del asistente).
 */
const CLAVE_RECARGA = "recargaVista";

type EstadoRecargaVista = { [CLAVE_RECARGA]: string };

let contador = 0;

/** `state` de una navegación que debe recargar la pantalla de destino, aunque sea la actual. */
export const estadoRecargaVista = (): EstadoRecargaVista => ({
    [CLAVE_RECARGA]: `${Date.now()}-${++contador}`,
});

const recargaDe = (state: unknown): string | undefined => {
    if (state && typeof state === "object" && CLAVE_RECARGA in state) {
        const valor = (state as Record<string, unknown>)[CLAVE_RECARGA];
        return typeof valor === "string" ? valor : undefined;
    }
    return undefined;
};

/**
 * Clave para el contenido de la vista: cambia solo con cada navegación nueva marcada con
 * `estadoRecargaVista()`. Una navegación sin marca no la cambia (no remonta nada que no
 * remontara ya el router).
 */
export const useClaveRecargaVista = (): number => {
    const recarga = recargaDe(useLocation().state);
    const [ultima, setUltima] = useState(recarga);
    const [clave, setClave] = useState(0);

    if (recarga !== undefined && recarga !== ultima) {
        setUltima(recarga);
        setClave(c => c + 1);
    }
    return clave;
};
