import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCargando } from "@olula/componentes/atomos/qcargando.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { formatearNumero } from "@olula/lib/dominio.ts";
import { useCallback, useContext, useState } from "react";
import { Inventario, OpcionesCargaFichero, ResultadoCargaFichero } from "../diseño.ts";
import { postFicheroInventario } from "../infraestructura.ts";
import "./CargarFicheroInventario.css";
import {
    EXTENSIONES_FICHERO,
    ficheroDesdeTexto,
    formatoFichero,
    opcionesCargaIniciales,
    opcionesSeparador,
    resumenCarga,
    separadorAOpcion,
    separadorDesdeOpcion,
} from "./cargar_fichero.ts";
import { tAlmacen, useTAlmacen } from "../../i18n/index.ts";

type Accion = "simular" | "cargar" | "cargar_validas";

const opcionesAccion: Record<Accion, Partial<OpcionesCargaFichero>> = {
    simular: { simular: true, omitirRechazadas: false },
    cargar: { simular: false, omitirRechazadas: false },
    cargar_validas: { simular: false, omitirRechazadas: true },
};

/**
 * Carga de lecturas en el inventario desde un fichero CSV/TXT, XLSX u ODS
 * (o pegadas a mano como `referencia|cantidad|ubicación`). Columnas por
 * cabecera (referencia, cantidad, ubicación, lote) o por posición como en
 * Eneboo. El servidor valida todas las filas: si alguna se rechaza no graba
 * nada salvo que se pida cargar solo las válidas. Las lecturas de un mismo
 * artículo se suman en su línea.
 */
export const CargarFicheroInventario = ({
    inventario,
    publicar,
}: {
    inventario: Inventario;
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const { intentar } = useContext(ContextoError);
    const [fichero, setFichero] = useState<File | null>(null);
    const [texto, setTexto] = useState("");
    const [opciones, setOpciones] = useState<OpcionesCargaFichero>(opcionesCargaIniciales);
    const [resultado, setResultado] = useState<ResultadoCargaFichero | null>(null);
    const [simulado, setSimulado] = useState(false);
    const [cargado, setCargado] = useState(false);
    const [enviando, setEnviando] = useState(false);

    const origen = fichero ?? (texto.trim() ? ficheroDesdeTexto(texto) : null);
    const esTexto = origen ? formatoFichero(origen.name) === "texto" : true;
    const formatoNoValido = fichero !== null && formatoFichero(fichero.name) === null;

    const onFichero = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFichero(e.target.files?.[0] ?? null);
        setResultado(null);
    }, []);

    const enviar = useCallback(
        async (accion: Accion) => {
            if (!origen) return;
            setEnviando(true);
            try {
                const respuesta = await intentar(() =>
                    postFicheroInventario(inventario.id, origen, { ...opciones, ...opcionesAccion[accion] })
                );
                setResultado(respuesta);
                setSimulado(accion === "simular");
                if (respuesta.cargado) setCargado(true);
            } catch {
                // El error ya se muestra en el modal de error.
            } finally {
                setEnviando(false);
            }
        },
        [origen, opciones, inventario.id, intentar]
    );

    // Si algo se ha grabado, al cerrar se refresca el inventario.
    const cerrar = useCallback(() => {
        if (enviando) return;
        publicar(cargado ? "fichero_cargado" : "carga_de_fichero_cancelada", resultado);
    }, [enviando, cargado, resultado, publicar]);

    const hayRechazadas = (resultado?.rechazadas.length ?? 0) > 0;
    const puedeEnviar = !!origen && !formatoNoValido && !enviando && !resultado?.cargado;

    return (
        <QModal
            abierto={true}
            nombre="cargarFicheroInventario"
            titulo={t("inventario.cargarLecturasEnElInventarioId", { id: inventario.id })}
            onCerrar={cerrar}
        >
            <div className="CargarFicheroInventario">
                <p>
                    {t("inventario.ficheroCsvTxtXlsxUOds")}
                </p>
                <label className="selector-fichero">
                    <span>{t("inventario.fichero")}</span>
                    <input
                        type="file"
                        name="fichero"
                        accept={EXTENSIONES_FICHERO.join(",")}
                        onChange={onFichero}
                    />
                </label>
                {formatoNoValido && (
                    <p className="error-fichero">{t("inventario.formatoNoAdmitidoUseCsvTxt")}</p>
                )}
                {!fichero && (
                    <QTextArea
                        label={t("inventario.oPegueLasLecturasReferenciaCantidad")}
                        nombre="texto"
                        rows={4}
                        valor={texto}
                        onChange={(valor) => {
                            setTexto(valor);
                            setResultado(null);
                        }}
                    />
                )}
                <quimera-formulario>
                    <QSelect
                        label={t("inventario.separadorCsvTxt")}
                        nombre="separador"
                        valor={separadorAOpcion(opciones.separador)}
                        opciones={opcionesSeparador}
                        deshabilitado={!esTexto}
                        onChange={(opcion) =>
                            setOpciones({ ...opciones, separador: separadorDesdeOpcion(opcion?.valor) })
                        }
                    />
                    <QCheckbox
                        label={t("inventario.ignorarPrimeraLineaSinCabecera")}
                        nombre="ignorarPrimeraLinea"
                        valor={opciones.ignorarPrimeraLinea}
                        onChange={(valor) => setOpciones({ ...opciones, ignorarPrimeraLinea: valor === "true" })}
                    />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton variante="borde" onClick={() => enviar("simular")} deshabilitado={!puedeEnviar}>
                        {t("inventario.simular")}
                    </QBoton>
                    <QBoton onClick={() => enviar("cargar")} deshabilitado={!puedeEnviar}>
                        {t("inventario.cargar")}
                    </QBoton>
                    {hayRechazadas && !resultado?.cargado && (resultado?.lecturas ?? 0) > 0 && (
                        <QBoton advertencia onClick={() => enviar("cargar_validas")} deshabilitado={!puedeEnviar}>
                            {t("inventario.cargarSoloLasValidas")}
                        </QBoton>
                    )}
                    {cargado && <QBoton variante="texto" onClick={cerrar}>{t("inventario.cerrar")}</QBoton>}
                </div>

                {resultado && <ResultadoCarga resultado={resultado} simulado={simulado} />}
            </div>
            <QCargando visible={enviando} mensaje={t("inventario.procesandoFichero")} />
        </QModal>
    );
};

