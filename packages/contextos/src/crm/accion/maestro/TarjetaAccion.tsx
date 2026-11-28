import { QAvatar, QIcono, QTarjetaGenerica } from "@olula/componentes/index.js";
import { formatearFechaDate } from "@olula/lib/dominio.js";
import { Accion } from "../diseño.ts";
import { textoEstadoAccion } from "../../comun/valores/texto_opcion.ts";

const iconoTipoAccion = (tipo: string) => {
  const icono = {
    Tarea: "tarea",
    "E-mail": "correo",
    Teléfono: "telefono",
    Visita: "casa",
    Otro: "llaveinglesa",
  };

  return icono[tipo as keyof typeof icono];
};

export const TarjetaAccion = (accion: Accion) => {
  return (
    <QTarjetaGenerica
      avatar={
        <QAvatar className={accion.estado}>
          <QIcono nombre={iconoTipoAccion(accion.tipo)} tamaño="sm" />
        </QAvatar>
      }
      arribaIzquierda={accion.descripcion}
      arribaDerecha={accion.fecha ? formatearFechaDate(accion.fecha) : ""}
      abajoIzquierda={textoEstadoAccion(accion.estado)}
      abajoDerecha={accion.nombre_cliente}
    />
  );
};
