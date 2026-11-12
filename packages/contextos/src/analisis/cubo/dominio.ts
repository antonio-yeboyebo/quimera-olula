import { ColumnaMultinivel, FilaMultinivel } from "@olula/componentes/atomos/qtablamultinivel.tsx";
import {
    Arbol,
    CargaTerminada,
    CodigoMiembro,
    ConsultaMiembros,
    Cubo,
    DatosGrafico,
    FilaPivot,
    FormatoMedida,
    Historial,
    Medida,
    Miembro,
    Nivel,
    Nodo,
    OrdenPivot,
    PaginaMiembros,
    PeticionPivot,
    POR_ETIQUETA,
    TipoNivel,
    ValoresMedidas,
} from "./diseño.ts";

const TOTAL = "Total";
const SIN_VALOR = "(sin valor)";

export const claveRuta = (ruta: Miembro[]) => JSON.stringify(ruta.map((m) => m.codigo));

const ruta = (miembros: (Miembro | null)[]): Miembro[] => {
    const hasta = miembros.indexOf(null);
    return (hasta < 0 ? miembros : miembros.slice(0, hasta)) as Miembro[];
};

export const peticionNodo = (peticion: PeticionPivot, nodo: Miembro[]): PeticionPivot => {
    if (peticion.filas.length === 0) return peticion;
    const filas = peticion.filas.slice(0, nodo.length + 1);
    const filtros = Object.fromEntries(nodo.map((miembro, i) => [filas[i], [miembro.codigo]]));
    return { ...peticion, filas, filtros: { ...peticion.filtros, ...filtros } };
};

const compararCodigos = (a: CodigoMiembro, b: CodigoMiembro) => {
    if (a === b) return 0;
    if (a === null) return 1;
    if (b === null) return -1;
    if (typeof a === "number" && typeof b === "number") return a - b;
    return String(a).localeCompare(String(b), "es", { numeric: true });
};

const compararRutas = (a: Miembro[], b: Miembro[]): number => {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        const comparacion = compararCodigos(a[i].codigo, b[i].codigo);
        if (comparacion !== 0) return comparacion;
    }
    return a.length - b.length;
};

const unirColumnas = (columnas: Miembro[][], nuevas: Miembro[][]) => {
    const claves = new Set(columnas.map(claveRuta));
    return [...columnas, ...nuevas.filter((c) => !claves.has(claveRuta(c)))].sort(compararRutas);
};

const nodosDeProfundidad = (filas: FilaPivot[], profundidad: number) => {
    const nodos = new Map<string, Nodo>();
    const columnas = new Map<string, Miembro[]>();
    filas.forEach((fila) => {
        const columna = ruta(fila.columnas);
        columnas.set(claveRuta(columna), columna);
        const camino = ruta(fila.filas);
        if (camino.length !== profundidad) return;
        const clave = claveRuta(camino);
        const nodo = nodos.get(clave) ?? { ruta: camino, valores: {}, hijos: null, expandido: false };
        nodo.valores[claveRuta(columna)] = fila.medidas;
        nodos.set(clave, nodo);
    });
    return { nodos: [...nodos.values()], columnas: [...columnas.values()] };
};

export const arbolDesdePivot = (filas: FilaPivot[]): Arbol => {
    const { nodos: [total], columnas } = nodosDeProfundidad(filas, 0);
    return {
        total: total?.valores ?? {},
        nodos: nodosDeProfundidad(filas, 1).nodos,
        columnas: unirColumnas([], columnas),
    };
};

const esAncestro = (nodo: Nodo, camino: Miembro[]) =>
    camino.length > nodo.ruta.length && claveRuta(camino.slice(0, nodo.ruta.length)) === claveRuta(nodo.ruta);

const cambiarNodo = (nodos: Nodo[], camino: Miembro[], cambio: (nodo: Nodo) => Nodo): Nodo[] =>
    nodos.map((nodo) => {
        if (claveRuta(nodo.ruta) === claveRuta(camino)) return cambio(nodo);
        if (nodo.hijos && esAncestro(nodo, camino)) {
            return { ...nodo, hijos: cambiarNodo(nodo.hijos, camino, cambio) };
        }
        return nodo;
    });

