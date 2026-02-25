import "./qicono.css";

type QIconoProps = {
  nombre: string;
  tamaño?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: string;
  style?: React.CSSProperties;
  props?: React.HTMLAttributes<HTMLDivElement>;
};

type Icono = {
  nombre: string;
  tipo?: "solid" | "regular" | "logo";
};

const iconos: Record<string, string | Icono> = {
  añadir: "plus-circle",
  buscar: "search-alt-2",
  cerrar: "x",
  inicio: "home",
  fichero: "file",
  grafico_barras: "bar-chart-alt-2",
  candado: "lock-alt",
  candado_abierto: "lock-open-alt",
  editar: "edit",
  editar_2: "edit-alt",
  eliminar: "trash",
  guardar: "save",
  copiar: "copy",
  usuario: "user",
  perfil: "user",
  cerrar_sesion: "arrow-out-up-square-half",
  verdadero: "check",
  falso: "x",
  atras: "chevron-left",
  adelante: "chevron-right",
  menu: "menu",
  calendario_vacio: "calendar-alt",
  check: "check",
  x_circle: "x-circle",
  minus: "minus",
  lista: "list-ul",
  carrito: "cart",
  tarjeta: "credit-card",
  ver: "show",
  crear: "plus",
  tabla: "table",
  arriba: "chevron-up",
  abajo: "chevron-down",
  izquierda: "chevron-left",
  derecha: "chevron-right",
  circulo: { nombre: "circle", tipo: "regular" },
  circulo_relleno: { nombre: "circle", tipo: "solid" },
};

export const QIcono = ({
  nombre,
  tamaño = "md",
  color,
  style,
  ...props
}: QIconoProps) => {
  let nombreIcono, tipo;

  if (typeof iconos[nombre] === "object") {
    nombreIcono = iconos[nombre].nombre;
    tipo = iconos[nombre].tipo;
  } else {
    nombreIcono = iconos[nombre];
    tipo = undefined;
  }

  return (
    <quimera-icono>
      <box-icon
        name={nombreIcono}
        size={tamaño}
        color={color}
        style={style}
        type={tipo}
        {...props}
      ></box-icon>
    </quimera-icono>
  );
};
