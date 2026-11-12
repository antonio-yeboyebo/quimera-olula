import { enlaceComoLlegar, enlaceLlamar, enlaceWhatsapp, textoEstadoTrato } from "./dominio.ts";

const direccion = {
    direccion: "C/ Dolores Ibárruri 2",
    codPostal: "50018",
    ciudad: "Zaragoza",
    provincia: "Zaragoza",
    latitud: null,
    longitud: null,
};

describe("enlaces de la ficha", () => {
    test("llamar quita espacios y guiones", () => {
        expect(enlaceLlamar("976 12-34 56")).toBe("tel:976123456");
        expect(enlaceLlamar(null)).toBeNull();
    });

    test("whatsapp añade el prefijo de España a los números de 9 cifras", () => {
        expect(enlaceWhatsapp("600 11 22 33")).toBe("https://wa.me/34600112233");
        expect(enlaceWhatsapp("+34 600112233")).toBe("https://wa.me/34600112233");
    });

    test("cómo llegar usa coordenadas si las hay y si no la dirección", () => {
        expect(enlaceComoLlegar({ ...direccion, latitud: 41.65, longitud: -0.88 })).toBe(
            "https://www.google.com/maps/dir/?api=1&destination=41.65%2C-0.88"
        );
        expect(enlaceComoLlegar(direccion)).toContain(encodeURIComponent("C/ Dolores Ibárruri 2, 50018, Zaragoza"));
    });

    test("el estado '-' es un trato abierto", () => {
        expect(textoEstadoTrato("-")).toBe("Abierto");
        expect(textoEstadoTrato("Ganado")).toBe("Ganado");
    });
});
