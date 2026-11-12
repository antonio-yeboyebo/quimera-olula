import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useEffect, useRef } from "react";
import {
    OpcionSubcuenta,
    SubcuentaSelector,
} from "#/contabilidad/comun/componentes/SubcuentaSelector.tsx";
import { PartidaManualInput } from "../../diseño.ts";
import {
    asientoCuadrado,
    descuadrePartidas,
    partidaManualVacia,
    totalDebe,
    totalHaber,
} from "../../dominio.ts";
import "./EditorPartidasManual.css";

export const EditorPartidasManual = ({
    partidas,
    ejercicioId,
    onChange,
}: {
    partidas: PartidaManualInput[];
    ejercicioId: string;
    onChange: (partidas: PartidaManualInput[]) => void;
}) => {
    const actualizar = (
        index: number,
        campo: keyof PartidaManualInput,
        valor: string | number | boolean
    ) => {
        const copia = partidas.map((p, i) =>
            i === index ? { ...p, [campo]: valor } : p
        );
        onChange(copia);
    };

    // Que la partida sea de IVA lo decide la subcuenta, no quien edita: su
    // cuenta especial (IVASOP / IVAREP), igual que el ERP en co_partidas.qs.
    const actualizarSubcuenta = (
        index: number,
        opcion: OpcionSubcuenta | null
    ) => {
        const copia = partidas.map((p, i) =>
            i === index
                ? {
                      ...p,
                      subcuentaId: opcion ? Number(opcion.valor) : 0,
                      codigoSubcuenta: opcion?.descripcion ?? "",
                      esIva: opcion?.esIva ?? false,
                  }
                : p
        );
        onChange(copia);
    };

    // Al añadir una partida el cursor va a su subcuenta: es lo primero que se
    // rellena y así se encadenan partidas sin tocar el ratón.
    const contenedor = useRef<HTMLDivElement>(null);
    const partidaAEnfocar = useRef<number | null>(null);

    useEffect(() => {
        const indice = partidaAEnfocar.current;
        if (indice === null) return;
        partidaAEnfocar.current = null;
        contenedor.current
            ?.querySelector<HTMLInputElement>(
                `quimera-autocompletar[nombre="subcuenta-${indice}"] input:not([type="hidden"])`
            )
            ?.focus();
    }, [partidas.length]);

    const anadir = () => {
        partidaAEnfocar.current = partidas.length;
        onChange([...partidas, partidaManualVacia()]);
    };
    const quitar = (index: number) => {
        if (partidas.length <= 2) return;
        onChange(partidas.filter((_, i) => i !== index));
    };

    const cuadrado = asientoCuadrado(partidas);
    const descuadre = descuadrePartidas(partidas);

    return (
        <div className="EditorPartidasManual" ref={contenedor}>
            <table>
                {/* Anchos fijos: si no, cada celda se auto-dimensiona y las
                    columnas no cuadran de una partida a otra. */}
                <colgroup>
                    <col className="col-subcuenta" />
                    <col className="col-importe" />
                    <col className="col-importe" />
                    <col className="col-concepto" />
                    <col className="col-iva" />
                    <col className="col-acciones" />
                </colgroup>
                <thead>
                    <tr>
                        <th>Subcuenta</th>
                        <th>Debe</th>
                        <th>Haber</th>
                        <th>Concepto</th>
                        <th>IVA</th>
                        <th />
                    </tr>
                </thead>
                {partidas.map((p, i) => (
                    // Una tbody por partida: agrupa su fila con la de IVA y deja
                    // poner la línea separadora entre partidas, no dentro de una.
                    <tbody key={i}>
                        <tr className="EditorPartidasManual-filaPartida">
                            <td>
                                <SubcuentaSelector
                                    label=""
                                    nombre={`subcuenta-${i}`}
                                    ejercicioId={ejercicioId}
                                    valor={
                                        p.subcuentaId > 0
                                            ? String(p.subcuentaId)
                                            : ""
                                    }
                                    descripcion={p.codigoSubcuenta ?? ""}
                                    onChange={(opcion) =>
                                        actualizarSubcuenta(i, opcion)
                                    }
                                />
                            </td>
                            <td>
                                <QInput
                                    label=""
                                    nombre={`debe-${i}`}
                                    tipo="decimal"
                                    valor={String(p.debe)}
                                    onChange={(v) =>
                                        actualizar(i, "debe", Number(v) || 0)
                                    }
                                />
                            </td>
                            <td>
                                <QInput
                                    label=""
                                    nombre={`haber-${i}`}
                                    tipo="decimal"
                                    valor={String(p.haber)}
                                    onChange={(v) =>
                                        actualizar(i, "haber", Number(v) || 0)
                                    }
                                />
                            </td>
                            <td>
                                <QInput
                                    label=""
                                    nombre={`concepto-${i}`}
                                    valor={p.concepto}
                                    onChange={(v) =>
                                        actualizar(i, "concepto", v)
                                    }
                                    opcional
                                />
                            </td>
                            <td>
                                <span
                                    className="EditorPartidasManual-etiquetaIva"
                                    data-iva={p.esIva ? "si" : "no"}
                                >
                                    {p.esIva ? "SI" : "NO"}
                                </span>
                            </td>
                            <td>
                                <QBoton
                                    onClick={() => quitar(i)}
                                    deshabilitado={partidas.length <= 2}
                                >
                                    Quitar
                                </QBoton>
                            </td>
                        </tr>
                        {p.esIva && (
                            <tr className="EditorPartidasManual-filaIva">
                                <td colSpan={6}>
                                    <div className="EditorPartidasManual-ivaCampos">
                                        <QInput
                                            label="Base imponible"
                                            nombre={`base-${i}`}
                                            tipo="decimal"
                                            valor={String(p.baseImponible ?? 0)}
                                            onChange={(v) =>
                                                actualizar(
                                                    i,
                                                    "baseImponible",
                                                    Number(v) || 0
                                                )
                                            }
                                        />
                                        <QInput
                                            label="% IVA"
                                            nombre={`ivapct-${i}`}
                                            tipo="decimal"
                                            valor={String(p.ivaPct ?? 21)}
                                            onChange={(v) =>
                                                actualizar(
                                                    i,
                                                    "ivaPct",
                                                    Number(v) || 0
                                                )
                                            }
                                        />
                                        <QInput
                                            label="Casilla 303"
                                            nombre={`casilla-${i}`}
                                            valor={p.casilla303 ?? ""}
                                            onChange={(v) =>
                                                actualizar(i, "casilla303", v)
                                            }
                                            opcional
                                        />
                                        <QInput
                                            label="Grupo IVA neg."
                                            nombre={`givaneg-${i}`}
                                            valor={
                                                p.grupoIvaNegocioId ?? "GENERAL"
                                            }
                                            onChange={(v) =>
                                                actualizar(
                                                    i,
                                                    "grupoIvaNegocioId",
                                                    v
                                                )
                                            }
                                            opcional
                                        />
                                        <SubcuentaSelector
                                            label="Contrapartida"
                                            nombre={`contrapartida-${i}`}
                                            ejercicioId={ejercicioId}
                                            valor={
                                                p.contrapartidaId &&
                                                p.contrapartidaId > 0
                                                    ? String(p.contrapartidaId)
                                                    : ""
                                            }
                                            descripcion={
                                                p.contrapartidaCodigo ?? ""
                                            }
                                            onChange={(opcion) => {
                                                const copia = partidas.map(
                                                    (row, j) =>
                                                        j === i
                                                            ? {
                                                                  ...row,
                                                                  contrapartidaId:
                                                                      opcion
                                                                          ? Number(
                                                                                opcion.valor
                                                                            )
                                                                          : 0,
                                                                  contrapartidaCodigo:
                                                                      opcion?.descripcion ??
                                                                      "",
                                                              }
                                                            : row
                                                );
                                                onChange(copia);
                                            }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                ))}
            </table>
            <div className="EditorPartidasManual-pie">
                <QBoton onClick={anadir}>Añadir partida</QBoton>
                <span>
                    Debe: {totalDebe(partidas).toFixed(2)} · Haber:{" "}
                    {totalHaber(partidas).toFixed(2)}
                    {!cuadrado && (
                        <strong className="descuadre">
                            {" "}
                            · Descuadre: {descuadre.toFixed(2)}
                        </strong>
                    )}
                </span>
            </div>
        </div>
    );
};
