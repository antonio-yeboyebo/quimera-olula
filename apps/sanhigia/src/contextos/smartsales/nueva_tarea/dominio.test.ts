import { FormularioTarea } from "./diseño.ts";
import { erroresFormulario, sugerenciasVisibles, tareaParaAPI, tituloTarea } from "./dominio.ts";

const formulario = (datos: Partial<FormularioTarea> = {}): FormularioTarea => ({
    cliente: { codigo: "000123", nombre: "Clínica Dental ABC" },
    idTrato: null,
    tipo: "Cita",
    fecha: "2026-10-30",
    hora: "10:30",
    idMotivo: "2",
    producto: null,
    nota: "",
    ...datos,
});

const motivos = [{ id: "2", descripcion: "Presentación" }];

describe("erroresFormulario", () => {
    test("exige cliente y limita la nota a 1000 caracteres", () => {
        expect(erroresFormulario(formulario())).toEqual([]);
        expect(erroresFormulario(formulario({ cliente: null }))).toEqual(["Elige un cliente"]);
        expect(erroresFormulario(formulario({ nota: "x".repeat(1001) }))).toHaveLength(1);
    });
});

describe("tareaParaAPI", () => {
    test("el título junta tipo, cliente y motivo, y Cita se llama Visita", () => {
        expect(tituloTarea(formulario(), motivos)).toBe("Visita · Clínica Dental ABC · Presentación");
    });

    test("manda el producto en el campo de su nivel y la hora con segundos", () => {
        const api = tareaParaAPI(
            formulario({ producto: { tipo: "subfamilia", codigo: "PTE", descripcion: "PTE" } }),
            motivos
        );
        expect(api).toMatchObject({
            hora: "10:30:00",
            idmotivo: 2,
            referencia: null,
            codfamilia: null,
            codsubfamilia: "PTE",
        });
    });
});

describe("sugerenciasVisibles", () => {
    test("por defecto solo las de afinidad superior al 70 %", () => {
        const sugerencias = [
            { codSubfamilia: "A", descripcion: "A", score: 0.92 },
            { codSubfamilia: "B", descripcion: "B", score: 0.7 },
        ];
        expect(sugerenciasVisibles(sugerencias, false).map((s) => s.codSubfamilia)).toEqual(["A"]);
        expect(sugerenciasVisibles(sugerencias, true)).toHaveLength(2);
    });
});
