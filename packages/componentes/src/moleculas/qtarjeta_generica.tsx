import { useState } from "react";
import { QBoton } from "../atomos/qboton.tsx";
import "./qtarjeta_generica.css";
import { useTComponentes } from "../i18n/textos.ts";

type QTarjetaGenericaProps = {
  mostrarTodo?: boolean;
  avatar?: React.ReactNode;
  arribaIzquierda?: string | React.ReactNode;
  arribaDerecha?: string | React.ReactNode;
  abajoIzquierda?: string | React.ReactNode;
  abajoDerecha?: string | React.ReactNode;
  expansion?: React.ReactNode;
};

export const QTarjetaGenerica = ({
  mostrarTodo = false,
  avatar,
  arribaIzquierda,
  arribaDerecha,
  abajoIzquierda,
  abajoDerecha,
  expansion,
}: QTarjetaGenericaProps) => {
  const t = useTComponentes();
  const [expandida, setExpandida] = useState(mostrarTodo);

  return (
    <article className="qtarjeta-generica" data-expandida={expandida}>
      <section className="qtarjeta-generica-principal">
        {/* {avatar && (
          <section className="qtarjeta-generica-avatar">{avatar}</section>
        )} */}
        {avatar}

        <section
          className="qtarjeta-generica-grid"
          aria-label={t("ui.moleculas.camposPrioritarios")}
        >
          {(arribaIzquierda || arribaDerecha) && (
            <section className="qtarjeta-generica-grid-arriba">
              <div>{arribaIzquierda}</div>
              <div>{arribaDerecha}</div>
            </section>
          )}
          {(abajoIzquierda || abajoDerecha) && (
            <section className="qtarjeta-generica-grid-abajo">
              <div>{abajoIzquierda}</div>
              <div>{abajoDerecha}</div>
            </section>
          )}
        </section>
      </section>

      {expansion && (
        <footer className="qtarjeta-generica-footer">
          <QBoton
            tamaño="pequeño"
            variante="texto"
            onClick={(evento) => {
              evento.stopPropagation();
              setExpandida((estado) => !estado);
            }}
          >
            {expandida ? t("ui.moleculas.verMenos") : t("ui.moleculas.verMas")}
          </QBoton>
        </footer>
      )}

      {expandida && expansion}
    </article>
  );
};
