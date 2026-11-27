import { MetaModelo } from "@olula/lib/dominio.ts";
import { sinTexto } from "#/almacen/comun/dominio.ts";
import { EstadoImpresora, Impresora, ModoSalida, NuevaImpresora } from "./diseño.ts";

const LARGO_CODIGO = 20;
const PUERTO_MAXIMO = 65535;

export const opcionesModoSalida: { valor: ModoSalida; descripcion: string }[] = [
    { valor: "arrancar", descripcion: "Arrancar (sin cortador)" },
    { valor: "cortar", descripcion: "Cortar" },
    { valor: "despegar", descripcion: "Despegar" },
];

type CamposImpresora = Pick<NuevaImpresora,
    "codigo" | "host" | "puerto" | "anchoMm" | "altoMm" | "puntosPorMm" | "desplazamientoX"
>;

/** Devuelve `true` si es válida o el mensaje del primer error. */
export const validarImpresora = (m: CamposImpresora): string | true => {
    if (sinTexto(m.codigo)) return "El código es obligatorio";
    if (m.codigo.length > LARGO_CODIGO) return `El código admite como máximo ${LARGO_CODIGO} caracteres`;
    if (sinTexto(m.host)) return "La dirección (host) es obligatoria";
    if (!Number.isInteger(m.puerto) || m.puerto < 1 || m.puerto > PUERTO_MAXIMO) return "El puerto debe estar entre 1 y 65535";
    if (!(m.anchoMm > 0) || !(m.altoMm > 0)) return "El ancho y el alto de la etiqueta deben ser mayores que cero";
    if (!(m.puntosPorMm > 0)) return "Los puntos por mm deben ser mayores que cero";
    if (!(m.desplazamientoX >= 0)) return "El desplazamiento no puede ser negativo";
    return true;
};

const camposImpresora = {
    codigo: { requerido: true },
    descripcion: { requerido: false },
    host: { requerido: true },
    puerto: { requerido: true, tipo: "entero" as const },
    anchoMm: { requerido: true, tipo: "entero" as const },
    altoMm: { requerido: true, tipo: "entero" as const },
    puntosPorMm: { requerido: true, tipo: "entero" as const },
    desplazamientoX: { requerido: true, tipo: "entero" as const },
    modoSalida: { requerido: true },
};

/** Valores por defecto: los de la PC45d a 203 dpi con etiqueta de 100 × 150 mm. */
export const nuevaImpresoraVacia: NuevaImpresora = {
    codigo: "",
    descripcion: "",
    host: "",
    puerto: 9100,
    anchoMm: 100,
    altoMm: 150,
    puntosPorMm: 8,
    desplazamientoX: 0,
    modoSalida: "arrancar",
};

export const impresoraVacia = (): Impresora => ({ id: "", ...nuevaImpresoraVacia });

export const metaImpresora: MetaModelo<Impresora> = {
    campos: camposImpresora,
    validacion: validarImpresora,
};

export const metaNuevaImpresora: MetaModelo<NuevaImpresora> = {
    campos: camposImpresora,
    validacion: validarImpresora,
};

export const tamañoEtiqueta = (i: Pick<Impresora, "anchoMm" | "altoMm">): string =>
    `${i.anchoMm} × ${i.altoMm} mm`;

/** Texto corto del estado: "Lista" o los problemas que impiden imprimir. */
export const textoEstadoImpresora = (estado: EstadoImpresora): string => {
    if (estado.lista) {
        return estado.etiquetasEnCola > 0
            ? `Lista (${estado.etiquetasEnCola} en cola)`
            : "Lista";
    }
    const problemas = [
        estado.sinPapel && "sin papel",
        estado.enPausa && "en pausa",
        estado.cabezalAbierto && "cabezal abierto",
    ].filter(Boolean);
    return `No puede imprimir: ${problemas.join(", ")}`;
};
