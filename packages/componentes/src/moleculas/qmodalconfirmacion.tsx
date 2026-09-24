import { ContextoError } from "@olula/lib/contexto.js";
import { useContext, useRef, useState } from "react";
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
  labelAceptar = "Aceptar",
  labelCancelar = "Cancelar",
  mostrarCancelar = true,
  pantallaCompletaMovil = false,
  destructivo = false,
}: QModalConfirmacionProps) => {
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
      <div className="botones">
        {mostrarCancelar && (
          <QBoton
            tipo="reset"
            variante="texto"
            onClick={cancelar}
            deshabilitado={guardando}
          >
            {labelCancelar}
          </QBoton>
        )}
        <QBoton onClick={aceptar} deshabilitado={guardando} destructivo={destructivo}>
          {guardando ? "Procesando..." : labelAceptar}
        </QBoton>
      </div>
    </QModal>
  );
};
