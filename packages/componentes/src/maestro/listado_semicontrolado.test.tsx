import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { MetaTabla } from "../atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "./ListadoSemiControlado.tsx";

type Pago = { id: string; tipo: string };

const metaTabla: MetaTabla<Pago> = [{ id: "tipo", cabecera: "Tipo" }];

const listado = (modo: "tabla" | "tarjetas") => (
    <ListadoSemiControlado
        metaTabla={metaTabla}
        entidades={[{ id: "1", tipo: "Pago" }]}
        totalEntidades={1}
        seleccionada={null}
        onSeleccion={() => null}
        criteriaInicial={criteriaDefecto}
        onCriteriaChanged={() => null}
        modo={modo}
    />
);

const pulsado = (nombre: string) =>
    screen.getByRole("button", { name: nombre }).getAttribute("aria-pressed");

describe("ListadoSemiControlado: selector de modo", () => {
    test("con un modo fijado y sin onModoChanged, el selector sí cambia el modo", () => {
        render(listado("tabla"));
        expect(pulsado("Tabla")).toBe("true");

        fireEvent.click(screen.getByRole("button", { name: "Tarjetas" }));

        expect(pulsado("Tarjetas")).toBe("true");
        expect(screen.queryByRole("table")).toBeNull();
    });

    test("si la pantalla cambia el modo, manda el nuevo", () => {
        const { rerender } = render(listado("tabla"));
        rerender(listado("tarjetas"));
        expect(pulsado("Tarjetas")).toBe("true");
    });
});
