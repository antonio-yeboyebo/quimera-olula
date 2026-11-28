import { useEffect, useState } from "react";
import { Link } from "react-router";
import "../../widgets/WidgetCrmLista.css";
import { TarjetaLead } from "../maestro/TarjetaLead.tsx";
import {
  cargarModeloWidgetUltimasTarjetas,
  ModeloWidgetUltimasTarjetas,
  modeloWidgetUltimasTarjetasInicial,
} from "./dominio_ultimas_tarjetas.ts";
import { useTCrm } from "../../i18n/index.ts";

export const WidgetUltimasTarjetas = () => {
  const t = useTCrm();
  const [modelo, setModelo] = useState<ModeloWidgetUltimasTarjetas>(
    modeloWidgetUltimasTarjetasInicial
  );

  useEffect(() => {
    let cancelado = false;

    cargarModeloWidgetUltimasTarjetas()
      .then((siguienteModelo) => {
        if (cancelado) return;
        setModelo(siguienteModelo);
      })
      .catch((error) => {
        if (cancelado) return;
        console.error("Error cargando últimas tarjetas", error);
        setModelo((previo) => ({ ...previo, estado: "listo" }));
      });

    return () => {
      cancelado = true;
    };
  }, []);

  if (modelo.estado === "cargando") {
    return <div>{t("lead.cargandoUltimasTarjetas")}</div>;
  }

  return (
    <div className="widget-crm-lista">
      <div className="widget-crm-lista__cabecera">
        <h3 className="widget-crm-lista__titulo">{t("lead.ultimasTarjetas")}</h3>
        <div className="widget-crm-lista__subtitulo">
          {t("lead.ultimosCodigosDeTarjetaAsignados")}
        </div>
      </div>

      {modelo.tarjetas.length === 0 ? (
        <div className="widget-crm-lista__vacio">{t("lead.noHayTarjetasRecientes")}</div>
      ) : (
        <div className="widget-crm-lista__lista">
          {modelo.tarjetas.map((tarjeta) => (
            <Link
              key={tarjeta.id}
              className="widget-crm-lista__tarjeta-enlace"
              to={`/crm/lead?id=${tarjeta.id}`}
            >
              <TarjetaLead {...tarjeta} />
            </Link>
          ))}
        </div>
      )}

      <div className="widget-crm-lista__acciones">
        <Link className="widget-crm-lista__enlace" to={modelo.urlVer}>
          {t("lead.verTodas")}
        </Link>
      </div>
    </div>
  );
};
