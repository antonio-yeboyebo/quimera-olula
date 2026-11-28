import { QEtiqueta, QTarjetaGenerica } from "@olula/componentes/index.js";
import { ReactNode } from "react";
import "./TarjetaConfiguracionCrm.css";
import { tCrm } from "../../i18n/index.ts";

export const TarjetaConfiguracionCrm = ({
  codigo,
  descripcion,
  valorDefecto,
  derecha,
  abajoDerecha,
}: {
  codigo: string;
  descripcion?: string | null;
  valorDefecto?: boolean;
  derecha?: ReactNode;
  abajoDerecha?: ReactNode;
}) => {
  const badge = valorDefecto ? (
    <QEtiqueta variante="exito" className="tarjeta-config-defecto">
      {tCrm("comun.porDefecto")}
    </QEtiqueta>
  ) : undefined;

  const codigoNode = <span className="tarjeta-config-codigo">{codigo}</span>;

  return (
    <article className="TarjetaConfiguracionCrm">
      <QTarjetaGenerica
        arribaIzquierda={
          <span className="tarjeta-config-descripcion">
            {descripcion || codigo}
          </span>
        }
        arribaDerecha={derecha ?? badge}
        abajoIzquierda={derecha ? badge : codigoNode}
        abajoDerecha={abajoDerecha}
      />
    </article>
  );
};
