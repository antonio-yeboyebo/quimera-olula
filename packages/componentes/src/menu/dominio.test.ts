import { ElementoMenu } from "@olula/lib/menu.ts";
import {
  agruparPorArea,
  anotarReciente,
  detalleResultadoDatos,
  aplanarMenu,
  buscarPantallas,
  normalizar,
  partesCoincidencia,
  traducirPantalla,
  urlActiva,
} from "./dominio.ts";
import { cambiarIdioma } from "@olula/lib/i18n/i18n.ts";
import { nombreMenu } from "../i18n/textos.ts";

const menu: ElementoMenu[] = [
  // Así llega Inicio desde crearMenu: grupo con url y sin subelementos
  { nombre: "Inicio", url: "/", icono: "inicio", subelementos: [] } as ElementoMenu,
  {
    nombre: "Ventas",
    icono: "menu_ventas",
    area: "Comercial",
    subelementos: [
      { nombre: "Facturas", url: "/ventas/factura", alias: ["facturación"] },
      { nombre: "Clientes", url: "/ventas/cliente", regla: "ventas.cliente" },
    ],
  },
  {
    nombre: "Almacén",
    icono: "menu_almacen",
    area: "Operaciones",
    subelementos: [
      { nombre: "Stock", url: "/almacen/stock", alias: ["existencias"] },
      { nombre: "Transferencias de stock", url: "/almacen/transferencias" },
    ],
  },
];

const todo = () => true;

describe("menú lateral y búsqueda rápida", () => {
  test("normaliza sin acentos y resalta la coincidencia", () => {
    expect(normalizar("Almacén")).toBe("almacen");
    expect(partesCoincidencia("Almacén", "macen")).toEqual({
      antes: "Al",
      coincide: "macén",
      despues: "",
    });
    expect(partesCoincidencia("Stock", "")).toEqual({
      antes: "Stock",
      coincide: "",
      despues: "",
    });
  });

  test("aplana el menú respetando permisos y hereda el icono del grupo", () => {
    const pantallas = aplanarMenu(menu, (regla) => regla !== "ventas.cliente");
    expect(pantallas.map((p) => `${p.grupo}/${p.nombre}`)).toEqual([
      "/Inicio",
      "Ventas/Facturas",
      "Almacén/Stock",
      "Almacén/Transferencias de stock",
    ]);
    expect(pantallas[1].icono).toBe("menu_ventas");
  });

  test("la pantalla activa incluye las rutas de detalle", () => {
    const urls = ["/", "/ventas/factura", "/ventas/facturacion"];
    expect(urlActiva(urls, "/ventas/factura/123")).toBe("/ventas/factura");
    expect(urlActiva(urls, "/ventas/facturacion")).toBe("/ventas/facturacion");
    expect(urlActiva(urls, "/")).toBe("/");
    expect(urlActiva(urls, "/otra")).toBeUndefined();
  });

  test("agrupa por áreas en su orden y deja sin área al principio", () => {
    const grupos = [
      { nombre: "Almacén", area: "Operaciones" },
      { nombre: "Inicio" },
      { nombre: "Extra", area: "Mi área" },
      { nombre: "Ventas", area: "Comercial" },
    ];
    expect(agruparPorArea(grupos).map((a) => a.area)).toEqual([
      "",
      "Comercial",
      "Operaciones",
      "Mi área",
    ]);
  });

  test("busca por nombre, grupo y sinónimos, con relevancia", () => {
    const pantallas = aplanarMenu(menu, todo);
    expect(buscarPantallas(pantallas, "stock").map((p) => p.nombre)).toEqual([
      "Stock",
      "Transferencias de stock",
    ]);
    expect(buscarPantallas(pantallas, "existencias")[0]).toMatchObject({
      nombre: "Stock",
      aliasCoincide: "existencias",
    });
    expect(buscarPantallas(pantallas, "almacen").map((p) => p.nombre)).toEqual([
      "Stock",
      "Transferencias de stock",
    ]);
    expect(buscarPantallas(pantallas, "zzz")).toEqual([]);
  });

  test("en inglés busca por el nombre traducido y también por el español", async () => {
    await cambiarIdioma("en");
    try {
      const pantallas = aplanarMenu(menu, todo).map((p) => traducirPantalla(p, nombreMenu));
      const clientes = pantallas.find((p) => p.url === "/ventas/cliente");
      expect(clientes).toMatchObject({ nombre: "Customers", grupo: "Sales" });
      expect(buscarPantallas(pantallas, "custom")[0].nombre).toBe("Customers");
      expect(buscarPantallas(pantallas, "clientes")[0]).toMatchObject({
        nombre: "Customers",
        aliasCoincide: "Clientes",
      });
    } finally {
      await cambiarIdioma("es");
    }
  });

  test("recientes: sin repetir y con máximo", () => {
    expect(anotarReciente(["/a", "/b", "/c"], "/b")).toEqual(["/b", "/a", "/c"]);
    expect(anotarReciente(["/a", "/b", "/c"], "/d")).toEqual(["/d", "/a", "/b"]);
  });

  test("detalle de un dato: nombre, fecha e importe", () => {
    expect(
      detalleResultadoDatos({
        id: 7,
        titulo: "FV1",
        detalle: "Ferretería Ruiz",
        fecha: "2026-10-22",
        importe: 1284.3,
      })
    ).toMatch(/^Ferretería Ruiz · 22\/10\/2026 · 1\.284,30\s€$/);
    expect(
      detalleResultadoDatos({ id: "C1", titulo: "Ruiz", detalle: "C1 · B123", fecha: null, importe: null })
    ).toBe("C1 · B123");
  });
});

describe("menú: entradas condicionadas a un plugin", () => {
  const conPlugins = (plugins: Record<string, string>) =>
    localStorage.setItem("whoami", JSON.stringify({ plugins }));

  const menuTesoreria: ElementoMenu[] = [
    {
      nombre: "Tesorería",
      subelementos: [
        { nombre: "Remesas de cobro", url: "/tesoreria/remesa" },
        { nombre: "Remesas de pago", url: "/tesoreria/remesa_pago", plugin: "remesa_pago" },
      ],
    },
  ];

  const urls = () => aplanarMenu(menuTesoreria, todo).map((p) => p.url);

  afterEach(() => localStorage.removeItem("whoami"));

  test("se muestra si el plugin está activo", () => {
    conPlugins({ remesa_pago: "Activo" });
    expect(urls()).toEqual(["/tesoreria/remesa", "/tesoreria/remesa_pago"]);
  });

  test("se oculta si el plugin está inactivo o no viene", () => {
    conPlugins({ remesa_pago: "inactivo" });
    expect(urls()).toEqual(["/tesoreria/remesa"]);
    localStorage.removeItem("whoami");
    expect(urls()).toEqual(["/tesoreria/remesa"]);
  });
});
