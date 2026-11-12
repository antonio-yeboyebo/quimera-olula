import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { FilaMultinivel, QTablaMultinivel } from "@olula/componentes/atomos/qtablamultinivel.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { onGlobalServerSentEvent } from "@olula/lib/api/server_sent_events_session.ts";
import { formatearFechaHora, plugin, puede } from "@olula/lib/dominio.ts";
import { useEffect, useState } from "react";
import { CodigoMiembro, Cubo, PeticionPivot, Presentacion } from "../../diseño.ts";
import {
    cargaTerminadaDesdeEvento,
    columnasTabla,
    filasTabla,
    medidaDeColumna,
    nivelesCubo,
    ordenTrasPulsar,
} from "../../dominio.ts";
import { getMaquina } from "./maquina.ts";
import { contextoNavegadorInicial } from "./navegador.ts";
import { BotonAccion } from "./BotonAccion.tsx";
import { BotoneraTiempo } from "./BotoneraTiempo.tsx";
import { GestionVistas } from "./GestionVistas.tsx";
import { Grafico } from "./Grafico.tsx";
import "./Navegador.css";
import { OpcionesPivot } from "./OpcionesPivot.tsx";
import { PanelEjes } from "./PanelEjes.tsx";
import { RecargarCubo } from "./RecargarCubo.tsx";

const recargando = (cubo: Cubo) => cubo.estadoCarga?.estado === "pendiente" || cubo.estadoCarga?.estado === "en_curso";

const textoCarga = (cubo: Cubo) => {
    const { ultimaCarga, estadoCarga } = cubo;
    if (recargando(cubo)) return "Recarga en curso";
    const ultima = ultimaCarga ? `Última carga: ${formatearFechaHora(ultimaCarga.fecha)}` : "Sin cargar";
    return estadoCarga?.estado === "error" ? `${ultima} · La última recarga falló` : ultima;
};

