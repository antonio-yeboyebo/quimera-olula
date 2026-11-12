import { ContextoVisita, TareaVisita } from "./diseño.ts";
import {
    contextoInicial,
    destinoAlTerminar,
    erroresCierreTrato,
    erroresFinalizacion,
    estadoSegunTarea,
    finalizacionParaAPI,
} from "./dominio.ts";

const tarea = (datos: Partial<TareaVisita> = {}): TareaVisita => ({
    id: "7",
    titulo: "Visita",
    tipo: "Cita",
    fecha: "2026-10-28",
    hora: "10:00:00",
    completada: false,
    enCurso: false,
    fechaInicio: null,
    horaInicio: null,
    posicionInicio: null,
    nota: "",
    idTrato: "40",
    codCliente: "000123",
    nombreCliente: "Clínica",
    interlocutor: null,
    ...datos,
});

const contexto = (datos: Partial<ContextoVisita> = {}): ContextoVisita => ({
    ...contextoInicial,
    estado: "FINALIZANDO",
    tarea: tarea(),
    horaFin: "11:15",
    ...datos,
});

describe("estadoSegunTarea", () => {
    test("pendiente, en curso o terminada según la tarea", () => {
        expect(estadoSegunTarea(tarea())).toBe("PENDIENTE");
        expect(estadoSegunTarea(tarea({ enCurso: true }))).toBe("EN_CURSO");
        expect(estadoSegunTarea(tarea({ completada: true }))).toBe("TERMINADA");
    });
});

describe("validaciones", () => {
    test("la finalización exige hora y limita la nota", () => {
        expect(erroresFinalizacion(contexto())).toEqual([]);
        expect(erroresFinalizacion(contexto({ horaFin: "" }))).toHaveLength(1);
        expect(erroresFinalizacion(contexto({ nota: "x".repeat(1001) }))).toHaveLength(1);
    });

    test("cerrar como perdido exige causa", () => {
        expect(erroresCierreTrato(contexto({ estadoTrato: "Ganado" }))).toEqual([]);
        expect(erroresCierreTrato(contexto({ estadoTrato: "Perdido" }))).toEqual(["Indica la causa de la pérdida"]);
        expect(erroresCierreTrato(contexto({ estadoTrato: "Perdido", idCausa: "3" }))).toEqual([]);
    });
});

describe("finalizacionParaAPI", () => {
    test("usa la fecha de inicio de la visita y la hora de fin con segundos", () => {
        const api = finalizacionParaAPI(
            contexto({ tarea: tarea({ fechaInicio: "2026-10-27" }), interlocutor: "C001" }),
            { latitud: 41.6, longitud: -0.9 },
            new Date(2026, 9, 28)
        );
        expect(api).toEqual({
            completada: true,
            fechafin: "2026-10-27",
            horafin: "11:15:00",
            latitudfin: 41.6,
            longitudfin: -0.9,
            nota: "",
            interlocutor: "C001",
        });
    });
});

describe("destinoAlTerminar", () => {
    test("presupuesto o pedido llevan al trato", () => {
        expect(destinoAlTerminar(contexto({ siguientePaso: "pedido" }))).toBe("/ss/mi-trato/40");
    });

    test("generar siguiente tarea precarga cliente y, si sigue abierto, el trato", () => {
        expect(destinoAlTerminar(contexto({ generarSiguiente: true }))).toBe("/ss/mi-tarea/nueva?cliente=000123&trato=40");
        expect(destinoAlTerminar(contexto({ generarSiguiente: true, tratoCerrado: true }))).toBe(
            "/ss/mi-tarea/nueva?cliente=000123"
        );
    });

    test("si no, vuelve a la agenda", () => {
        expect(destinoAlTerminar(contexto())).toBe("/ss/mi-agenda");
    });
});
