import { QAvatar, QIcono, QTarjetaGenerica } from "@olula/componentes/index.js";
import type { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearFechaDate } from "@olula/lib/dominio.js";
import { Accion } from "../diseño.ts";
import "./TarjetaAccionRapida.css";
import { textoEstadoAccion } from "../../comun/valores/texto_opcion.ts";

const iconoTipoAccion = (tipo: string) => {
  const icono: Record<string, string> = {
    Tarea: "tarea",
    "E-mail": "correo",
    Teléfono: "telefono",
    Visita: "casa",
    Otro: "llaveinglesa",
  };

  return icono[tipo] ?? "llaveinglesa";
};

const estaVencida = (fecha: Date | null): boolean => {
  if (!fecha) return false;

  const fechaAccion = new Date(fecha);
  fechaAccion.setHours(0, 0, 0, 0);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return fechaAccion < hoy;
};

export const TarjetaAccionRapida = ({
  accion,
}: {
  accion: Accion;
  publicar: EmitirEvento;
}) => {
  const vencida = estaVencida(accion.fecha);
  // const deshabilitarFinalizar = accion.estado === "Hecha";

  return (
    <QTarjetaGenerica
      avatar={
        <QAvatar className={accion.estado}>
          <QIcono nombre={iconoTipoAccion(accion.tipo)} tamaño="sm" />
        </QAvatar>
      }
      arribaIzquierda={accion.descripcion}
      arribaDerecha={
        accion.fecha ? (
          <span className={vencida ? "tarjeta-accion-fecha-vencida" : ""}>
            {formatearFechaDate(accion.fecha)}
          </span>
        ) : (
          ""
        )
      }
      abajoIzquierda={
        accion.estado === "Hecha" && accion.fecha_fin
          ? `${textoEstadoAccion(accion.estado)} · ${formatearFechaDate(accion.fecha_fin)}`
          : textoEstadoAccion(accion.estado)
      }
      abajoDerecha={accion.nombre_cliente}
      // expansion={
      //   <div className="tarjeta-accion-rapida-acciones">
      //     <QBoton
      //       tamaño="pequeño"
      //       variante="borde"
      //       deshabilitado={deshabilitarFinalizar}
      //       onClick={(e) => {
      //         e.stopPropagation();
      //         if (deshabilitarFinalizar) return;
      //         publicar("accion_finalizada_rapido", accion.id);
      //       }}
      //     >
      //       Finalizar
      //     </QBoton>
      //   </div>
      // }
    />
  );
};
// Poder tener un estilo de tarjeta para no resaltadas, que no se vea tan grande
// tener un estandar https://mui.com/material-ui/customization/default-theme/
