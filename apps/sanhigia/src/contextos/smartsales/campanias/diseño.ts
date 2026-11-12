import { Contexto } from "@olula/lib/diseño.ts";

export type TipoCampania = "inactivos" | "ventaCruzada" | "captacion";

export type TipoProductoCampania = "subfamilia" | "listadearticulos";

export type ProductoCampania = {
    codigo: string;
    descripcion: string;
};

export type FormularioCampania = {
    tipo: TipoCampania;
    tipoProducto: TipoProductoCampania;
    subfamilia: ProductoCampania | null;
    articulos: ProductoCampania[];
    modoIncluidos: "alguno" | "todos";
    excluidos: ProductoCampania[];
    modoExcluidos: "ninguno" | "alguno";
    dias: number;
    desde: string;
    hasta: string;
    umbral: number;
    nombre: string;
    descripcion: string;
};

export type CampaniaAPI = {
    tipo: TipoCampania;
    tipoproducto: TipoProductoCampania;
    subfamilia: string | null;
    productos: string | null;
    diasdesdeultimacompra: number | null;
    fechainicioultimacompra: string | null;
    fechafinultimacompra: string | null;
    umbralrecomendacion: number | null;
    nombre: string;
    descripcion: string | null;
    codagente: string | null;
};

export type ClientePrevio = {
    codCliente: string;
    nombre: string;
    ciudad: string | null;
    afinidad: number | null;
};

export type ClientePrevioAPI = {
    codcliente: string;
    nombre: string;
    ciudad: string | null;
    afinidad: number | null;
};

export type EstadoNuevaCampania = "DEFINIENDO" | "REVISANDO" | "CREADA";

export type ContextoNuevaCampania = Contexto<EstadoNuevaCampania> & {
    formulario: FormularioCampania;
    agente: string | null;
    clientes: ClientePrevio[];
    idCampania: string | null;
    errores: string[];
};

export type CampaniaLista = {
    id: string;
    nombre: string;
    descripcion: string | null;
    tipo: TipoCampania;
    fechaAlta: string | null;
    totales: number;
    ganados: number;
    perdidos: number;
};

export type CampaniaListaAPI = {
    idcampania: number;
    nombre: string;
    descripcion: string | null;
    tipo: TipoCampania;
    fechaalta: string | null;
    totales: number;
    ganados: number;
    perdidos: number;
};

export type ClienteCampania = {
    codCliente: string;
    nombre: string;
    ciudad: string | null;
    latitud: number | null;
    longitud: number | null;
    idTrato: string;
    estado: string;
    afinidad: number | null;
    ventas12Meses: number;
    ultimaCompra: string | null;
    ventasCampania: number;
};

export type ClienteCampaniaAPI = {
    codcliente: string;
    nombre: string;
    ciudad: string | null;
    latitud: number | null;
    longitud: number | null;
    idtrato: number;
    estado: string;
    afinidad: number | null;
    ventas12meses: number;
    ultimacompra: string | null;
    ventascampania: number;
};

export type ResumenCampania = {
    id: string;
    nombre: string;
    descripcion: string | null;
    tipo: TipoCampania;
    fechaAlta: string | null;
    clientes: ClienteCampania[];
};

export type ResumenCampaniaAPI = {
    idcampania: number;
    nombre: string;
    descripcion: string | null;
    tipo: TipoCampania;
    fechaalta: string | null;
    clientes: ClienteCampaniaAPI[];
};
