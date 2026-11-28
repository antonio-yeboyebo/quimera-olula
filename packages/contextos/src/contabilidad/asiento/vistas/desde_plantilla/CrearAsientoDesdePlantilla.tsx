import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.ts";
import { SubcuentaSelector } from "#/contabilidad/comun/componentes/SubcuentaSelector.tsx";
import {
    PartidaPlantilla,
    PlantillaAsiento,
    ResultadoCalculoPlantilla,
    ValoresPartidaPlantilla,
    ValoresPlantilla,
} from "#/contabilidad/plantilla_asiento/diseño.ts";
import {
    camposPedidos,
    etiquetaPlantilla,
    partidasOrdenadas,
    pideAlgo,
    totalesCalculo,
} from "#/contabilidad/plantilla_asiento/dominio.ts";
import {
    calcularAsientoDesdePlantilla,
    getPlantillaAsiento,
    getPlantillasAsiento,
    postAsientoDesdePlantilla,
} from "#/contabilidad/plantilla_asiento/infraestructura.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import "./CrearAsientoDesdePlantilla.css";
import { tContabilidad, useTContabilidad } from "../../../i18n/index.ts";

type Opcion = { valor: string; descripcion: string };

const formatear = (n: number) =>
    n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const numero = (texto: string): number | undefined => {
    const limpio = texto.trim().replace(",", ".");
    if (!limpio) return undefined;
    const valor = Number(limpio);
    return Number.isNaN(valor) ? undefined : valor;
};

/**
 * Asiento desde una plantilla (Eneboo: botón "Predefinido" del asiento y
 * acción `co_partidaspre`). Eneboo pregunta partida a partida; aquí se piden
 * a la vez los datos que la plantilla marca como "Pedir", se calcula el
 * asiento en el servidor para revisarlo y luego se crea. Si la plantilla
 * concatena con otra, se ofrece el siguiente asiento con las mismas
 * variables, como en Eneboo.
 *
 * Emite: "asiento_desde_plantilla_creado" (id) por cada asiento creado y al
 * terminar "asiento_creado" (id del último) o "alta_de_asiento_cancelada".
 */
