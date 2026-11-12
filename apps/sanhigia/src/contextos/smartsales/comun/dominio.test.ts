import { Tarea } from "./diseño.ts";
import {
    estadoTarea,
    nivelAfinidad,
    porcentajeConseguido,
    porcentajeTiempoTranscurrido,
    rangoPeriodo,
    rangoTrimestre,
    tareaAtrasada,
    trimestreDe,
} from "./dominio.ts";

const tarea = (datos: Partial<Tarea> = {}): Tarea => ({
    id: "1",
    titulo: "Visita",
    fecha: "2026-10-28",
    hora: "10:00:00",
    tipo: "Cita",
    completada: false,
    enCurso: false,
    nombreCliente: null,
    nombreContacto: null,
    ...datos,
});

describe("nivelAfinidad", () => {
    test("aplica los umbrales de 85, 70 y 50 %", () => {
        expect(nivelAfinidad(0.85)).toBe("muy_alta");
        expect(nivelAfinidad(0.84)).toBe("alta");
        expect(nivelAfinidad(0.7)).toBe("alta");
        expect(nivelAfinidad(0.5)).toBe("media");
        expect(nivelAfinidad(0.49)).toBeNull();
    });
});

describe("porcentajeTiempoTranscurrido", () => {
    const trimestre = { desde: "2026-10-01", hasta: "2026-12-31" };

    test("cuenta el día de hoy como transcurrido", () => {
        expect(porcentajeTiempoTranscurrido(trimestre, new Date(2026, 9, 1))).toBeCloseTo(100 / 92);
    });

    test("es 0 antes del periodo y 100 después", () => {
        expect(porcentajeTiempoTranscurrido(trimestre, new Date(2026, 8, 30))).toBe(0);
        expect(porcentajeTiempoTranscurrido(trimestre, new Date(2027, 0, 1))).toBe(100);
    });
});

describe("porcentajeConseguido", () => {
    test("es nulo sin objetivo", () => {
        expect(porcentajeConseguido(10, 0)).toBeNull();
        expect(porcentajeConseguido(10, 40)).toBe(25);
    });
});

describe("tareaAtrasada", () => {
    const ahora = new Date(2026, 9, 28, 12, 0);

    test("una tarea de hoy cuya hora ya ha pasado está atrasada", () => {
        expect(tareaAtrasada(tarea({ hora: "10:00:00" }), ahora)).toBe(true);
        expect(tareaAtrasada(tarea({ hora: "13:00:00" }), ahora)).toBe(false);
    });

    test("sin hora solo está atrasada si su fecha es anterior a hoy", () => {
        expect(tareaAtrasada(tarea({ hora: null }), ahora)).toBe(false);
        expect(tareaAtrasada(tarea({ hora: null, fecha: "2026-10-27" }), ahora)).toBe(true);
    });

    test("una tarea completada nunca está atrasada", () => {
        expect(tareaAtrasada(tarea({ fecha: "2026-01-01", completada: true }), ahora)).toBe(false);
    });

    test("en curso tiene prioridad sobre atrasada", () => {
        expect(estadoTarea(tarea({ enCurso: true }), ahora)).toBe("en_curso");
        expect(estadoTarea(tarea(), ahora)).toBe("atrasada");
    });
});

describe("trimestres", () => {
    test("calcula el trimestre y su rango", () => {
        expect(trimestreDe(new Date(2026, 9, 28))).toEqual({ año: 2026, numero: 4 });
        expect(rangoTrimestre({ año: 2026, numero: 1 })).toEqual({ desde: "2026-01-01", hasta: "2026-03-31" });
    });

    test("el rango de varios trimestres va del primer día al último", () => {
        expect(
            rangoPeriodo({
                tipo: "trimestres",
                trimestres: [
                    { año: 2026, numero: 3 },
                    { año: 2026, numero: 1 },
                ],
            })
        ).toEqual({ desde: "2026-01-01", hasta: "2026-09-30" });
    });
});
