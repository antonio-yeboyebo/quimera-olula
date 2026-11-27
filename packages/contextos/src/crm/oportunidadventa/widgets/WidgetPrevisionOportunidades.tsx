import { formatearMoneda } from "@olula/lib/dominio.ts";
import { max, scaleLinear } from "d3";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  cargarModeloWidgetPrevision,
  ModeloWidgetPrevision,
  modeloWidgetPrevisionInicial,
} from "./dominio.ts";
import "./WidgetPrevisionOportunidades.css";
import { useTCrm } from "../../i18n/index.ts";

export const WidgetPrevisionOportunidades = () => {
  const t = useTCrm();
  const [modelo, setModelo] = useState<ModeloWidgetPrevision>(
    modeloWidgetPrevisionInicial
  );

  useEffect(() => {
    let cancelado = false;

    cargarModeloWidgetPrevision()
      .then((siguienteModelo) => {
        if (cancelado) return;
        setModelo(siguienteModelo);
      })
      .catch((error) => {
        if (cancelado) return;
        console.error("Error cargando prevision de oportunidades", error);
        setModelo((previo) => ({ ...previo, estado: "listo" }));
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const textoPrevision = formatearMoneda(modelo.previsionPotencial, "EUR");
  const maximoPrevision =
    max(modelo.seriePorEstado, (item) => item.prevision) ?? 0;

  const escalaAncho = useMemo(
    () =>
      scaleLinear<number, number>()
        .domain([0, maximoPrevision || 1])
        .range([6, 100]),
    [maximoPrevision]
  );

  if (modelo.estado === "cargando") {
    return <div>{t("oportunidadventa.cargandoPrevisionDeOportunidades")}</div>;
  }

  if (modelo.oportunidadesAbiertas === 0) {
    return (
      <div className="widget-prevision-oportunidades">
        <h3 className="widget-prevision-oportunidades__titulo">{t("oportunidadventa.crm")}</h3>
        <div>{t("oportunidadventa.noTienesOportunidadesAbiertas")}</div>
      </div>
    );
  }
  return (
    <div className="widget-prevision-oportunidades">
      <h3 className="widget-prevision-oportunidades__titulo">{t("oportunidadventa.oportunidades")}</h3>
      <div className="widget-prevision-oportunidades__valor">
        {t("oportunidadventa.previsionDeVentasPotencial")}{" "}<strong>{textoPrevision}</strong>
      </div>

      <div className="widget-prevision-oportunidades__serie" role="list">
        {modelo.seriePorEstado.map((estado) => {
          const ancho = `${Math.round(escalaAncho(estado.prevision))}%`;

          return (
            <div
              key={estado.estadoId}
              className="widget-prevision-oportunidades__fila"
              role="listitem"
            >
              <div
                className="widget-prevision-oportunidades__estado"
                title={estado.estadoDescripcion}
              >
                {estado.estadoDescripcion}
              </div>
              <div className="widget-prevision-oportunidades__barra-fondo">
                <div
                  className="widget-prevision-oportunidades__barra-valor"
                  style={{ width: ancho }}
                />
              </div>
              <div className="widget-prevision-oportunidades__importe">
                {formatearMoneda(estado.prevision, "EUR")}
              </div>
            </div>
          );
        })}
      </div>

      <div className="widget-prevision-oportunidades__acciones">
        <Link
          className="widget-prevision-oportunidades__enlace"
          to={modelo.urlVer}
        >
          {t("oportunidadventa.ver")}
        </Link>
      </div>
    </div>
  );
};
