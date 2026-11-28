import { ContactoSelector } from "#/crm/comun/componentes/contacto.tsx";
import { EstadoLead } from "#/crm/comun/componentes/estado_lead.tsx";
import { FuenteLead } from "#/crm/comun/componentes/fuente_lead.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { formatearDireccionUnaLinea } from "@olula/lib/dominio.ts";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { useState } from "react";
import { Lead } from "../../diseño.ts";
import { CambiarDireccionLead } from "./CambiarDireccionLead.tsx";
import "./TabDatos.css";
import { useTCrm } from "../../../i18n/index.ts";

export const TabDatos = ({ lead }: { lead: HookModelo<Lead> }) => {
  const t = useTCrm();
  const { uiProps, modelo } = lead;
  const [editandoDireccion, setEditandoDireccion] = useState(false);

  const direccionResumen = formatearDireccionUnaLinea({
    tipo_via: "",
    nombre_via: modelo.direccion ?? "",
    ciudad: modelo.ciudad ?? "",
    numero: "",
    otros: "",
    cod_postal: modelo.cod_postal ?? "",
    provincia_id: modelo.provincia_id ? Number(modelo.provincia_id) : 0,
    provincia: modelo.provincia ?? "",
    pais_id: modelo.pais_id ?? "",
    apartado: "",
    telefono: modelo.telefono_1 ?? "",
  }).trim();

  const direccionSinDefinir =
    direccionResumen.replace(/[,\s]/g, "").length === 0;

  return (
    <div className="TabMasDatos">
      <quimera-formulario>
        <EstadoLead {...uiProps("estado_id")} />
        <FuenteLead {...uiProps("fuente_id")} />
        <ContactoSelector
          {...uiProps("contacto_id")}
          label={t("lead.contacto")}
          valor={modelo.contacto_id ?? ""}
          descripcion={modelo.contacto?.nombre ?? modelo.contacto_id ?? ""}
        />
        <QInput label={t("lead.nombre")} {...uiProps("nombre")} />
        <QInput label={t("lead.cifNif")} {...uiProps("id_fiscal")} />
        <QInput label={t("lead.telefono1")} {...uiProps("telefono_1")} />
        <QInput label={t("lead.telefono2")} {...uiProps("telefono_2")} />
        <QInput label={t("lead.email")} {...uiProps("email")} />
        <section className="lead-direccion-resumen">
          <div className="lead-direccion-resumen-label">{t("lead.direccion")}</div>
          <div className="lead-direccion-resumen-contenido">
            <span>
              {direccionSinDefinir ? t("lead.direccionSinDefinir") : direccionResumen}
            </span>
            <QBoton
              tamaño="pequeño"
              variante="texto"
              onClick={() => setEditandoDireccion(true)}
            >
              {t("lead.editar")}
            </QBoton>
          </div>
        </section>
      </quimera-formulario>
      {editandoDireccion && (
        <div className="lead-direccion-editar">
          <CambiarDireccionLead
            lead={lead}
            onCerrar={() => setEditandoDireccion(false)}
          />
        </div>
      )}
    </div>
  );
};