export const CrearAsientoDesdePlantilla = ({
    publicar,
    ejercicioId,
}: {
    publicar: EmitirEvento;
    ejercicioId: string;
}) => {
    const tx = useTContabilidad();
    const { intentar } = useContext(ContextoError);

    const [opciones, setOpciones] = useState<Opcion[]>([]);
    const [plantillaId, setPlantillaId] = useState("");
    const [plantilla, setPlantilla] = useState<PlantillaAsiento | null>(null);
    const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
    const [concepto, setConcepto] = useState("");
    const [valores, setValores] = useState<ValoresPlantilla>({});
    const [textos, setTextos] = useState<Record<string, string>>({});
    const [variables, setVariables] = useState<Record<string, string>>({});
    const [resultado, setResultado] = useState<ResultadoCalculoPlantilla | null>(null);
    const [ocupado, setOcupado] = useState(false);
    const [ultimoAsientoId, setUltimoAsientoId] = useState<string | null>(null);
    const [creados, setCreados] = useState(0);

    useEffect(() => {
        getPlantillasAsiento({
            ...criteriaDefecto,
            orden: ["id", "ASC"],
            paginacion: { pagina: 1, limite: 200 },
        }).then(({ datos }) =>
            setOpciones(datos.map((p) => ({ valor: p.id, descripcion: etiquetaPlantilla(p) })))
        );
    }, []);

    useEffect(() => {
        setPlantilla(null);
        setValores({});
        setTextos({});
        setResultado(null);
        if (!plantillaId) return;
        intentar(async () => setPlantilla(await getPlantillaAsiento(plantillaId)));
    }, [plantillaId, intentar]);

    const partidas = useMemo(
        () => (plantilla ? partidasOrdenadas(plantilla) : []),
        [plantilla]
    );

    const cambiarValor = (partidaId: string, cambios: ValoresPartidaPlantilla) => {
        setResultado(null);
        setValores((previos) => ({
            ...previos,
            [partidaId]: { ...previos[partidaId], ...cambios },
        }));
    };

    const cambiarNumero = (partidaId: string, campo: "importe" | "baseImponible", texto: string) => {
        setTextos((previos) => ({ ...previos, [`${partidaId}.${campo}`]: texto }));
        cambiarValor(partidaId, { [campo]: numero(texto) });
    };

    const peticion = () => ({
        plantillaId,
        ejercicioId,
        fecha: new Date(`${fecha}T12:00:00`),
        concepto,
        valores,
        variables,
    });

    const calcular = useCallback(async () => {
        setOcupado(true);
        await intentar(
            async () => setResultado(await calcularAsientoDesdePlantilla(peticion())),
            () => {}
        );
        setOcupado(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [plantillaId, ejercicioId, fecha, concepto, valores, variables, intentar]);

    const terminar = useCallback(
        (id: string | null) => {
            if (id) publicar("asiento_creado", id);
            else publicar("alta_de_asiento_cancelada");
        },
        [publicar]
    );

    const crear = useCallback(async () => {
        if (!resultado) return;
        setOcupado(true);
        await intentar(
            async () => {
                const { id } = await postAsientoDesdePlantilla(peticion());
                setUltimoAsientoId(id);
                setCreados((n) => n + 1);
                const siguiente = resultado.siguientePlantillaId;
                if (siguiente) {
                    // Concatenar: se sigue con la siguiente plantilla y las
                    // variables del asiento recién creado.
                    publicar("asiento_desde_plantilla_creado", id);
                    setVariables(resultado.variables);
                    setConcepto("");
                    setPlantillaId(siguiente);
                } else {
                    terminar(id);
                }
            },
            () => {}
        );
        setOcupado(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resultado, plantillaId, ejercicioId, fecha, concepto, valores, variables, intentar, publicar, terminar]);

    const cuadrado = !!resultado && Math.abs(resultado.descuadre) < 0.005;
    const totales = resultado ? totalesCalculo(resultado.partidas) : null;

    return (
        <QModal
            abierto={true}
            nombre="crearAsientoDesdePlantilla"
            titulo={creados > 0 ? tx("asiento.siguienteAsientoCreadosCreadoS", { creados }) : tx("asiento.asientoDesdePlantilla")}
            onCerrar={() => terminar(ultimoAsientoId)}
        >
            <div className="CrearAsientoDesdePlantilla">
                <quimera-formulario>
                    <QInput label={tx("asiento.ejercicio")} nombre="ejercicioId" valor={ejercicioId} soloLectura />
                    <QSelect
                        label={tx("asiento.plantilla")}
                        nombre="plantillaId"
                        valor={plantillaId}
                        opciones={opciones}
                        onChange={(opcion) => setPlantillaId(opcion?.valor ?? "")}
                    />
                    <QInput
                        label={tx("asiento.fecha")}
                        nombre="fecha"
                        tipo="fecha"
                        valor={fecha}
                        onChange={(v) => {
                            setFecha(v);
                            setResultado(null);
                        }}
                    />
                    <QInput
                        label={tx("asiento.conceptoDelAsientoVacioElDe")}
                        nombre="concepto"
                        valor={concepto}
                        onChange={(v) => setConcepto(v)}
                        opcional
                    />
                </quimera-formulario>

                {plantilla && (
                    <DatosPedidos
                        partidas={partidas}
                        ejercicioId={ejercicioId}
                        valores={valores}
                        textos={textos}
                        cambiarValor={cambiarValor}
                        cambiarNumero={cambiarNumero}
                        cambiarTexto={(clave, texto) => setTextos((previos) => ({ ...previos, [clave]: texto }))}
                    />
                )}

                {resultado && (
                    <div className="resultado">
                        <table>
                            <thead>
                                <tr>
                                    <th>{tx("asiento.n")}</th>
                                    <th>{tx("asiento.subcuenta")}</th>
                                    <th>{tx("asiento.debe")}</th>
                                    <th>{tx("asiento.haber")}</th>
                                    <th>{tx("asiento.concepto")}</th>
                                    <th>{tx("asiento.contrapartida")}</th>
                                    <th>{tx("asiento.baseIva")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultado.partidas.map((p) => (
                                    <tr key={p.partidaPlantillaId} className={p.omitida ? "omitida" : ""}>
                                        <td>{p.numeroOrden}</td>
                                        <td>{p.codigoSubcuenta}</td>
                                        <td className="importe">{formatear(p.debe)}</td>
                                        <td className="importe">{formatear(p.haber)}</td>
                                        <td>{p.omitida ? tx("asiento.seOmiteImporteCero") : p.concepto}</td>
                                        <td>{p.codigoContrapartida}</td>
                                        <td className="importe">
                                            {p.esIva && p.baseImponible !== null ? formatear(p.baseImponible) : ""}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            {totales && (
                                <tfoot>
                                    <tr>
                                        <td colSpan={2}>{tx("asiento.total")}</td>
                                        <td className="importe">{formatear(totales.debe)}</td>
                                        <td className="importe">{formatear(totales.haber)}</td>
                                        <td colSpan={3}>
                                            {cuadrado
                                                ? tx("asiento.cuadrado")
                                                : tx("asiento.descuadreDescuadre", { descuadre: formatear(resultado.descuadre) })}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                        {resultado.avisos.map((aviso) => (
                            <p key={aviso} className="aviso">{aviso}</p>
                        ))}
                        {resultado.siguientePlantillaId && (
                            <p className="aviso">
                                {tx("asiento.alCrearloSePropondraElSiguiente")}{" "}
                                {resultado.siguientePlantillaId}.
                            </p>
                        )}
                    </div>
                )}

                <div className="botones maestro-botones">
                    <QBoton onClick={calcular} deshabilitado={!plantilla || ocupado} variante="borde">
                        {tx("asiento.calcular")}
                    </QBoton>
                    <QBoton onClick={crear} deshabilitado={!cuadrado || ocupado}>
                        {tx("asiento.crearAsiento")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};

const DatosPedidos = ({
    partidas,
    ejercicioId,
    valores,
    textos,
    cambiarValor,
    cambiarNumero,
    cambiarTexto,
}: {
    partidas: PartidaPlantilla[];
    ejercicioId: string;
    valores: ValoresPlantilla;
    textos: Record<string, string>;
    cambiarValor: (partidaId: string, cambios: ValoresPartidaPlantilla) => void;
    cambiarNumero: (partidaId: string, campo: "importe" | "baseImponible", texto: string) => void;
    cambiarTexto: (clave: string, texto: string) => void;
}) => {
    const conDatos = partidas.filter(pideAlgo);
    if (conDatos.length === 0) {
        return <p>{tContabilidad("asiento.laPlantillaNoPideDatosPulse")}</p>;
    }
    return (
        <div className="datos-pedidos">
            {conDatos.map((partida) => {
                const pedidos = camposPedidos(partida);
                const v = valores[partida.id] ?? {};
                return (
                    <fieldset key={partida.id}>
                        <legend>
                            {tContabilidad("asiento.partidaNumeroordenDebehaber", { numeroOrden: partida.numeroOrden, debeHaber: partida.debeHaber })}
                        </legend>
                        <quimera-formulario>
                            {pedidos.subcuenta && (
                                <SubcuentaSelector
                                    ejercicioId={ejercicioId}
                                    label={tContabilidad("asiento.subcuentaValor", { valor: partida.codigoSubcuenta ? ` (${partida.codigoSubcuenta}…)` : "" })}
                                    nombre={`subcuenta_${partida.id}`}
                                    valor={textos[`${partida.id}.subcuenta`] ?? ""}
                                    descripcion={v.codigoSubcuenta ?? ""}
                                    onChange={(op) => {
                                        cambiarTexto(`${partida.id}.subcuenta`, op?.valor ?? "");
                                        cambiarValor(partida.id, { codigoSubcuenta: op?.descripcion ?? undefined });
                                    }}
                                />
                            )}
                            {pedidos.importe && (
                                <QInput
                                    label={tContabilidad("asiento.importe")}
                                    nombre={`importe_${partida.id}`}
                                    valor={textos[`${partida.id}.importe`] ?? ""}
                                    onChange={(t) => cambiarNumero(partida.id, "importe", t)}
                                />
                            )}
                            {pedidos.concepto && (
                                <QInput
                                    label={tContabilidad("asiento.concepto")}
                                    nombre={`concepto_${partida.id}`}
                                    valor={v.concepto ?? partida.concepto}
                                    onChange={(t) => cambiarValor(partida.id, { concepto: t })}
                                />
                            )}
                            {pedidos.documento && (
                                <QInput
                                    label={tContabilidad("asiento.documento")}
                                    nombre={`documento_${partida.id}`}
                                    valor={v.documento ?? partida.documento}
                                    onChange={(t) => cambiarValor(partida.id, { documento: t })}
                                />
                            )}
                            {pedidos.contrapartida && (
                                <SubcuentaSelector
                                    ejercicioId={ejercicioId}
                                    label={tContabilidad("asiento.contrapartida")}
                                    nombre={`contrapartida_${partida.id}`}
                                    valor={textos[`${partida.id}.contrapartida`] ?? ""}
                                    descripcion={v.codigoContrapartida ?? ""}
                                    onChange={(op) => {
                                        cambiarTexto(`${partida.id}.contrapartida`, op?.valor ?? "");
                                        cambiarValor(partida.id, { codigoContrapartida: op?.descripcion ?? undefined });
                                    }}
                                />
                            )}
                            {pedidos.baseImponible && (
                                <QInput
                                    label={tContabilidad("asiento.baseImponibleSiEsDeIva")}
                                    nombre={`base_${partida.id}`}
                                    valor={textos[`${partida.id}.baseImponible`] ?? ""}
                                    onChange={(t) => cambiarNumero(partida.id, "baseImponible", t)}
                                />
                            )}
                            {pedidos.numeroFactura && (
                                <QInput
                                    label={tContabilidad("asiento.nDeFacturaSiEsDe")}
                                    nombre={`factura_${partida.id}`}
                                    valor={v.numeroFactura ?? ""}
                                    onChange={(t) => cambiarValor(partida.id, { numeroFactura: t })}
                                />
                            )}
                        </quimera-formulario>
                    </fieldset>
                );
            })}
        </div>
    );
};
