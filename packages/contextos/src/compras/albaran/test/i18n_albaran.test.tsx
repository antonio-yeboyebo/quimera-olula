import { cambiarIdioma } from "@olula/lib/i18n/i18n.ts";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { BorrarLineaAlbaran } from "../borrar_linea/BorrarLineaAlbaran.tsx";
import { metaTablaLineaAlbaran } from "../detalle/lineas/metatabla_linea_albaran.tsx";
import { Albaran, LineaAlbaran } from "../diseño.ts";
import { FacturarAlbaran } from "../facturar/FacturarAlbaran.tsx";

afterEach(async () => {
    await act(() => cambiarIdioma("es"));
});

describe("Albaranes de compra en español e inglés", () => {
    test("facturar el albarán", async () => {
        render(<FacturarAlbaran albaran={{ id: "1", codigo: "A001" } as Albaran} publicar={async () => {}} />);
        expect(screen.getByText("¿Facturar el albarán A001?")).toBeInTheDocument();
        await act(() => cambiarIdioma("en"));
        expect(screen.getByText("Invoice the delivery note A001?")).toBeInTheDocument();
    });

    test("borrar una línea que viene de un pedido avisa del reajuste", async () => {
        await cambiarIdioma("en");
        const linea = { id: "1", referencia: null, descripcion: "Tornillos", pedidoId: "7" } as unknown as LineaAlbaran;
        render(<BorrarLineaAlbaran albaran={{ id: "1" } as Albaran} linea={linea} publicar={async () => {}} />);
        expect(screen.getByText(/delete the line "Tornillos"\? The quantity received/)).toBeInTheDocument();
        expect(metaTablaLineaAlbaran().map((c) => c.cabecera)).toContain("Cost");
    });
});
