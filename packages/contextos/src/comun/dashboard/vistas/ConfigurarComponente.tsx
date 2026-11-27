import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { useEffect, useState } from "react";
import {
  ComponenteDashboard,
  ConsultaComponente,
  FormatoValor,
  RecursoAgregable,
} from "../diseño.ts";
import {
  CIRCUITOS,
  consultaPorDefecto,
  consultasEmbudo,
  definicionTipo,
  ALTO_FILA_DASHBOARD,
  formatoPorDefecto,
  GRANULARIDADES,
  leerAgrupacion,
  leerPeriodo,
  metricasMapa,
  OPERACIONES,
  problemaComponente,
  RANGOS_PERIODO,
  sinDatos,
} from "../dominio.ts";
import { DIMENSIONES_GEOGRAFICAS } from "../geografia.ts";
import { useRecursos } from "../useRecursos.ts";
import { Componente } from "./componentes/Componente.tsx";
import "./ConfigurarComponente.css";
import { tComun, useTComun } from "../../i18n/index.ts";

const SIN_PERIODO = "__todo";
const SIN_COMPARAR = "__no";

const opcion = (valor: string, descripcion: string) => ({ valor, descripcion });

const recursoInicial = (recursos: RecursoAgregable[]) =>
  recursos.find((r) => r.id === "ventas.factura") ?? recursos[0];

const tieneClientes = (recurso: RecursoAgregable | undefined) =>
  Boolean(recurso?.dimensiones.some((d) => d.id === "cliente"));

const consultaNueva = (componente: ComponenteDashboard, recurso: RecursoAgregable) => {
  const consulta = consultaPorDefecto(
    componente.tipo,
    recurso.id,
    recurso.medidas.find((m) => m.id === "total")?.id ?? recurso.medidas[0]?.id,
    recurso.dimensiones.find((d) => d.tipo === "fecha")?.id
  );
  if (componente.tipo !== "mapa") return consulta;
  const geografica = recurso.dimensiones.find((d) => d.id in DIMENSIONES_GEOGRAFICAS);
  return {
    ...consulta,
    metricas: metricasMapa(consulta.metricas ?? "conteo", tieneClientes(recurso)),
    agrupar: geografica?.id,
  };
};

/** Formulario de un componente con la vista previa en vivo, con datos reales. */
export const ConfigurarComponente = ({
  componente,
  onGuardar,
  onCancelar,
}: {
  componente: ComponenteDashboard;
  onGuardar: (componente: ComponenteDashboard) => void;
  onCancelar: () => void;
}) => {
  const t = useTComun();
  const recursos = useRecursos();
  const [borrador, setBorrador] = useState(componente);
  const definicion = definicionTipo(borrador.tipo);
  const consulta = borrador.consultas[0];
  const recurso = recursos.find((r) => r.id === consulta?.recurso);

  // Un componente nuevo arranca con el primer recurso que el usuario puede ver (el
  // embudo, con el ciclo de venta).
  useEffect(() => {
    if (sinDatos(borrador.tipo) || consulta || recursos.length === 0) return;
    if (borrador.tipo === "embudo") {
      const ids = recursos.map((r) => r.id);
      setBorrador((b) => ({
        ...b,
        consultas: consultasEmbudo("ventas", "conteo", "este_año", ids),
        opciones: { ...b.opciones, circuito: "ventas" },
      }));
      return;
    }
    const inicial = recursoInicial(recursos);
    setBorrador((b) => ({ ...b, consultas: [consultaNueva(b, inicial)] }));
  }, [recursos, consulta, borrador.tipo]);

  const cambiar = (cambios: Partial<ComponenteDashboard>) =>
    setBorrador((b) => ({ ...b, ...cambios }));

  const cambiarConsulta = (cambios: Partial<ConsultaComponente>) =>
    setBorrador((b) => {
      const nueva = { ...b.consultas[0], ...cambios };
      // Sin periodo no hay con qué comparar.
      if (!nueva.periodo) delete nueva.comparar;
      Object.keys(nueva).forEach((k) => {
        const clave = k as keyof ConsultaComponente;
        if (nueva[clave] === undefined || nueva[clave] === "") delete nueva[clave];
      });
      return { ...b, consultas: [nueva as ConsultaComponente] };
    });

  const problema = problemaComponente(borrador);

  return (
    <QModal
      nombre="configurar-componente"
      titulo={`${componente.consultas.length || sinDatos(componente.tipo) ? t("dashboard.configurar") : t("dashboard.anadir")}: ${definicion.nombre}`}
      abierto={true}
      onCerrar={onCancelar}
      anchoEstable
    >
      <div className="configurar-componente">
        <div className="configurar-componente-formulario">
          <QInput
            label={t("dashboard.titulo")}
            nombre="titulo_componente"
            valor={borrador.titulo}
            maxLength={80}
            onChange={(titulo) => cambiar({ titulo })}
          />

          {borrador.tipo === "texto" && (
            <QTextArea
              label={t("dashboard.texto")}
              nombre="texto_componente"
              valor={borrador.opciones.texto ?? ""}
              onChange={(texto) => cambiar({ opciones: { ...borrador.opciones, texto } })}
            />
          )}

          {borrador.tipo === "embudo" && consulta && (
            <FormularioEmbudo
              componente={borrador}
              recursosPermitidos={recursos.map((r) => r.id)}
              onCambiar={cambiar}
            />
          )}

          {consulta && borrador.tipo !== "embudo" && (
            <FormularioDatos
              tipo={borrador.tipo}
              consulta={consulta}
              recurso={recurso}
              recursos={recursos}
              formato={borrador.opciones.formato}
              meta={borrador.opciones.meta}
              onRecurso={(nuevo) =>
                cambiar({ consultas: [consultaNueva(borrador, nuevo)] })
              }
              onConsulta={cambiarConsulta}
              onOpciones={(opciones) =>
                cambiar({ opciones: { ...borrador.opciones, ...opciones } })
              }
            />
          )}
        </div>

        <div className="configurar-componente-vista-previa" aria-label={t("dashboard.vistaPrevia")}>
          <span className="configurar-componente-etiqueta">{t("dashboard.vistaPreviaConDatosReales")}</span>
          <div
            className="configurar-componente-marco"
            style={{ height: `${Math.min(borrador.h, 10) * ALTO_FILA_DASHBOARD}px` }}
          >
            <Componente componente={borrador} espera={400} />
          </div>
        </div>
      </div>

      <footer className="configurar-componente-pie">
        <QBoton variante="borde" onClick={onCancelar}>
          {t("dashboard.cancelar")}
        </QBoton>
        <QBoton deshabilitado={problema !== null} onClick={() => onGuardar(borrador)}>
          {componente.consultas.length || sinDatos(componente.tipo) ? t("dashboard.aplicar") : t("dashboard.anadir")}
        </QBoton>
      </footer>
    </QModal>
  );
};

