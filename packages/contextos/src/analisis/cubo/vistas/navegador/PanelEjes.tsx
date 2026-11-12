import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { ReactNode, useEffect, useState } from "react";
import { CodigoMiembro, Cubo, Nivel, PeticionPivot } from "../../diseño.ts";
import { asignarEje, cambiarFiltro, claveCodigo, Eje, etiquetaMes, nivelesCubo, resumenFiltro } from "../../dominio.ts";
import { buscarMiembros } from "../../infraestructura.ts";
import { BotonAccion } from "./BotonAccion.tsx";
import { ElegirNiveles } from "./ElegirNiveles.tsx";
import { FiltroNivel } from "./FiltroNivel.tsx";

type PanelEjesProps = {
    cubo: Cubo;
    peticion: PeticionPivot;
    onCambio: (peticion: PeticionPivot) => void;
};

type Etiquetas = Record<string, Record<string, string>>;

type FichaNivelProps = {
    nivel: Nivel;
    resumen: string | null;
    onFiltrar: () => void;
    onQuitarFiltro: () => void;
};

const FichaNivel = ({ nivel, resumen, onFiltrar, onQuitarFiltro }: FichaNivelProps) => (
    <div
        className={`analisis-ficha${resumen ? " con-filtro" : ""}`}
        role="button"
        tabIndex={0}
        title={`Filtrar ${nivel.descripcion}`}
        onClick={onFiltrar}
        onKeyDown={(evento) => {
            if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();
                onFiltrar();
            }
        }}
    >
        <div className="analisis-ficha-titulo">
            <span>{nivel.descripcion}</span>
            <QIcono nombre="filtro" tamaño="xs" />
        </div>
        {resumen && (
            <div className="analisis-ficha-filtro">
                <span title={resumen}>{resumen}</span>
                <button
                    type="button"
                    title="Quitar filtro"
                    aria-label={`Quitar filtro de ${nivel.descripcion}`}
                    onClick={(evento) => {
                        evento.stopPropagation();
                        onQuitarFiltro();
                    }}
                >
                    <QIcono nombre="cerrar" tamaño="xs" />
                </button>
            </div>
        )}
    </div>
);

type ZonaEjeProps = {
    titulo: string;
    vacia?: string;
    onElegir?: () => void;
    children: ReactNode;
};

const ZonaEje = ({ titulo, vacia, onElegir, children }: ZonaEjeProps) => (
    <section className="analisis-zona">
        <div className="analisis-zona-cabecera">
            <h3>{titulo}</h3>
            {onElegir && <BotonAccion icono="editar" texto={`Elegir ${titulo.toLowerCase()}`} soloIcono onClick={onElegir} />}
        </div>
        <div className="analisis-zona-fichas">
            {children}
            {vacia && <p className="analisis-zona-vacia">{vacia}</p>}
        </div>
    </section>
);

export const PanelEjes = ({ cubo, peticion, onCambio }: PanelEjesProps) => {
    const [filtrando, setFiltrando] = useState<Nivel | null>(null);
    const [eligiendo, setEligiendo] = useState<Eje | null>(null);
    const [etiquetas, setEtiquetas] = useState<Etiquetas>({});
    const niveles = nivelesCubo(cubo);
    const enEjes = [...peticion.filas, ...peticion.columnas];

    const sinEtiqueta = Object.entries(peticion.filtros)
        .filter(([ref, codigos]) => codigos.some((c) => !(claveCodigo(c) in (etiquetas[ref] ?? {}))))
        .map(([ref]) => ref)
        .join("|");

    useEffect(() => {
        if (!sinEtiqueta) return;
        sinEtiqueta.split("|").forEach((ref) => {
            const nivel = niveles.find((n) => n.ref === ref);
            buscarMiembros(cubo.id, ref, {
                filtros: {},
                buscar: "",
                todos: true,
                limite: 1,
                desplazamiento: 0,
                seleccionados: peticion.filtros[ref] ?? [],
            }).then(({ seleccionados }) =>
                setEtiquetas((previas) => ({
                    ...previas,
                    [ref]: {
                        ...Object.fromEntries(
                            seleccionados
                                .map((m) => (nivel?.tipo === "mes" ? etiquetaMes(m) : m))
                                .map((m) => [claveCodigo(m.codigo), m.etiqueta])
                        ),
                        ...previas[ref],
                    },
                }))
            );
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cubo.id, sinEtiqueta]);

    const ficha = (nivel: Nivel) => {
        const codigos = peticion.filtros[nivel.ref] ?? [];
        return (
            <FichaNivel
                key={nivel.ref}
                nivel={nivel}
                resumen={codigos.length > 0 ? resumenFiltro(codigos, etiquetas[nivel.ref] ?? {}) : null}
                onFiltrar={() => setFiltrando(nivel)}
                onQuitarFiltro={() => onCambio(cambiarFiltro(peticion, nivel.ref, []))}
            />
        );
    };

    const fichasEje = (refs: string[]) =>
        refs.map((ref) => niveles.find((n) => n.ref === ref)).filter((n) => n !== undefined).map(ficha);

    const aceptarFiltro = (codigos: CodigoMiembro[], nuevas: Record<string, string>) => {
        if (filtrando) {
            setEtiquetas((previas) => ({ ...previas, [filtrando.ref]: { ...previas[filtrando.ref], ...nuevas } }));
            onCambio(cambiarFiltro(peticion, filtrando.ref, codigos));
        }
        setFiltrando(null);
    };

    return (
        <>
            <div className="analisis-ejes">
                <ZonaEje
                    titulo="Filas"
                    vacia={peticion.filas.length === 0 ? "Sin niveles: solo el total." : undefined}
                    onElegir={() => setEligiendo("filas")}
                >
                    {fichasEje(peticion.filas)}
                </ZonaEje>
                <ZonaEje
                    titulo="Columnas"
                    vacia={peticion.columnas.length === 0 ? "Sin niveles." : undefined}
                    onElegir={() => setEligiendo("columnas")}
                >
                    {fichasEje(peticion.columnas)}
                </ZonaEje>
                <ZonaEje titulo="Otros niveles">{niveles.filter((n) => !enEjes.includes(n.ref)).map(ficha)}</ZonaEje>
            </div>
            {eligiendo && (
                <ElegirNiveles
                    titulo={eligiendo === "filas" ? "Niveles en filas" : "Niveles en columnas"}
                    niveles={niveles}
                    elegidos={peticion[eligiendo]}
                    enOtroEje={peticion[eligiendo === "filas" ? "columnas" : "filas"]}
                    nombreOtroEje={eligiendo === "filas" ? "columnas" : "filas"}
                    onAceptar={(refs) => {
                        onCambio(asignarEje(peticion, eligiendo, refs));
                        setEligiendo(null);
                    }}
                    onCerrar={() => setEligiendo(null)}
                />
            )}
            {filtrando && (
                <FiltroNivel
                    cuboId={cubo.id}
                    nivel={filtrando}
                    filtros={peticion.filtros}
                    seleccion={peticion.filtros[filtrando.ref] ?? []}
                    etiquetas={etiquetas[filtrando.ref] ?? {}}
                    onAceptar={aceptarFiltro}
                    onCerrar={() => setFiltrando(null)}
                />
            )}
        </>
    );
};
