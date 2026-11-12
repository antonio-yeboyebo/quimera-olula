export type NivelAfinidad = "muy_alta" | "alta" | "media";

export type Agente = {
    codigo: string;
    nombre: string;
};

export type AgenteAPI = {
    codagente: string;
    nombreap: string;
};

export type UsuarioSmartsales = {
    agente: string;
    superusuario: boolean;
    tipoTratoFarma: string | null;
    tipoTratoVentaProducto: string | null;
    grupo: string | null;
    empresa: number | null;
};

export type UsuarioSmartsalesAPI = {
    agente: string | null;
    superuser: boolean;
    tratolicenciafarma: number | string | null;
    tratoventaproducto: number | string | null;
    group: string | null;
    company: number | null;
};

export type TipoTarea = "Llamada" | "Email" | "Whatsapp" | "Cita";

export type EstadoTarea = "en_curso" | "atrasada";

export type Tarea = {
    id: string;
    titulo: string;
    fecha: string;
    hora: string | null;
    tipo: TipoTarea;
    completada: boolean;
    enCurso: boolean;
    nombreCliente: string | null;
    nombreContacto: string | null;
};

export type NumeroTrimestre = 1 | 2 | 3 | 4;

export type Trimestre = {
    año: number;
    numero: NumeroTrimestre;
};

export type Periodo =
    | { tipo: "trimestres"; trimestres: Trimestre[] }
    | { tipo: "fechas"; desde: string; hasta: string };

export type RangoFechas = {
    desde: string;
    hasta: string;
};