const FormularioDatos = ({
  tipo,
  consulta,
  recurso,
  recursos,
  formato,
  meta,
  onRecurso,
  onConsulta,
  onOpciones,
}: {
  tipo: ComponenteDashboard["tipo"];
  consulta: ConsultaComponente;
  recurso: RecursoAgregable | undefined;
  recursos: RecursoAgregable[];
  formato: FormatoValor | undefined;
  meta: number | undefined;
  onRecurso: (recurso: RecursoAgregable) => void;
  onConsulta: (cambios: Partial<ConsultaComponente>) => void;
  onOpciones: (opciones: { formato?: FormatoValor; meta?: number }) => void;
}) => {
  const fechas = recurso?.dimensiones.filter((d) => d.tipo === "fecha") ?? [];
  const categorias = recurso?.dimensiones.filter((d) => d.tipo !== "fecha") ?? [];
  // La primera métrica es la que se elige; el mapa añade detrás los clientes distintos.
  const [operacion, campo] = (consulta.metricas ?? "conteo").split(",")[0].split(":");
  const [dimension, granularidad] = leerAgrupacion(consulta.agrupar);
  const [dimensionPeriodo, rango] = leerPeriodo(consulta.periodo);
  const agrupaPorCategoria = ["barras", "circular", "ranking"].includes(tipo);
  const compara = tipo === "tarjeta" || tipo === "temporal";
  const columnas = (consulta.columnas ?? "").split(",").filter(Boolean);

  const cambiarMetrica = (nuevaOperacion: string, nuevoCampo?: string) => {
    const conCampo = OPERACIONES.find((o) => o.valor === nuevaOperacion)?.conCampo;
    const medida = nuevoCampo ?? campo ?? recurso?.medidas[0]?.id;
    const principal = conCampo && medida ? `${nuevaOperacion}:${medida}` : nuevaOperacion;
    onConsulta({
      metricas: tipo === "mapa" ? metricasMapa(principal, tieneClientes(recurso)) : principal,
    });
  };

  const alternarColumna = (id: string, marcada: boolean) => {
    const nuevas = marcada ? [...columnas, id] : columnas.filter((c) => c !== id);
    // El servidor solo ordena por columnas pedidas.
    const ordenValido = consulta.orden && nuevas.includes(consulta.orden.split(":")[0]);
    onConsulta({ columnas: nuevas.join(","), orden: ordenValido ? consulta.orden : undefined });
  };

  return (
    <>
      <QSelect
        label={tComun("dashboard.datosDe")}
        nombre="recurso_componente"
        valor={consulta.recurso}
        opciones={recursos.map((r) => opcion(r.id, r.descripcion.split(" (")[0].replace(/\.$/, "")))}
        onChange={(o) => {
          const nuevo = recursos.find((r) => r.id === o?.valor);
          if (nuevo) onRecurso(nuevo);
        }}
      />

      {tipo === "tabla" ? (
        <fieldset className="configurar-componente-columnas">
          <legend>{tComun("dashboard.columnas")}</legend>
          {[...categorias, ...fechas, ...(recurso?.medidas ?? [])].map((c) => (
            <QCheckbox
              key={c.id}
              label={c.descripcion}
              nombre={`columna_${c.id}`}
              valor={columnas.includes(c.id)}
              onChange={(valor) => alternarColumna(c.id, valor === "true")}
            />
          ))}
        </fieldset>
      ) : (
        <div className="configurar-componente-fila">
          <QSelect
            label={tComun("dashboard.medir")}
            nombre="operacion_componente"
            valor={operacion}
            opciones={OPERACIONES.filter((o) => o.conCampo ? (recurso?.medidas.length ?? 0) > 0 : true).map((o) => opcion(o.valor, o.descripcion))}
            onChange={(o) => o && cambiarMetrica(o.valor)}
          />
          {OPERACIONES.find((o) => o.valor === operacion)?.conCampo && (
            <QSelect
              label={tComun("dashboard.campo")}
              nombre="campo_componente"
              valor={campo ?? ""}
              opciones={(recurso?.medidas ?? []).map((m) => opcion(m.id, m.descripcion))}
              onChange={(o) => o && cambiarMetrica(operacion, o.valor)}
            />
          )}
        </div>
      )}

      {tipo === "temporal" && (
        <div className="configurar-componente-fila">
          <QSelect
            label={tComun("dashboard.ejeTemporal")}
            nombre="eje_componente"
            valor={dimension ?? ""}
            opciones={fechas.map((d) => opcion(d.id, d.descripcion))}
            onChange={(o) => o && onConsulta({ agrupar: `${o.valor}:${granularidad ?? "mes"}` })}
          />
          <QSelect
            label={tComun("dashboard.agruparPor")}
            nombre="granularidad_componente"
            valor={granularidad ?? "mes"}
            opciones={GRANULARIDADES.map((g) => opcion(g.valor, g.descripcion))}
            onChange={(o) => o && onConsulta({ agrupar: `${dimension ?? fechas[0]?.id}:${o.valor}` })}
          />
        </div>
      )}

      {tipo === "mapa" && (
        <QSelect
          label={tComun("dashboard.situarPor")}
          nombre="nivel_mapa_componente"
          valor={dimension ?? ""}
          placeholder={tComun("dashboard.esteDatoNoTieneProvincia")}
          opciones={categorias
            .filter((d) => d.id in DIMENSIONES_GEOGRAFICAS)
            .map((d) => opcion(d.id, d.id === "provincia" ? tComun("dashboard.provincia") : tComun("dashboard.comunidadAutonoma")))}
          onChange={(o) => o && onConsulta({ agrupar: o.valor })}
        />
      )}

      {agrupaPorCategoria && (
        <QSelect
          label={tComun("dashboard.agruparPor")}
          nombre="dimension_componente"
          valor={dimension ?? ""}
          placeholder={tComun("dashboard.eligeUnaDimension")}
          opciones={categorias.map((d) => opcion(d.id, d.descripcion))}
          onChange={(o) => o && onConsulta({ agrupar: o.valor, orden: undefined })}
        />
      )}

      {fechas.length > 0 && (
        <div className="configurar-componente-fila">
          <QSelect
            label={tComun("dashboard.periodo")}
            nombre="periodo_componente"
            valor={rango ?? SIN_PERIODO}
            opciones={[opcion(SIN_PERIODO, tComun("dashboard.todasLasFechas")), ...RANGOS_PERIODO.map((r) => opcion(r.valor, r.descripcion))]}
            onChange={(o) =>
              o && onConsulta({
                periodo: o.valor === SIN_PERIODO ? undefined : `${dimensionPeriodo ?? fechas[0].id}:${o.valor}`,
              })
            }
          />
          {fechas.length > 1 && rango && (
            <QSelect
              label={tComun("dashboard.segun")}
              nombre="dimension_periodo_componente"
              valor={dimensionPeriodo ?? ""}
              opciones={fechas.map((d) => opcion(d.id, d.descripcion))}
              onChange={(o) => o && onConsulta({ periodo: `${o.valor}:${rango}` })}
            />
          )}
        </div>
      )}

      {compara && rango && (
        <QSelect
          label={tComun("dashboard.compararCon")}
          nombre="comparar_componente"
          valor={consulta.comparar ?? SIN_COMPARAR}
          opciones={[
            opcion(SIN_COMPARAR, tComun("dashboard.noComparar")),
            opcion("periodo_anterior", tComun("dashboard.periodoAnterior")),
            opcion("año_anterior", tComun("dashboard.mismoPeriodoDelAnoAnterior")),
          ]}
          onChange={(o) =>
            o && onConsulta({
              comparar: o.valor === SIN_COMPARAR ? undefined : (o.valor as ConsultaComponente["comparar"]),
            })
          }
        />
      )}

      {(agrupaPorCategoria || tipo === "tabla") && (
        <QInput
          label={tipo === "tabla" ? tComun("dashboard.filas") : tComun("dashboard.cuantosMostrar")}
          nombre="limite_componente"
          tipo="entero"
          valor={String(consulta.limite ?? 10)}
          onChange={(valor) => {
            const limite = Number(valor);
            if (limite >= 1 && limite <= 100) onConsulta({ limite });
          }}
        />
      )}

      {tipo === "tabla" && columnas.length > 0 && (
        <QSelect
          label={tComun("dashboard.ordenarPor")}
          nombre="orden_componente"
          valor={consulta.orden ?? ""}
          placeholder={tComun("dashboard.ordenPorDefecto")}
          opciones={columnas.flatMap((c) => [
            opcion(`${c}:desc`, tComun("dashboard.cMayorPrimero", { c })),
            opcion(`${c}:asc`, tComun("dashboard.cMenorPrimero", { c })),
          ])}
          onChange={(o) => onConsulta({ orden: o?.valor || undefined })}
        />
      )}

      {tipo === "objetivo" && (
        <QInput
          label={tComun("dashboard.meta")}
          nombre="meta_componente"
          tipo="decimal"
          valor={meta ? String(meta) : ""}
          onChange={(valor) => onOpciones({ meta: Number(valor) || undefined })}
        />
      )}

      {tipo !== "tabla" && (
        <QSelect
          label={tComun("dashboard.formato")}
          nombre="formato_componente"
          valor={formato ?? formatoPorDefecto(consulta.metricas)}
          opciones={[opcion("moneda", tComun("dashboard.importe")), opcion("numero", tComun("dashboard.numero"))]}
          onChange={(o) => o && onOpciones({ formato: o.valor as FormatoValor })}
        />
      )}
    </>
  );
};