const buscarNodo = (nodos: Nodo[], camino: Miembro[]): Nodo | undefined => {
    const nodo = nodos.find((n) => claveRuta(n.ruta) === claveRuta(camino) || esAncestro(n, camino));
    if (!nodo || nodo.ruta.length === camino.length) return nodo;
    return nodo.hijos ? buscarNodo(nodo.hijos, camino) : undefined;
};

export const expandirNodo = (arbol: Arbol, camino: Miembro[], filas: FilaPivot[]): Arbol => {
    const { nodos, columnas } = nodosDeProfundidad(filas, camino.length + 1);
    return {
        ...arbol,
        nodos: cambiarNodo(arbol.nodos, camino, (nodo) => ({ ...nodo, hijos: nodos, expandido: true })),
        columnas: unirColumnas(arbol.columnas, columnas),
    };
};

export const alternarNodo = (arbol: Arbol, camino: Miembro[]): Arbol => ({
    ...arbol,
    nodos: cambiarNodo(arbol.nodos, camino, (nodo) => ({ ...nodo, expandido: !nodo.expandido })),
});

export const necesitaCargar = (arbol: Arbol, camino: Miembro[]) =>
    (buscarNodo(arbol.nodos, camino)?.hijos ?? null) === null;

const tipoColumna = (formato: FormatoMedida): Pick<ColumnaMultinivel, "tipo" | "decimales"> => {
    if (formato === "moneda") return { tipo: "moneda" };
    return { tipo: "numero", decimales: formato === "unidades" ? 0 : 2 };
};

export const columnasTabla = (
    columnas: Miembro[][],
    medidas: Medida[],
    nivelesColumna: number,
    medidasEnColumnas: boolean
): ColumnaMultinivel[] =>
    columnas.flatMap((columna) => {
        const etiquetas = columna.map((m) => m.etiqueta);
        const hoja = columna.length === nivelesColumna;
        const porMiembro = {
            cabecera: hoja && columna.length > 0 ? etiquetas[etiquetas.length - 1] : TOTAL,
            grupo: hoja && columna.length > 0 ? etiquetas.slice(0, -1) : etiquetas,
            destacada: !hoja,
        };
        if (!medidasEnColumnas) return [{ id: claveRuta(columna), ...porMiembro }];
        if (medidas.length === 1) {
            const [medida] = medidas;
            return [{
                id: `${claveRuta(columna)}|${medida.id}`,
                ...porMiembro,
                cabecera: nivelesColumna === 0 ? medida.descripcion : porMiembro.cabecera,
                ...tipoColumna(medida.formato),
            }];
        }
        const grupo = hoja ? etiquetas : [...etiquetas, TOTAL];
        return medidas.map((medida) => ({
            id: `${claveRuta(columna)}|${medida.id}`,
            cabecera: medida.descripcion,
            grupo,
            destacada: !hoja,
            ...tipoColumna(medida.formato),
        }));
    });

const valoresEnColumnas = (valores: Record<string, ValoresMedidas>, medidas: Medida[]) =>
    Object.fromEntries(
        Object.entries(valores).flatMap(([columna, medidasColumna]) =>
            medidas.map((medida) => [`${columna}|${medida.id}`, medidasColumna[medida.id] ?? null])
        )
    );

const valoresDeMedida = (valores: Record<string, ValoresMedidas>, medida: Medida) =>
    Object.fromEntries(Object.entries(valores).map(([columna, m]) => [columna, m[medida.id] ?? null]));

const filasDeValores = (
    base: Omit<FilaMultinivel, "valores">,
    valores: Record<string, ValoresMedidas>,
    medidas: Medida[],
    medidasEnColumnas: boolean
): FilaMultinivel[] =>
    medidasEnColumnas
        ? [{ ...base, valores: valoresEnColumnas(valores, medidas) }]
        : [
            { ...base, valores: {} },
            ...medidas.map((medida) => ({
                id: `${base.id}|${medida.id}`,
                etiqueta: medida.descripcion,
                nivel: base.nivel + 1,
                valores: valoresDeMedida(valores, medida),
                ...tipoColumna(medida.formato),
            })),
        ];

