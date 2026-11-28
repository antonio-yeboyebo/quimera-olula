import { useEffect, useState } from "react";
import { ComponenteDashboard, RespuestaAgregado } from "./diseño.ts";
import { problemaComponente, sinDatos } from "./dominio.ts";
import { getAgregado } from "./infraestructura.ts";
import { useTComun } from "../i18n/index.ts";

type DatosComponente = {
  respuestas: RespuestaAgregado[];
  cargando: boolean;
  error: string | null;
};

/**
 * Datos de un componente: una petición por consulta. Cada componente carga y falla
 * por su cuenta (el error se queda en su tarjeta). `espera` retrasa la petición
 * mientras el usuario está configurando (vista previa).
 */
export const useDatosComponente = (
  componente: ComponenteDashboard,
  espera = 0
): DatosComponente => {
  const t = useTComun();
  const [datos, setDatos] = useState<DatosComponente>({
    respuestas: [],
    cargando: !sinDatos(componente.tipo),
    error: null,
  });
  const clave = JSON.stringify(componente.consultas);
  const incompleto = problemaComponente(componente) !== null;

  useEffect(() => {
    if (sinDatos(componente.tipo) || incompleto) {
      setDatos({ respuestas: [], cargando: false, error: null });
      return;
    }
    let cancelado = false;
    setDatos((previos) => ({ ...previos, cargando: true, error: null }));

    const temporizador = setTimeout(() => {
      Promise.all(componente.consultas.map(getAgregado))
        .then((respuestas) => {
          if (!cancelado) setDatos({ respuestas, cargando: false, error: null });
        })
        .catch((e: unknown) => {
          if (cancelado) return;
          setDatos({
            respuestas: [],
            cargando: false,
            error: e instanceof Error ? e.message : t("dashboard.noSeHanPodidoCargarLos"),
          });
        });
    }, espera);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
    // La clave serializada evita recargar por objetos nuevos con el mismo contenido.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, incompleto, espera]);

  return datos;
};
