import { MetaModelo } from "@olula/lib/dominio.ts";
import { Modelo } from "@olula/lib/diseño.ts";
import {
    CampoInforme,
    FichaInforme,
    ModoCalculo,
    ModoInforme,
    PestañaInforme,
    TipoColumnaResultado,
    ValorCelda,
    ValorCriterio,
} from "./diseño.ts";
import { tComun } from "../i18n/index.ts";

export const camposPestaña = (pestaña: PestañaInforme): CampoInforme[] =>
    pestaña.filas.flat();

const casillas = (pestaña: PestañaInforme): string[] =>
    camposPestaña(pestaña)
        .filter((campo) => campo.tipo === "casilla")
        .map((campo) => campo.id);

export const aBooleano = (valor: unknown): boolean =>
    valor === true || valor === "true" || valor === "1";

/** La ficha vacía del alta: descripción en blanco y los valores por defecto. */
export const fichaNueva = (pestaña: PestañaInforme): FichaInforme => {
    const ficha: FichaInforme = { id: "", descripcion: "" };
    camposPestaña(pestaña).forEach((campo) => {
        ficha[campo.id] =
            pestaña.inicial[campo.id] ??
            (campo.tipo === "casilla" ? false : "");
    });
    return ficha;
};

/** De la API al modelo: `null` -> "" y números a texto (los inputs editan texto). */
export const fichaDesdeApi =
    (pestaña: PestañaInforme) =>
    (api: Record<string, unknown>): FichaInforme => {
        const ficha: FichaInforme = {
            id: String(api.id ?? ""),
            descripcion: String(api.descripcion ?? ""),
        };
        camposPestaña(pestaña).forEach((campo) => {
            const valor = api[campo.id];
            ficha[campo.id] =
                campo.tipo === "casilla"
                    ? aBooleano(valor)
                    : valor === null || valor === undefined
                      ? ""
                      : String(valor);
        });
        return ficha;
    };

const valorApi = (campo: CampoInforme | undefined, valor: ValorCriterio | null | undefined) => {
    if (campo?.tipo === "casilla") return aBooleano(valor);
    // Un input vaciado puede dejar null en el modelo: no enviarlo como "null".
    if (valor === null || valor === undefined) return null;
    const texto = typeof valor === "string" ? valor.trim() : String(valor);
    if (texto === "") return null;
    if (campo?.tipo === "decimal") return Number(texto.replace(",", "."));
    if (campo?.tipo === "entero") return Number(texto);
    return texto;
};

/** Del modelo a la API: "" -> `null`, casillas a booleano e importes a número. */
export const fichaAApi = (
    pestaña: PestañaInforme,
    ficha: FichaInforme
): Record<string, unknown> => {
    const api: Record<string, unknown> = { descripcion: ficha.descripcion };
    camposPestaña(pestaña).forEach((campo) => {
        api[campo.id] = valorApi(campo, ficha[campo.id]);
    });
    return api;
};

/** Lo que ha cambiado, listo para el PATCH. */
export const cambiosFicha = (
    pestaña: PestañaInforme,
    previa: FichaInforme,
    actual: FichaInforme
): Record<string, unknown> => {
    const cambios: Record<string, unknown> = {};
    if (previa.descripcion !== actual.descripcion) {
        cambios.descripcion = actual.descripcion;
    }
    camposPestaña(pestaña).forEach((campo) => {
        if (previa[campo.id] !== actual[campo.id]) {
            cambios[campo.id] = valorApi(campo, actual[campo.id]);
        }
    });
    return cambios;
};

const conCasillas = (ficha: FichaInforme, ids: string[]): FichaInforme => {
    const pendientes = ids.filter((id) => typeof ficha[id] !== "boolean");
    if (pendientes.length === 0) return ficha;
    return {
        ...ficha,
        ...Object.fromEntries(pendientes.map((id) => [id, aBooleano(ficha[id])])),
    };
};

/** Descripción obligatoria, casillas como casilla (y booleanas) y las reglas
 * de la pestaña al cambiar un campo. */
export const metaFichaInforme = <T extends Modelo>(
    pestaña: PestañaInforme
): MetaModelo<T> => {
    const ids = casillas(pestaña);
    return {
        campos: {
            descripcion: { requerido: true },
            ...Object.fromEntries(
                ids.map((id) => [id, { tipo: "checkbox" as const }])
            ),
            ...Object.fromEntries(
                camposPestaña(pestaña)
                    .filter((c) => c.tipo === "decimal" || c.tipo === "entero")
                    .map((c) => [c.id, { tipo: c.tipo as "decimal" | "entero" }])
            ),
        },
        onChange: (modelo, campo) => {
            const ficha = conIntervalo(
                conCasillas(modelo as unknown as FichaInforme, ids),
                campo
            );
            const ajustada = pestaña.ajustar
                ? pestaña.ajustar(ficha, campo)
                : ficha;
            return ajustada as unknown as T;
        },
    };
};

const numero = (valor: number, decimales: number): string =>
    valor.toLocaleString("es-ES", {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales,
    });

