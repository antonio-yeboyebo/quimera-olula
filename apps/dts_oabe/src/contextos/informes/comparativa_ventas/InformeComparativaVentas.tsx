import { Provincia } from "#/comun/componentes/provincia/provincia.tsx";
import { Agente } from "#/ventas/comun/componentes/agente.tsx";
import { Cliente } from "#/ventas/comun/componentes/cliente.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QDateInterval } from "@olula/componentes/atomos/qdateinterval.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useState } from "react";
import { FiltroInformeComparativaVentas, TipoAgente } from "./diseño.ts";
import {
  anioDesde,
  filtroInformeComparativaVentasVacio,
  nombreFicheroInformeComparativaVentas,
  opcionesTipoAgente,
  rangoFechaDesdeAtajo,
  validarFiltro,
} from "./dominio.ts";
import "./InformeComparativaVentas.css";
import { getInformeComparativaVentas } from "./infraestructura.ts";

const descripcionesVacias = { agente: "", cliente: "", provincia: "" };

export const InformeComparativaVentas = () => {
  const { intentar } = useContext(ContextoError);
  const [filtro, setFiltro] = useState<FiltroInformeComparativaVentas>(
    filtroInformeComparativaVentasVacio
  );
  const [descripciones, setDescripciones] = useState(descripcionesVacias);
  const [periodo, setPeriodo] = useState("");
  const [cargando, setCargando] = useState(false);

  const cambiar = useCallback(
    (cambios: Partial<FiltroInformeComparativaVentas>) =>
      setFiltro((actual) => ({ ...actual, ...cambios })),
    []
  );

  const cambiarDescripcion = useCallback(
    (campo: keyof typeof descripcionesVacias, descripcion: string) =>
      setDescripciones((actual) => ({ ...actual, [campo]: descripcion })),
    []
  );

  const cambiarPeriodo = useCallback(
    (atajo: string) => {
      const rango = rangoFechaDesdeAtajo(atajo);
      setPeriodo(rango ? atajo : "");
      if (rango) cambiar(rango);
    },
    [cambiar]
  );

  const cambiarFecha = useCallback(
    (cambios: Partial<FiltroInformeComparativaVentas>) => {
      setPeriodo("");
      cambiar(cambios);
    },
    [cambiar]
  );

  const limpiar = useCallback(() => {
    setFiltro(filtroInformeComparativaVentasVacio());
    setDescripciones(descripcionesVacias);
    setPeriodo("");
  }, []);

  const errorValidacion = validarFiltro(filtro);

  const lanzar = useCallback(async () => {
    if (cargando || errorValidacion) return;

    setCargando(true);
    try {
      const blob = await intentar(() => getInformeComparativaVentas(filtro));

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nombreFicheroInformeComparativaVentas(filtro.anioHasta);
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setCargando(false);
    }
  }, [filtro, cargando, errorValidacion, intentar]);

  const fechasDeshabilitadas = cargando || filtro.mostrarObjetivo;

  return (
    <div className="InformeComparativaVentas" style={{ margin: "20px" }}>
      <h2>Comparativa de ventas</h2>

      <quimera-formulario>
        <QInput
          label="Año desde"
          nombre="anio_desde"
          valor={anioDesde(filtro.anioHasta)}
          deshabilitado
        />
        <QInput
          label="Año hasta"
          nombre="anio_hasta"
          valor={filtro.anioHasta}
          onChange={(v) => cambiar({ anioHasta: v.trim() })}
          deshabilitado={cargando}
        />
        <QCheckbox
          label="Mostrar objetivo"
          nombre="mostrar_objetivo"
          valor={filtro.mostrarObjetivo}
          onChange={(v) => cambiar({ mostrarObjetivo: v === "true" })}
          deshabilitado={cargando}
        />
        <QDateInterval
          label="Periodo"
          nombre="periodo"
          valor={periodo}
          onChange={(v) => cambiarPeriodo(v)}
          deshabilitado={fechasDeshabilitadas}
        />
        <QDate
          label="Fecha desde"
          nombre="fecha_desde"
          valor={filtro.fechaDesde}
          onChange={(v) => cambiarFecha({ fechaDesde: v })}
          deshabilitado={fechasDeshabilitadas}
        />
        <QDate
          label="Fecha hasta"
          nombre="fecha_hasta"
          valor={filtro.fechaHasta}
          onChange={(v) => cambiarFecha({ fechaHasta: v })}
          deshabilitado={fechasDeshabilitadas}
        />
        <Agente
          valor={filtro.agenteId}
          descripcion={descripciones.agente}
          onChange={(opcion) => {
            cambiar({ agenteId: opcion?.valor ?? "" });
            cambiarDescripcion("agente", opcion?.descripcion ?? "");
          }}
          deshabilitado={cargando}
        />
        <QSelect
          label="Buscar agente en"
          nombre="tipo_agente"
          valor={filtro.tipoAgente}
          opciones={opcionesTipoAgente}
          onChange={(opcion) =>
            cambiar({ tipoAgente: (opcion?.valor ?? "factura") as TipoAgente })
          }
          deshabilitado={cargando}
        />
        <Cliente
          valor={filtro.clienteId}
          descripcion={descripciones.cliente}
          onChange={(opcion) => {
            cambiar({ clienteId: opcion?.valor ?? "" });
            cambiarDescripcion("cliente", opcion?.descripcion ?? "");
          }}
          deshabilitado={cargando}
        />
        <Provincia
          valor={filtro.provinciaId}
          descripcion={descripciones.provincia}
          onChange={(opcion) => {
            cambiar({ provinciaId: opcion?.valor ?? "" });
            cambiarDescripcion("provincia", opcion?.descripcion ?? "");
          }}
          deshabilitado={cargando}
        />
      </quimera-formulario>

      {errorValidacion && <p className="aviso-validacion">{errorValidacion}</p>}

      <div
        className="botones maestro-botones"
        aria-live="polite"
        aria-atomic="true"
      >
        <QBoton
          onClick={lanzar}
          deshabilitado={cargando || !!errorValidacion}
          props={{ disabled: cargando, "aria-busy": cargando }}
        >
          {cargando ? "Generando..." : "Generar informe"}
        </QBoton>
        <QBoton onClick={limpiar} variante="texto" deshabilitado={cargando}>
          Limpiar
        </QBoton>
      </div>
    </div>
  );
};
