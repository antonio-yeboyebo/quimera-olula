import { Fragment, PropsWithChildren, useCallback, useState } from "react";
// import { Contexto, ContextoSet } from "@olula/lib/contexto.ts";
import { ContextoError, Intentar, QError } from "@olula/lib/contexto.ts";
import { accionErrorLimite, analizarErrorLimite, tituloErrorLimite } from "@olula/lib/errores_limite.ts";
import { Outlet } from "react-router";

// import { Entidad } from "@olula/lib/diseño.ts";
import { QBoton } from "../atomos/qboton.tsx";
import { tComponentes } from "../i18n/textos.ts";
import { QModal } from "../moleculas/qmodal.tsx";
import { Plantilla } from "../plantilla/Plantilla.tsx";
import { Slot } from "../slot/Slot.tsx";
import { useClaveRecargaVista } from "./recarga_vista.ts";

export const Vista = ({ children }: PropsWithChildren<object>) => {
  const slots = { hijos: children };

  const [error, setError] = useState<QError | null>(null);

  const intentar: Intentar = useCallback(
    async (f, onError) => {
      try {
        const result = await f();
        return result;
      } catch (error) {
        const apiError = error as QError;
        const errorJS = error as Error;
        console.log("apiError", apiError);
        const descripcion = apiError.descripcion ?? errorJS.message;
        // Errores de límites del plan: sin el prefijo `[limite:...]` y con una acción
        // si la app la ha registrado (ver errores_limite.ts).
        const limite = analizarErrorLimite(descripcion);
        setError(limite
          ? {
            nombre: tituloErrorLimite(limite),
            descripcion: limite.mensaje,
            accion: accionErrorLimite(limite) ?? undefined,
          }
          : { nombre: apiError.nombre ?? tComponentes("comun.error"), descripcion });
        if (onError) {
          onError(error);
        }
        throw error;
      }
    },
    [setError]
  );

  // Remonta solo el contenido de la ruta (no la plantilla) al navegar con
  // estadoRecargaVista(), aunque la ruta sea la actual: ver recarga_vista.ts.
  const claveRecarga = useClaveRecargaVista();
  const contenido = <Fragment key={claveRecarga}>{children ?? <Outlet />}</Fragment>;

  return (
    <ContextoError.Provider value={{ error, setError, intentar }}>
      <Slot nombre="contenido" {...slots}>
        <Plantilla>{contenido}</Plantilla>
      </Slot>

      <QModal
        nombre="error"
        abierto={error !== null}
        onCerrar={() => setError(null)}
        titulo={error?.nombre}
      >
        <p>{error?.descripcion}</p>
        {error?.accion && (
          error.accion.url
            ? (
              <div className="botones maestro-botones">
                <QBoton enlace={error.accion.url} onClick={() => setError(null)}>
                  {error.accion.texto}
                </QBoton>
              </div>
            )
            : <p><em>{error.accion.texto}</em></p>
        )}
      </QModal>
    </ContextoError.Provider>
  );
};

// export const SubVista = <T extends Entidad>({
//   children,
// }: PropsWithChildren<object>) => {
//   // const slots = { hijos: children };

//   const [entidades, setEntidades] = useState<T[]>([]);
//   const [seleccionada, setSeleccionada] = useState<T | null>(null);

//   return (
//     <Contexto.Provider
//       value={{
//         entidades,
//         setEntidades: setEntidades as ContextoSet<Entidad[]>,
//         seleccionada,
//         setSeleccionada: setSeleccionada as ContextoSet<Entidad | null>,
//       }}
//     >
//       {children}
//     </Contexto.Provider>
//   );
// };
