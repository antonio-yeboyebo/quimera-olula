export type TipoNivel = "ano" | "trimestre" | "mes";

export type Nivel = {
    ref: string;
    id: string;
    descripcion: string;
    tipo: TipoNivel | null;
};

export type Jerarquia = {
    id: string;
    niveles: string[];
};

export type Dimension = {
    id: string;
    descripcion: string;
    niveles: Nivel[];
    jerarquias: Jerarquia[];
};

export type FormatoMedida = "moneda" | "unidades" | "decimales";

export type Medida = {
    id: string;
    descripcion: string;
    agregacion: "suma" | "media_ponderada";
    formato: FormatoMedida;
};

export type UltimaCarga = {
    fecha: Date;
    usuarioId: string;
};

export type EstadoCarga = {
    id: number;
    estado: "pendiente" | "en_curso" | "ok" | "error";
    fecha: Date;
    usuarioId: string;
    ejercicios: string[];
    mensaje: string | null;
};

export type Cubo = {
    id: string;
    descripcion: string;
    dimensiones: Dimension[];
    medidas: Medida[];
    ultimaCarga: UltimaCarga | null;
    estadoCarga: EstadoCarga | null;
};

export type CodigoMiembro = string | number | null;

export type Miembro = {
    codigo: CodigoMiembro;
    etiqueta: string;
};

export type Miembros = {
    miembros: Miembro[];
    hayMas: boolean;
};

export const POR_ETIQUETA = "etiqueta";

export type OrdenPivot = {
    por: string;
    sentido: "asc" | "desc";
};

export type PeticionPivot = {
    filas: string[];
    columnas: string[];
    medidas: string[];
    filtros: Record<string, CodigoMiembro[]>;
    orden: OrdenPivot | null;
    top: number | null;
    excluirCeros: boolean;
};

export type FilaPivot = {
    filas: (Miembro | null)[];
    columnas: (Miembro | null)[];
    medidas: Record<string, number | null>;
};

export type ResultadoPivot = {
    filas: FilaPivot[];
    truncado: boolean;
};

export type TipoGrafico = "barras" | "lineas" | "tarta";

export type Presentacion = {
    medidasEnColumnas: boolean;
    verGrafico: boolean;
    tipoGrafico: TipoGrafico;
};

export type ValoresMedidas = Record<string, number | null>;

export type Nodo = {
    ruta: Miembro[];
    valores: Record<string, ValoresMedidas>;
    hijos: Nodo[] | null;
    expandido: boolean;
};

export type Arbol = {
    total: Record<string, ValoresMedidas>;
    nodos: Nodo[];
    columnas: Miembro[][];
};

export type Historial = {
    peticiones: PeticionPivot[];
    posicion: number;
};

export type SerieGrafico = {
    clave: string;
    nombre: string;
};

export type DatosGrafico = {
    puntos: Record<string, string | number | null>[];
    series: SerieGrafico[];
};

export type CargaTerminada = {
    cargaId: number | null;
    cuboId: string;
    estado: "ok" | "error";
    filas: number | null;
    mensaje: string | null;
};

export type ConsultaMiembros = {
    filtros: Record<string, CodigoMiembro[]>;
    buscar: string;
    todos: boolean;
    limite: number;
    desplazamiento: number;
    seleccionados: CodigoMiembro[];
};

export type PaginaMiembros = {
    miembros: Miembro[];
    hayMas: boolean;
    seleccionados: Miembro[];
};

export type BuscarMiembros = (cuboId: string, nivel: string, consulta: ConsultaMiembros) => Promise<PaginaMiembros>;

export type GetCatalogo =() => Promise<Cubo[]>;

export type GetMiembros = (cuboId: string, nivel: string, buscar?: string) => Promise<Miembros>;

export type PostPivot = (cuboId: string, peticion: PeticionPivot) => Promise<ResultadoPivot>;

export type ExportarPivot = (cuboId: string, peticion: PeticionPivot) => Promise<Blob>;

export type PostRecarga = (cuboId: string, ejercicios: string[]) => Promise<string>;
