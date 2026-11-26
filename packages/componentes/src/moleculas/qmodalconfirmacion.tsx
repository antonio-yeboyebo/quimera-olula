import { useTComponentes } from "../i18n/textos.ts";
import { ContextoError } from "@olula/lib/contexto.js";
import { PropsWithChildren, useContext, useRef, useState } from "react";
import { iconoAccionBoton } from "../atomos/icono_accion.ts";
import { QBoton } from "../atomos/qboton.tsx";
import { QModal } from "./qmodal.tsx";

interface QModalConfirmacionProps {
  nombre: string;
  abierto: boolean;
  titulo: string;
  mensaje?: string;
  onCerrar: () => void;
  onAceptar: () => void | Promise<void>;
  labelAceptar?: string;
  labelCancelar?: string;
  mostrarCancelar?: boolean;
  pantallaCompletaMovil?: boolean;
  destructivo?: boolean;
}

export const QModalConfirmacion = ({
  nombre,
  abierto,
  titulo,
  mensaje,
  onCerrar,
  onAceptar,
  labelAceptar,
  labelCancelar,
  mostrarCancelar = true,
  pantallaCompletaMovil = false,
  destructivo,
  children,
}: PropsWithChildren<QModalConfirmacionProps>) => {
  // «Borrar línea», «Eliminar asociación»…: el botón que confirma va en rojo y
  // dice lo que hace («Borrar»), salvo que la pantalla indique otra cosa.
  const t = useTComponentes();
  const esBorrado = iconoAccionBoton(titulo) === "eliminar";
  const botonDestructivo = destructivo ?? esBorrado;
  const textoAceptar =
    labelAceptar ?? (esBorrado ? titulo.trim().split(/\s+/)[0] : t("comun.aceptar"));
  const { intentar } = useContext(ContextoError);
  const [guardando, setGuardando] = useState(false);
  const bloqueadoRef = useRef(false);

  const aceptar = async () => {
    if (bloqueadoRef.current) return;

    bloqueadoRef.current = true;
    setGuardando(true);

    try {
      await intentar(onAceptar);
    } finally {
      bloqueadoRef.current = false;
      setGuardando(false);
    }
  };

  const cancelar = () => {
    if (guardando) return;
    onCerrar();
  };

  return (
    <QModal
      nombre={nombre}
      abierto={abierto}
      titulo={titulo}
      onCerrar={cancelar}
      bloquearCierre={guardando}
      mostrarBotonCerrar={!guardando}
      pantallaCompletaMovil={pantallaCompletaMovil}
    >
      <div className="mensaje" style={{ whiteSpace: "pre-line" }}>
        {mensaje}
      </div>
      {/* Contenido adicional bajo el mensaje (p. ej. un resumen de lo que se va a hacer). */}
      {children}
      <div className="botones">
        {mostrarCancelar && (
          <QBoton
            tipo="reset"
            variante="texto"
            onClick={cancelar}
            deshabilitado={guardando}
          >
            {labelCancelar ?? t("comun.cancelar")}
          </QBoton>
        )}
        <QBoton onClick={aceptar} deshabilitado={guardando} destructivo={botonDestructivo}>
          {guardando ? t("comun.procesando") : textoAceptar}
        </QBoton>
      </div>
    </QModal>
  );
};