export const filasTabla = (
    arbol: Arbol,
    medidas: Medida[],
    nivelesFila: number,
    medidasEnColumnas: boolean
): FilaMultinivel[] => {
    const filasNodo = (nodo: Nodo): FilaMultinivel[] => {
        const expandida = nodo.expandido && nodo.hijos !== null;
        const base = {
            id: claveRuta(nodo.ruta),
            etiqueta: nodo.ruta[nodo.ruta.length - 1].etiqueta,
            nivel: nodo.ruta.length - 1,
            expandible: nodo.ruta.length < nivelesFila,
            expandida,
            destacada: expandida,
        };
        return [
            ...filasDeValores(base, nodo.valores, medidas, medidasEnColumnas),
            ...(expandida ? (nodo.hijos ?? []).flatMap(filasNodo) : []),
        ];
    };

    const total = { id: "total", etiqueta: TOTAL, nivel: 0, expandible: false, expandida: false, destacada: true };
    return [...arbol.nodos.flatMap(filasNodo), ...filasDeValores(total, arbol.total, medidas, medidasEnColumnas)];
};

export const ordenTrasPulsar = (orden: OrdenPivot | null, por: string): OrdenPivot =>
    orden?.por === por
        ? { por, sentido: orden.sentido === "desc" ? "asc" : "desc" }
        : { por, sentido: "desc" };

export type Eje = "filas" | "columnas";

export const peticionInicial = (cubo: Cubo): PeticionPivot => ({
    filas: [],
    columnas: [],
    medidas: cubo.medidas.slice(0, 1).map((m) => m.id),
    filtros: {},
    orden: null,
    top: null,
    excluirCeros: false,
});

export const moverNivel = (peticion: PeticionPivot, ref: string, destino: Eje | null, antesDe?: string): PeticionPivot => {
    const quitar = (refs: string[]) => refs.filter((r) => r !== ref);
    const insertar = (refs: string[]) => {
        const i = antesDe ? refs.indexOf(antesDe) : -1;
        return i < 0 ? [...refs, ref] : [...refs.slice(0, i), ref, ...refs.slice(i)];
    };
    const filas = quitar(peticion.filas);
    const columnas = quitar(peticion.columnas);
    return {
        ...peticion,
        filas: destino === "filas" ? insertar(filas) : filas,
        columnas: destino === "columnas" ? insertar(columnas) : columnas,
    };
};

export const asignarEje = (peticion: PeticionPivot, eje: Eje, refs: string[]): PeticionPivot => {
    const otro: Eje = eje === "filas" ? "columnas" : "filas";
    return { ...peticion, [eje]: refs, [otro]: peticion[otro].filter((r) => !refs.includes(r)) };
};

export const alternarMedida = (peticion: PeticionPivot, id: string, medidas: Medida[]): PeticionPivot => {
    const elegidas = peticion.medidas.includes(id)
        ? peticion.medidas.filter((m) => m !== id)
        : [...peticion.medidas, id];
    if (elegidas.length === 0) return peticion;
    return {
        ...peticion,
        medidas: medidas.map((m) => m.id).filter((m) => elegidas.includes(m)),
        orden: peticion.orden && !elegidas.includes(peticion.orden.por) && peticion.orden.por !== POR_ETIQUETA
            ? null
            : peticion.orden,
    };
};

export const cambiarFiltro = (peticion: PeticionPivot, nivel: string, codigos: CodigoMiembro[]): PeticionPivot => {
    const resto = Object.fromEntries(Object.entries(peticion.filtros).filter(([n]) => n !== nivel));
    return { ...peticion, filtros: codigos.length > 0 ? { ...resto, [nivel]: codigos } : resto };
};

export const medidaDeColumna = (columnaId: string): string | null => {
    const i = columnaId.lastIndexOf("|");
    return i < 0 || !columnaId.endsWith("]", i) ? null : columnaId.slice(i + 1);
};

export const nivelesCubo = (cubo: Cubo) => cubo.dimensiones.flatMap((d) => d.niveles);

export const nombreExportacion = (cuboId: string, fecha: Date) => {
    const dos = (n: number) => String(n).padStart(2, "0");
    return `${cuboId}-${fecha.getFullYear()}${dos(fecha.getMonth() + 1)}${dos(fecha.getDate())}.xlsx`;
};

export const etiquetaMes = (miembro: Miembro): Miembro =>
    miembro.codigo === null ? miembro : { ...miembro, etiqueta: `${miembro.etiqueta} ${String(miembro.codigo).slice(0, 4)}` };

