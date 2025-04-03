import { useEffect, useState } from "react";
import {
  Criteria,
  Entidad,
  Filtro,
  Orden,
} from "../../contextos/comun/diseño.ts";
import { MetaTabla, QTabla } from "../atomos/qtabla.tsx";
import { expandirEntidad } from "../detalle/helpers.tsx";
import { SinDatos } from "../SinDatos/SinDatos.tsx";
import { filtrarEntidad } from "./maestroFiltros/filtro.ts";
import { MaestroFiltros } from "./maestroFiltros/MaestroFiltros.tsx";

const datosCargando = <T extends Entidad>() =>
  new Array(10).fill(null).map(
    (_, i) =>
      ({
        id: i.toString(),
        ...Object.fromEntries(
          new Array(10).fill(null).map((_, j) => [j, "U00A0"])
        ),
      } as T)
  );

const obtenerCampos = (entidad: Entidad | null): string[] => {
  if (!entidad) return [];

  return expandirEntidad(entidad).map(([clave]) => clave);
};

export type MaestroProps<T extends Entidad> = {
  metaTabla: MetaTabla<T>;
  criteria?: Criteria;
  entidades: T[];
  setEntidades: (entidades: T[]) => void;
  seleccionada: T | null;
  setSeleccionada: (seleccionada: T) => void;
  cargar: (fitro: Filtro, orden: Orden) => Promise<T[]>;
};

export const Listado = <T extends Entidad>({
  metaTabla,
  criteria = { filtro: {}, orden: { id: "DESC" } },
  entidades,
  setEntidades,
  seleccionada,
  setSeleccionada,
  cargar,
}: MaestroProps<T>) => {
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>(criteria.filtro);
  const [orden, setOrden] = useState<Orden>(criteria.orden);

  useEffect(() => {
    let hecho = false;
    setCargando(true);

    cargar(filtro, orden).then((entidades) => {
      if (hecho) return;

      setEntidades(entidades as T[]);
      setCargando(false);
    });

    return () => {
      hecho = true;
    };
  }, [filtro, orden, cargar, setEntidades]);

  const entidadesFiltradas = entidades.filter((entidad) =>
    filtrarEntidad(entidad, filtro)
  );

  const renderEntidades = () => {
    if (!entidadesFiltradas.length && !cargando) return <SinDatos />;

    const datos = entidadesFiltradas.length
      ? entidadesFiltradas
      : datosCargando<T>();

    return (
      <QTabla
        metaTabla={metaTabla}
        datos={datos}
        cargando={cargando}
        seleccionadaId={seleccionada?.id}
        onSeleccion={(entidad) => setSeleccionada(entidad as T)}
        orden={orden}
        onOrdenar={(clave) =>
          setOrden({ [clave]: orden[clave] === "ASC" ? "DESC" : "ASC" })
        }
      />
    );
  };

  return (
    <div className="Maestro">
      <MaestroFiltros
        campos={obtenerCampos(entidades[0])}
        filtro={filtro}
        cambiarFiltro={(clave, valor) =>
          setFiltro({ ...filtro, [clave]: { LIKE: valor } })
        }
        borrarFiltro={(clave) => {
          const { [clave]: _, ...resto } = filtro;
          setFiltro(resto);
        }}
        resetearFiltro={() => setFiltro(criteria.filtro)}
      />
      {renderEntidades()}
    </div>
  );
};
