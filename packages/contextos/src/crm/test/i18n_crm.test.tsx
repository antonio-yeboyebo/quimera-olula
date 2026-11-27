import { cambiarIdioma } from "@olula/lib/i18n/i18n.ts";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { BorrarAccion } from "../accion/borrar/BorrarAccion.tsx";
import { metaTablaAccion } from "../accion/maestro/maestro.ts";
import { opcionesEstadoIncidencia } from "../comun/componentes/EstadoIncidencia.tsx";
import { opcionesTipoAccion } from "../comun/valores/tipo_accion.ts";
import { textoEstadoAccion, textoTipoAccion } from "../comun/valores/texto_opcion.ts";
import { metaNuevoEstadoLead } from "../estadoLead/crear/crear.ts";
import { tCrm } from "../i18n/index.ts";

afterEach(async () => {
    await act(() => cambiarIdioma("es"));
    localStorage.clear();
});

describe("CRM en español e inglés", () => {
    test("las columnas del maestro se traducen al leerlas", async () => {
        expect(metaTablaAccion.map((c) => c.cabecera)).toEqual(["Código", "Fecha", "Descripción", "Tipo", "Estado"]);
        await cambiarIdioma("en");
        expect(metaTablaAccion.map((c) => c.cabecera)).toEqual(["Code", "Date", "Description", "Type", "Status"]);
    });

    test("opciones y valores de la BD: se traduce lo que se ve, el valor guardado no cambia", async () => {
        const accion = { tipo: "Visita", estado: "Pendiente" } as never;
        const columnaTipo = metaTablaAccion.find((c) => c.id === "tipo");
        expect(columnaTipo?.render?.(accion)).toBe("Visita");
        await cambiarIdioma("en");
        expect(opcionesTipoAccion[1]).toEqual({ valor: "Visita", descripcion: "Visit" });
        expect(opcionesEstadoIncidencia[1]).toEqual({ valor: "en_espera", descripcion: "On hold" });
        expect(columnaTipo?.render?.(accion)).toBe("Visit");
        expect(textoEstadoAccion("Hecha")).toBe("Done");
        expect(textoTipoAccion("Desconocido")).toBe("Desconocido");
    });

    test("validaciones y plurales en el idioma activo", async () => {
        const validar = metaNuevoEstadoLead.campos?.id?.validacion as (m: unknown) => unknown;
        expect(validar({ id: "" })).toBe("El código es obligatorio");
        expect(tCrm("oportunidadventa.vencidaHace", { count: 1 })).toBe("Vencida hace 1 día");
        await cambiarIdioma("en");
        expect(validar({ id: "" })).toBe("The code is required");
        expect(tCrm("oportunidadventa.vencidaHace", { count: 3 })).toBe("Overdue by 3 days");
        expect(tCrm("oportunidadventa.accionesPendientes", { count: 1 })).toBe("1 pending action");
    });

    test("un componente cambia de idioma en caliente", async () => {
        render(<BorrarAccion accion={{ id: "1" } as never} publicar={async () => {}} />);
        expect(screen.getByText("¿Está seguro de que desea borrar esta acción?")).toBeInTheDocument();
        await act(() => cambiarIdioma("en"));
        expect(screen.getByText("Are you sure you want to delete this action?")).toBeInTheDocument();
    });
});