const mesesSinAno = (cubo: Cubo, refs: string[]) => {
    const niveles = nivelesCubo(cubo);
    const tipos = refs.map((ref) => niveles.find((n) => n.ref === ref)?.tipo ?? null);
    return tipos.map((tipo, i) => tipo === "mes" && !tipos.slice(0, i).includes("ano"));
};

export const etiquetarMeses = (cubo: Cubo, peticion: PeticionPivot, filas: FilaPivot[]): FilaPivot[] => {
    const enFilas = mesesSinAno(cubo, peticion.filas);
    const enColumnas = mesesSinAno(cubo, peticion.columnas);
    if (!enFilas.includes(true) && !enColumnas.includes(true)) return filas;
    const etiquetar = (marcas: boolean[]) => (miembro: Miembro | null, i: number) =>
        miembro && marcas[i] ? etiquetaMes(miembro) : miembro;
    return filas.map((fila) => ({
        ...fila,
        filas: fila.filas.map(etiquetar(enFilas)),
        columnas: fila.columnas.map(etiquetar(enColumnas)),
    }));
};

const MAX_HISTORIAL = 10;

export const historialNuevo = (peticion: PeticionPivot): Historial => ({ peticiones: [peticion], posicion: 0 });

export const apilar = (historial: Historial, peticion: PeticionPivot): Historial => {
    const peticiones = [...historial.peticiones.slice(0, historial.posicion + 1), peticion].slice(-MAX_HISTORIAL);
    return { peticiones, posicion: peticiones.length - 1 };
};

export const moverHistorial = (historial: Historial, paso: -1 | 1): Historial => {
    const posicion = historial.posicion + paso;
    return posicion < 0 || posicion >= historial.peticiones.length ? historial : { ...historial, posicion };
};

export const nivelDeTipo = (cubo: Cubo, tipo: TipoNivel): Nivel | undefined =>
    nivelesCubo(cubo).find((n) => n.tipo === tipo);

const elegidos = (peticion: PeticionPivot, nivel: Nivel | undefined) => (nivel ? peticion.filtros[nivel.ref] ?? [] : []);

export const anosElegidos = (peticion: PeticionPivot, cubo: Cubo): number[] =>
    elegidos(peticion, nivelDeTipo(cubo, "ano")).map(Number);

export const trimestresElegidos = (peticion: PeticionPivot, cubo: Cubo): string[] =>
    elegidos(peticion, nivelDeTipo(cubo, "trimestre")).map(String);

export const mesesElegidos = (peticion: PeticionPivot, cubo: Cubo): number[] =>
    [...new Set(elegidos(peticion, nivelDeTipo(cubo, "mes")).map((c) => Number(String(c).slice(4, 6))))].sort((a, b) => a - b);

const alternar = <T>(valores: T[], valor: T) =>
    valores.includes(valor) ? valores.filter((v) => v !== valor) : [...valores, valor];

const conMeses = (peticion: PeticionPivot, cubo: Cubo, meses: number[], anosBotonera: number[]): PeticionPivot => {
    const mes = nivelDeTipo(cubo, "mes");
    if (!mes) return peticion;
    const anos = anosElegidos(peticion, cubo);
    const codigos = (anos.length > 0 ? anos : anosBotonera).flatMap((ano) =>
        meses.map((m) => `${ano}${String(m).padStart(2, "0")}`)
    );
    return cambiarFiltro(peticion, mes.ref, codigos.sort());
};

export const alternarAno = (peticion: PeticionPivot, cubo: Cubo, ano: number, anosBotonera: number[]): PeticionPivot => {
    const nivel = nivelDeTipo(cubo, "ano");
    if (!nivel) return peticion;
    const conAnos = cambiarFiltro(peticion, nivel.ref, alternar(anosElegidos(peticion, cubo), ano).sort((a, b) => a - b));
    return conMeses(conAnos, cubo, mesesElegidos(peticion, cubo), anosBotonera);
};

export const alternarMes = (peticion: PeticionPivot, cubo: Cubo, mes: number, anosBotonera: number[]): PeticionPivot =>
    conMeses(peticion, cubo, alternar(mesesElegidos(peticion, cubo), mes), anosBotonera);

