import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { useEffect, useRef, useState } from "react";
import { CodigoMiembro, Miembro, Nivel } from "../../diseño.ts";
import { claveCodigo, etiquetaMes, miembroConocido, PAGINA_MIEMBROS } from "../../dominio.ts";
import { buscarMiembros } from "../../infraestructura.ts";

type FiltroNivelProps = {
    cuboId: string;
    nivel: Nivel;
    filtros: Record<string, CodigoMiembro[]>;
    seleccion: CodigoMiembro[];
    etiquetas: Record<string, string>;
    onAceptar: (codigos: CodigoMiembro[], etiquetas: Record<string, string>) => void;
    onCerrar: () => void;
};

export const FiltroNivel = ({ cuboId, nivel, filtros, seleccion, etiquetas, onAceptar, onCerrar }: FiltroNivelProps) => {
    const [buscar, setBuscar] = useState("");
    const [todos, setTodos] = useState(false);
    const [fijados, setFijados] = useState<Miembro[]>(() =>
        seleccion.map((codigo) => ({
            codigo,
            etiqueta: etiquetas[claveCodigo(codigo)] ?? miembroConocido(codigo, []).etiqueta,
        }))
    );
    const [marcados, setMarcados] = useState<Set<string>>(() => new Set(seleccion.map(claveCodigo)));
    const [miembros, setMiembros] = useState<Miembro[]>([]);
    const [hayMas, setHayMas] = useState(false);
    const [cargando, setCargando] = useState(true);
    const seleccionadosConsulta = useRef<CodigoMiembro[]>(seleccion);

    const conEtiqueta = (lista: Miembro[]) => (nivel.tipo === "mes" ? lista.map(etiquetaMes) : lista);

    const pedir = (desplazamiento: number) =>
        buscarMiembros(cuboId, nivel.ref, {
            filtros,
            buscar,
            todos,
            limite: PAGINA_MIEMBROS,
            desplazamiento,
            seleccionados: seleccionadosConsulta.current,
        });

    useEffect(() => {
        setCargando(true);
        const espera = setTimeout(() => {
            seleccionadosConsulta.current = fijados.map((m) => m.codigo);
            pedir(0)
                .then((pagina) => {
                    setMiembros(conEtiqueta(pagina.miembros));
                    setHayMas(pagina.hayMas);
                    const conocidos = conEtiqueta(pagina.seleccionados);
                    setFijados((previos) =>
                        previos.map((m) => conocidos.find((c) => claveCodigo(c.codigo) === claveCodigo(m.codigo)) ?? m)
                    );
                })
                .finally(() => setCargando(false));
        }, 300);
        return () => clearTimeout(espera);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cuboId, nivel.ref, buscar, todos]);

    const cargarMas = () => {
        setCargando(true);
        pedir(miembros.length)
            .then((pagina) => {
                setMiembros((previos) => [...previos, ...conEtiqueta(pagina.miembros)]);
                setHayMas(pagina.hayMas);
            })
            .finally(() => setCargando(false));
    };

    const clavesFijadas = new Set(fijados.map((m) => claveCodigo(m.codigo)));
    const libres = miembros.filter((m) => !clavesFijadas.has(claveCodigo(m.codigo)));

    const alternar = (miembro: Miembro) => {
        const clave = claveCodigo(miembro.codigo);
        if (!clavesFijadas.has(clave)) setFijados([...fijados, miembro]);
        setMarcados((previos) => {
            const nuevos = new Set(previos);
            if (nuevos.has(clave)) nuevos.delete(clave);
            else nuevos.add(clave);
            return nuevos;
        });
    };

    const aceptar = () => {
        const elegidos = fijados.filter((m) => marcados.has(claveCodigo(m.codigo)));
        onAceptar(
            elegidos.map((m) => m.codigo),
            Object.fromEntries(elegidos.map((m) => [claveCodigo(m.codigo), m.etiqueta]))
        );
    };

    const casilla = (miembro: Miembro) => (
        <QCheckbox
            key={claveCodigo(miembro.codigo)}
            nombre={`miembro-${claveCodigo(miembro.codigo)}`}
            label={miembro.etiqueta}
            valor={marcados.has(claveCodigo(miembro.codigo))}
            onChange={() => alternar(miembro)}
        />
    );

    const vacio = !cargando && libres.length === 0 && !hayMas;

    return (
        <QModal nombre="filtro-nivel" titulo={`Filtrar ${nivel.descripcion}`} abierto onCerrar={onCerrar}>
            <div className="analisis-filtro-nivel">
                <QInput label="Buscar" nombre="buscar" valor={buscar} onChange={setBuscar} autoFocus />
                <QCheckbox
                    nombre="mostrar-todos"
                    label="Mostrar todos, también sin datos con los filtros actuales"
                    valor={todos}
                    onChange={() => setTodos(!todos)}
                />
                {fijados.length > 0 && (
                    <section className="analisis-filtro-elegidos">
                        <h3>Elegidos</h3>
                        {fijados.map(casilla)}
                    </section>
                )}
                <section className="analisis-filtro-lista">
                    {libres.map(casilla)}
                    {vacio && buscar && <p className="analisis-filtro-mas">Ningún valor coincide con la búsqueda.</p>}
                    {vacio && !buscar && !todos && (
                        <p className="analisis-filtro-mas">
                            No hay valores con datos con los filtros actuales.{" "}
                            <QBoton variante="texto" tamaño="pequeño" onClick={() => setTodos(true)}>
                                Mostrar todos
                            </QBoton>
                        </p>
                    )}
                    {hayMas && (
                        <QBoton variante="texto" tamaño="pequeño" deshabilitado={cargando} onClick={cargarMas}>
                            Cargar más
                        </QBoton>
                    )}
                </section>
                <div className="analisis-filtro-botones">
                    <QBoton variante="texto" onClick={() => onAceptar([], {})}>
                        Quitar filtro
                    </QBoton>
                    <QBoton onClick={aceptar}>Aceptar</QBoton>
                </div>
            </div>
        </QModal>
    );
};