/** El embudo no se monta paso a paso: se elige el circuito, qué medir y el periodo. */
const FormularioEmbudo = ({
  componente,
  recursosPermitidos,
  onCambiar,
}: {
  componente: ComponenteDashboard;
  recursosPermitidos: string[];
  onCambiar: (cambios: Partial<ComponenteDashboard>) => void;
}) => {
  const circuito = componente.opciones.circuito ?? "ventas";
  const metricas = componente.consultas[0]?.metricas ?? "conteo";
  const [, rango] = leerPeriodo(componente.consultas[0]?.periodo);

  const rehacer = (nuevoCircuito: string, nuevasMetricas: string, nuevoRango: typeof rango) =>
    onCambiar({
      consultas: consultasEmbudo(nuevoCircuito, nuevasMetricas, nuevoRango, recursosPermitidos),
      opciones: {
        ...componente.opciones,
        circuito: nuevoCircuito,
        formato: nuevasMetricas === "conteo" ? "numero" : "moneda",
      },
    });

  return (
    <>
      <QSelect
        label={tComun("dashboard.circuito")}
        nombre="circuito_componente"
        valor={circuito}
        opciones={Object.entries(CIRCUITOS).map(([id, c]) => opcion(id, c.nombre))}
        onChange={(o) => o && rehacer(o.valor, metricas, rango)}
      />
      <QSelect
        label={tComun("dashboard.medir")}
        nombre="metrica_embudo_componente"
        valor={metricas}
        opciones={[opcion("conteo", tComun("dashboard.numeroDeDocumentos")), opcion("suma:total", tComun("dashboard.importeTotal"))]}
        onChange={(o) => o && rehacer(circuito, o.valor, rango)}
      />
      <QSelect
        label={tComun("dashboard.periodo")}
        nombre="periodo_embudo_componente"
        valor={rango ?? SIN_PERIODO}
        opciones={[opcion(SIN_PERIODO, tComun("dashboard.todasLasFechas")), ...RANGOS_PERIODO.map((r) => opcion(r.valor, r.descripcion))]}
        onChange={(o) =>
          o && rehacer(circuito, metricas, o.valor === SIN_PERIODO ? undefined : (o.valor as typeof rango))
        }
      />
    </>
  );
};
