import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { Cubo, PeticionPivot, POR_ETIQUETA } from "../../diseño.ts";
import { alternarMedida } from "../../dominio.ts";

type OpcionesPivotProps = {
    cubo: Cubo;
    peticion: PeticionPivot;
    medidasEnColumnas: boolean;
    onCambio: (peticion: PeticionPivot) => void;
    onAlternarMedidasEnColumnas: () => void;
};

const SIN_ORDEN = "";
const TODOS = "";
const TOPS = [5, 10, 20, 50, 100];

export const OpcionesPivot = ({
    cubo,
    peticion,
    medidasEnColumnas,
    onCambio,
    onAlternarMedidasEnColumnas,
}: OpcionesPivotProps) => {
    const opcionesOrden = [
        { valor: SIN_ORDEN, descripcion: "Sin orden" },
        { valor: POR_ETIQUETA, descripcion: "Etiqueta" },
        ...cubo.medidas
            .filter((m) => peticion.medidas.includes(m.id))
            .map((m) => ({ valor: m.id, descripcion: m.descripcion })),
    ];

    return (
        <div className="analisis-opciones">
            <section>
                <h3>Medidas</h3>
                {cubo.medidas.map((medida) => (
                    <QCheckbox
                        key={medida.id}
                        nombre={`medida-${medida.id}`}
                        label={medida.descripcion}
                        valor={peticion.medidas.includes(medida.id)}
                        onChange={() => onCambio(alternarMedida(peticion, medida.id, cubo.medidas))}
                    />
                ))}
            </section>
            <section>
                <h3>Orden y límite</h3>
                <QSelect
                    label="Ordenar por"
                    nombre="orden"
                    valor={peticion.orden?.por ?? SIN_ORDEN}
                    opciones={opcionesOrden}
                    onChange={(opcion) =>
                        onCambio({
                            ...peticion,
                            orden: opcion?.valor
                                ? { por: opcion.valor, sentido: peticion.orden?.sentido ?? "desc" }
                                : null,
                        })
                    }
                />
                <QSelect
                    label="Sentido"
                    nombre="sentido"
                    deshabilitado={!peticion.orden}
                    valor={peticion.orden?.sentido ?? "desc"}
                    opciones={[
                        { valor: "desc", descripcion: "Descendente" },
                        { valor: "asc", descripcion: "Ascendente" },
                    ]}
                    onChange={(opcion) =>
                        peticion.orden &&
                        onCambio({ ...peticion, orden: { ...peticion.orden, sentido: opcion?.valor === "asc" ? "asc" : "desc" } })
                    }
                />
                <QSelect
                    label="Mostrar"
                    nombre="top"
                    deshabilitado={peticion.filas.length === 0}
                    valor={peticion.top === null ? TODOS : String(peticion.top)}
                    opciones={[
                        { valor: TODOS, descripcion: "Todos" },
                        ...TOPS.map((n) => ({ valor: String(n), descripcion: `Los ${n} primeros` })),
                    ]}
                    onChange={(opcion) => onCambio({ ...peticion, top: opcion?.valor ? Number(opcion.valor) : null })}
                />
                <QCheckbox
                    nombre="excluir-ceros"
                    label="Excluir ceros"
                    valor={peticion.excluirCeros}
                    onChange={() => onCambio({ ...peticion, excluirCeros: !peticion.excluirCeros })}
                />
                <QCheckbox
                    nombre="medidas-en-columnas"
                    label="Medidas en columnas"
                    valor={medidasEnColumnas}
                    onChange={onAlternarMedidasEnColumnas}
                />
            </section>
        </div>
    );
};