const ResultadoCarga = ({
    resultado,
    simulado,
}: {
    resultado: ResultadoCargaFichero;
    simulado: boolean;
}) => (
    <div className="ResultadoCargaInventario">
        <p className={resultado.cargado ? "resumen-carga cargado" : "resumen-carga"}>
            {resumenCarga(resultado, simulado)}
        </p>
        {resultado.rechazadas.length > 0 && (
            <>
                <h5>{tAlmacen("inventario.filasRechazadas")}</h5>
                <table className="tabla-rechazadas">
                    <thead>
                        <tr>
                            <th className="numero">{tAlmacen("inventario.fila")}</th>
                            <th>{tAlmacen("inventario.referencia")}</th>
                            <th>{tAlmacen("inventario.cantidad")}</th>
                            <th>{tAlmacen("inventario.motivo")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resultado.rechazadas.map((r) => (
                            <tr key={`${r.linea}-${r.referencia}`}>
                                <td className="numero">{r.linea}</td>
                                <td>{r.referencia}</td>
                                <td>{r.cantidad}</td>
                                <td>{r.motivo}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </>
        )}
        {resultado.articulos.length > 0 && (
            <>
                <h5>{resultado.cargado ? tAlmacen("inventario.articulosCargados") : tAlmacen("inventario.articulosValidos")}</h5>
                <table className="tabla-articulos">
                    <thead>
                        <tr>
                            <th>{tAlmacen("inventario.referencia")}</th>
                            <th>{tAlmacen("inventario.descripcion")}</th>
                            <th className="numero">{tAlmacen("inventario.lecturas")}</th>
                            <th className="numero">{tAlmacen("inventario.cantidad")}</th>
                            <th className="numero">{tAlmacen("inventario.stockActual")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resultado.articulos.map((a) => (
                            <tr key={a.articuloId}>
                                <td>{a.articuloId}</td>
                                <td>{a.descripcion ?? ""}</td>
                                <td className="numero">{formatearNumero(a.lecturas)}</td>
                                <td className="numero">{formatearNumero(a.cantidad)}</td>
                                <td className="numero">{formatearNumero(a.cantidadActual)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </>
        )}
    </div>
);
