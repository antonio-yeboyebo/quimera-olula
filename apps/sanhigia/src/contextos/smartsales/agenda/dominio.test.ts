import { Tarea } from "../comun/diseño.ts";
import { agruparPorDia, bloquesProximas, desplazar, diasDeLaSemana, rangoVista } from "./dominio.ts";

const tarea = (id: string, fecha: string, hora = "10:00:00"): Tarea => ({
    id,
    titulo: id,
    fecha,
    hora,
    tipo: "Llamada",
    completada: false,
    enCurso: false,
    nombreCliente: null,
    nombreContacto: null,
});

const miercoles = new Date(2026, 9, 28);

describe("rangoVista", () => {
    test("el día es solo la fecha de referencia", () => {
        expect(rangoVista("dia", miercoles)).toEqual({ desde: "2026-10-28", hasta: "2026-10-28" });
    });

    test("la semana va de lunes a domingo", () => {
        expect(rangoVista("semana", miercoles)).toEqual({ desde: "2026-10-26", hasta: "2026-11-01" });
        expect(rangoVista("semana", new Date(2026, 10, 1))).toEqual({ desde: "2026-10-26", hasta: "2026-11-01" });
    });

    test("el mes va del día 1 al último", () => {
        expect(rangoVista("mes", miercoles)).toEqual({ desde: "2026-10-01", hasta: "2026-10-31" });
    });
});

describe("desplazar", () => {
    test("avanza un día, una semana o un mes", () => {
        expect(rangoVista("dia", desplazar("dia", miercoles, -1)).desde).toBe("2026-10-27");
        expect(rangoVista("semana", desplazar("semana", miercoles, 1)).desde).toBe("2026-11-02");
        expect(rangoVista("mes", desplazar("mes", new Date(2026, 0, 31), 1)).desde).toBe("2026-02-01");
    });
});

describe("agruparPorDia", () => {
    test("agrupa por fecha y ordena por hora", () => {
        const grupos = agruparPorDia([
            tarea("b", "2026-10-29", "09:00:00"),
            tarea("a2", "2026-10-28", "12:00:00"),
            tarea("a1", "2026-10-28", "08:00:00"),
        ]);
        expect(grupos.map(([fecha, tareas]) => [fecha, tareas.map((t) => t.id)])).toEqual([
            ["2026-10-28", ["a1", "a2"]],
            ["2026-10-29", ["b"]],
        ]);
    });
});

describe("bloquesProximas", () => {
    test("separa hoy, mañana y próximamente", () => {
        const bloques = bloquesProximas(
            [tarea("hoy", "2026-10-28"), tarea("mañana", "2026-10-29"), tarea("luego", "2026-11-10")],
            miercoles
        );
        expect(bloques.hoy.map((t) => t.id)).toEqual(["hoy"]);
        expect(bloques.mañana.map((t) => t.id)).toEqual(["mañana"]);
        expect(bloques.proximamente.map((t) => t.id)).toEqual(["luego"]);
    });
});

describe("diasDeLaSemana", () => {
    test("devuelve de lunes a domingo de la semana de referencia", () => {
        const dias = diasDeLaSemana(miercoles).map((dia) => dia.getDate());
        expect(dias).toEqual([26, 27, 28, 29, 30, 31, 1]);
    });

    test("el domingo pertenece a la semana que empieza el lunes anterior", () => {
        expect(diasDeLaSemana(new Date(2026, 10, 1))[0].getDate()).toBe(26);
    });
});