export const Navegador = () => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoNavegadorInicial);
    const [cargando, setCargando] = useState(false);
    const [pidiendoRecarga, setPidiendoRecarga] = useState(false);
    const { estado, cubos, cubo, peticion, arbol, presentacion, truncado, historial, vistas, vista } = ctx;
    const { medidasEnColumnas, verGrafico, tipoGrafico } = presentacion;

    const avisoSse = plugin("eventos_sse") === "activo";

    useEffect(() => {
        emitir("iniciado", undefined, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!avisoSse || estado !== "NAVEGANDO") return;
        return onGlobalServerSentEvent("analisis.carga.terminada", (evento) => {
            const carga = cargaTerminadaDesdeEvento(evento.data);
            if (carga) emitir("carga_terminada", carga);
        });
    }, [avisoSse, estado, emitir]);

    if (estado === "SIN_CUBOS") {
        return (
            <div className="analisis-navegador">
                <p className="analisis-vacio">No tienes acceso a ningún cubo de análisis.</p>
            </div>
        );
    }
    if (!cubo || !peticion || !arbol) return <div className="analisis-navegador" aria-busy="true" />;

    const consultar = async (evento: string, payload?: unknown) => {
        setCargando(true);
        try {
            await emitir(evento, payload);
        } finally {
            setCargando(false);
        }
    };

    const cambiar = (nueva: PeticionPivot) => consultar("peticion_cambiada", nueva);
    const presentar = (cambios: Partial<Presentacion>) => emitir("presentacion_cambiada", cambios);
    const medidas = cubo.medidas.filter((m) => peticion.medidas.includes(m.id));
    const niveles = nivelesCubo(cubo);
    const etiquetaFilas =
        peticion.filas.map((ref) => niveles.find((n) => n.ref === ref)?.descripcion ?? ref).join(" / ") || "Total";
    const medidaUnica = medidasEnColumnas && medidas.length === 1 && peticion.columnas.length > 0;
    const cabeceraEtiqueta = medidaUnica ? `${etiquetaFilas} · ${medidas[0].descripcion}` : etiquetaFilas;

    const alternar = (fila: FilaMultinivel) => {
        const codigos = JSON.parse(fila.id) as CodigoMiembro[];
        consultar("nodo_alternado", codigos.map((codigo) => ({ codigo, etiqueta: "" })));
    };

    const ordenar = (columnaId: string) => {
        const medida = medidaDeColumna(columnaId);
        if (medida) cambiar({ ...peticion, orden: ordenTrasPulsar(peticion.orden, medida) });
    };

    const ordenTabla = peticion.orden && medidasEnColumnas
        ? [`${JSON.stringify([])}|${peticion.orden.por}`, peticion.orden.sentido.toUpperCase()]
        : [];

    return (
        <div className="analisis-navegador">
            <header className="analisis-cabecera">
                <div className="analisis-cabecera-cubo">
                    <QSelect
                        label="Cubo"
                        nombre="cubo"
                        valor={cubo.id}
                        opciones={cubos.map((c) => ({ valor: c.id, descripcion: c.descripcion }))}
                        onChange={(opcion) => opcion && consultar("cubo_cambiado", opcion.valor)}
                    />
                    <div className="analisis-carga">
                        <span data-estado={cubo.estadoCarga?.estado ?? ""}>{textoCarga(cubo)}</span>
                        {recargando(cubo) && !avisoSse && (
                            <BotonAccion
                                icono="rehacer"
                                texto="Actualizar estado"
                                soloIcono
                                onClick={() => emitir("catalogo_refrescado")}
                            />
                        )}
                        {puede("analisis.carga") && !recargando(cubo) && (
                            <BotonAccion icono="rehacer" texto="Recargar" onClick={() => setPidiendoRecarga(true)} />
                        )}
                    </div>
                </div>
                <GestionVistas
                    vistas={vistas}
                    vista={vista}
                    emitir={(evento, payload) => consultar(evento, payload)}
                />
                <div className="analisis-acciones">
                    <BotonAccion
                        icono="atras"
                        texto="Atrás"
                        soloIcono
                        deshabilitado={!historial || historial.posicion === 0}
                        onClick={() => consultar("historial_atras")}
                    />
                    <BotonAccion
                        icono="adelante"
                        texto="Adelante"
                        soloIcono
                        deshabilitado={!historial || historial.posicion === historial.peticiones.length - 1}
                        onClick={() => consultar("historial_adelante")}
                    />
                    {/* <BotonAccion
                        icono={verGrafico ? "tabla" : "grafico_barras"}
                        texto={verGrafico ? "Ver tabla" : "Ver gráfico"}
                        onClick={() => presentar({ verGrafico: !verGrafico })}
                    /> */}
                    <BotonAccion icono="descargar" texto="Exportar a Excel" onClick={() => emitir("exportacion_solicitada")} />
                </div>
            </header>
            <aside className="analisis-panel">
                <PanelEjes cubo={cubo} peticion={peticion} onCambio={cambiar} />
                <BotoneraTiempo cubo={cubo} peticion={peticion} onCambio={cambiar} />
                <OpcionesPivot
                    cubo={cubo}
                    peticion={peticion}
                    medidasEnColumnas={medidasEnColumnas}
                    onCambio={cambiar}
                    onAlternarMedidasEnColumnas={() => presentar({ medidasEnColumnas: !medidasEnColumnas })}
                />
            </aside>
            <main className="analisis-resultado">
                {truncado && (
                    <QAviso variante="advertencia">
                        El resultado supera el tope del cubo y se muestra recortado. Filtra o quita niveles para verlo entero.
                    </QAviso>
                )}
                {verGrafico ? (
                    <Grafico
                        arbol={arbol}
                        medida={medidas[0]}
                        peticion={peticion}
                        tipo={tipoGrafico}
                        onTipo={(tipo) => presentar({ tipoGrafico: tipo })}
                    />
                ) : (
                    <QTablaMultinivel
                        cabeceraEtiqueta={cabeceraEtiqueta}
                        columnas={columnasTabla(arbol.columnas, medidas, peticion.columnas.length, medidasEnColumnas)}
                        filas={filasTabla(arbol, medidas, peticion.filas.length, medidasEnColumnas)}
                        orden={ordenTabla}
                        onOrdenar={ordenar}
                        cargando={cargando}
                        onAlternar={alternar}
                    />
                )}
            </main>
            {pidiendoRecarga && (
                <RecargarCubo
                    cubo={cubo}
                    avisoAutomatico={avisoSse}
                    onAceptar={(ejercicios) => {
                        setPidiendoRecarga(false);
                        emitir("recarga_solicitada", ejercicios);
                    }}
                    onCerrar={() => setPidiendoRecarga(false)}
                />
            )}
        </div>
    );
};