export const alternarTrimestre = (peticion: PeticionPivot, cubo: Cubo, trimestre: string): PeticionPivot => {
    const nivel = nivelDeTipo(cubo, "trimestre");
    if (!nivel) return peticion;
    return cambiarFiltro(peticion, nivel.ref, alternar(trimestresElegidos(peticion, cubo), trimestre).sort());
};

export const graficable = (peticion: PeticionPivot) => peticion.filas.length === 1 && peticion.columnas.length <= 1;

export const datosGrafico = (arbol: Arbol, medida: Medida, nivelesColumna: number): DatosGrafico => {
    const columnas = nivelesColumna === 1 ? arbol.columnas.filter((c) => c.length === 1) : [[]];
    const series = columnas.map((c) => ({ clave: claveRuta(c), nombre: c.length > 0 ? c[0].etiqueta : medida.descripcion }));
    return {
        series,
        puntos: arbol.nodos.map((nodo) => ({
            etiqueta: nodo.ruta[nodo.ruta.length - 1].etiqueta,
            ...Object.fromEntries(series.map((s) => [s.clave, nodo.valores[s.clave]?.[medida.id] ?? null])),
        })),
    };
};

export const ejerciciosDesdeTexto = (texto: string): string[] =>
    [...new Set(texto.split(/[\s,;]+/).map((e) => e.trim()).filter(Boolean))];

export const existeNodo = (arbol: Arbol, camino: Miembro[]) => buscarNodo(arbol.nodos, camino) !== undefined;

export const rutasExpandidas = (arbol: Arbol): Miembro[][] => {
    const recorrer = (nodos: Nodo[]): Miembro[][] =>
        nodos.flatMap((nodo) =>
            nodo.expandido && nodo.hijos ? [nodo.ruta, ...recorrer(nodo.hijos)] : []
        );
    return recorrer(arbol.nodos);
};

const numeroONulo = (valor: unknown) => (typeof valor === "number" && Number.isFinite(valor) ? valor : null);

export const cargaTerminadaDesdeEvento = (data: unknown): CargaTerminada | null => {
    let valor = data;
    if (typeof data === "string") {
        try {
            valor = JSON.parse(data);
        } catch {
            return null;
        }
    }
    if (!valor || typeof valor !== "object") return null;
    const d = valor as Record<string, unknown>;
    if (typeof d.cubo_id !== "string" || (d.estado !== "ok" && d.estado !== "error")) return null;
    return {
        cargaId: numeroONulo(d.carga_id),
        cuboId: d.cubo_id,
        estado: d.estado,
        filas: numeroONulo(d.filas),
        mensaje: typeof d.mensaje === "string" ? d.mensaje : null,
    };
};

export const claveCodigo = (codigo: CodigoMiembro) => JSON.stringify(codigo === null ? null : String(codigo));

const MAX_NOMBRES_RESUMEN = 2;

export const resumenFiltro = (codigos: CodigoMiembro[], etiquetas: Record<string, string>): string => {
    const nombres = codigos.map((c) => etiquetas[claveCodigo(c)] ?? (c === null ? SIN_VALOR : String(c)));
    if (nombres.length <= MAX_NOMBRES_RESUMEN + 1) return nombres.join(", ");
    return `${nombres.slice(0, MAX_NOMBRES_RESUMEN).join(", ")} y ${nombres.length - MAX_NOMBRES_RESUMEN} más`;
};

export const PAGINA_MIEMBROS = 10;

export const miembroConocido = (codigo: CodigoMiembro, conocidos: Miembro[]): Miembro =>
    conocidos.find((m) => claveCodigo(m.codigo) === claveCodigo(codigo)) ??
    { codigo, etiqueta: codigo === null ? SIN_VALOR : String(codigo) };

export const paginaDesdeLista = (miembros: Miembro[], hayMasEnOrigen: boolean, consulta: ConsultaMiembros): PaginaMiembros => {
    const elegidos = new Set(consulta.seleccionados.map(claveCodigo));
    const resto = miembros.filter((m) => !elegidos.has(claveCodigo(m.codigo)));
    const fin = consulta.desplazamiento + consulta.limite;
    return {
        miembros: resto.slice(consulta.desplazamiento, fin),
        hayMas: fin < resto.length || hayMasEnOrigen,
        seleccionados: consulta.desplazamiento === 0 ? miembros.filter((m) => elegidos.has(claveCodigo(m.codigo))) : [],
    };
};