/** Texto de una celda del resultado, igual que en el PDF. */
export const textoCelda = (
    valor: ValorCelda,
    tipo: TipoColumnaResultado
): string => {
    if (valor === null || valor === undefined || valor === "") return "";
    if (tipo === "fecha") {
        const [anyo, mes, dia] = String(valor).slice(0, 10).split("-");
        return `${dia}/${mes}/${anyo}`;
    }
    if (tipo === "moneda") return numero(Number(valor), 2);
    if (tipo === "cantidad") {
        const n = Number(valor);
        return numero(n, Number.isInteger(n) ? 0 : 2);
    }
    return String(valor);
};

export const esNumerica = (tipo: TipoColumnaResultado): boolean =>
    tipo === "moneda" || tipo === "cantidad" || tipo === "entero";

export const nombreFicheroInforme = (
    pestaña: PestañaInforme,
    ficha: Pick<FichaInforme, "descripcion">,
    modo: ModoInforme
): string => {
    const base = `${pestaña.clave}-${modo}-${ficha.descripcion || "informe"}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    return `${base}.pdf`;
};

export const etiquetaFichaInforme = (
    pestaña: PestañaInforme,
    ficha: Pick<FichaInforme, "descripcion">
): string => ficha.descripcion || pestaña.titulo;

/** Intervalos predefinidos de Eneboo (`flfactppal.calcularIntervalo`). */
export const OPCIONES_INTERVALO = [
    { valor: "", get descripcion() { return tComun("informeDocumentos.sinIntervalo"); } },
    { valor: "000001", get descripcion() { return tComun("informeDocumentos.hoy"); } },
    { valor: "000002", get descripcion() { return tComun("informeDocumentos.ayer"); } },
    { valor: "000003", get descripcion() { return tComun("informeDocumentos.estaSemana"); } },
    { valor: "000004", get descripcion() { return tComun("informeDocumentos.semanaPasada"); } },
    { valor: "000005", get descripcion() { return tComun("informeDocumentos.esteMes"); } },
    { valor: "000006", get descripcion() { return tComun("informeDocumentos.mesPasado"); } },
    { valor: "000007", get descripcion() { return tComun("informeDocumentos.esteAno"); } },
    { valor: "000008", get descripcion() { return tComun("informeDocumentos.anoPasado"); } },
    { valor: "000009", get descripcion() { return tComun("informeDocumentos.todasLasFechas"); } },
    { valor: "000010", get descripcion() { return tComun("informeDocumentos.hastaHoy"); } },
];

const iso = (fecha: Date): string => {
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${fecha.getFullYear()}-${mes}-${dia}`;
};

const sumarDias = (fecha: Date, dias: number): Date =>
    new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias);

/** Fechas desde/hasta de un intervalo ("" = sin fecha); `null` si el código
 * no es un intervalo. El servidor las vuelve a calcular al lanzar el informe. */
export const fechasIntervalo = (
    codigo: string,
    hoy: Date = new Date()
): [string, string] | null => {
    const lunes = sumarDias(hoy, -((hoy.getDay() + 6) % 7));
    const anyo = hoy.getFullYear();
    const mes = hoy.getMonth();
    switch (codigo) {
        case "000001":
            return [iso(hoy), iso(hoy)];
        case "000002":
            return [iso(sumarDias(hoy, -1)), iso(sumarDias(hoy, -1))];
        case "000003":
            return [iso(lunes), iso(sumarDias(lunes, 6))];
        case "000004":
            return [iso(sumarDias(lunes, -7)), iso(sumarDias(lunes, -1))];
        case "000005":
            return [iso(new Date(anyo, mes, 1)), iso(new Date(anyo, mes + 1, 0))];
        case "000006":
            return [iso(new Date(anyo, mes - 1, 1)), iso(new Date(anyo, mes, 0))];
        case "000007":
            return [`${anyo}-01-01`, `${anyo}-12-31`];
        case "000008":
            return [`${anyo - 1}-01-01`, `${anyo - 1}-12-31`];
        case "000009":
            return ["", ""];
        case "000010":
            return ["", iso(hoy)];
        default:
            return null;
    }
};

/** Intervalo -> sus fechas. El segundo es la fecha de entrada de los
 * pedidos de proveedor (`codintervaloe`). */
const INTERVALOS_FECHAS: Record<string, [string, string]> = {
    intervalo: ["fecha_desde", "fecha_hasta"],
    intervalo_entrada: ["fecha_entrada_desde", "fecha_entrada_hasta"],
};

/** `formUTIL.gestionIntervalo`: al elegir un intervalo se rellenan las fechas. */
export const conIntervalo = (
    ficha: FichaInforme,
    campo: string,
    hoy: Date = new Date()
): FichaInforme => {
    const destino = INTERVALOS_FECHAS[campo];
    if (!destino) return ficha;
    const fechas = fechasIntervalo(String(ficha[campo] ?? ""), hoy);
    if (!fechas) return ficha;
    return { ...ficha, [destino[0]]: fechas[0], [destino[1]]: fechas[1] };
};

export const MODOS_POR_DEFECTO: ModoCalculo[] = [
    { modo: "detalle", get etiqueta() { return tComun("informeDocumentos.calcularDetalle"); } },
    { modo: "resumen", get etiqueta() { return tComun("informeDocumentos.calcularResumen"); } },
];
