export interface ElementoMenuPadre {
  nombre: string;
  icono?: string;
  subelementos: ElementoMenu[];
}

export interface ElementoMenuHijo {
  nombre: string;
  icono?: string;
  url: string;
}

export type ElementoMenu = ElementoMenuPadre | ElementoMenuHijo;

export const elementosDelMenu: ElementoMenu[] = [
  { nombre: "Inicio", url: "/", icono: "inicio" },
  {
    nombre: "Ventas",
    icono: "fichero",
    subelementos: [
      {
        nombre: "Clientes",
        url: "/ventas/cliente",
        icono: "",
      },
      {
        nombre: "Presupuestos",
        url: "/ventas/presupuesto",
        icono: "",
      },
    ],
  },
  {
    nombre: "Financiera", icono: "grafico_barras", subelementos: [{
      nombre: "Cuentas",
      url: "/financiera/cuenta",
      icono: "",
    }]
  },
];
