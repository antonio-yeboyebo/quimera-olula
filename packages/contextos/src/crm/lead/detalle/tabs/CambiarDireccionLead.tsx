import { PaisSelector } from "#/comun/componentes/pais/pais.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { HookModelo, useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { Lead } from "../../diseño.ts";
import { patchLead } from "../../infraestructura.ts";
import "./CambiarDireccionLead.css";
import { useTCrm } from "../../../i18n/index.ts";

const metaDireccionLead: MetaModelo<Lead> = {
  campos: {
    direccion: { requerido: false },
    ciudad: { requerido: false },
    cod_postal: { requerido: false },
    provincia: { requerido: false },
    pais_id: { requerido: false },
    pais: { requerido: false },
  },
};

export const CambiarDireccionLead = ({
  lead,
  onCerrar,
}: {
  lead: HookModelo<Lead>;
  onCerrar: () => void;
}) => {
  const t = useTCrm();
  const { modelo, uiProps, valido } = useModelo(metaDireccionLead, lead.modelo);

  const guardar_ = useCallback(async () => {
    await patchLead(lead.modelo.id, modelo);
    lead.init(modelo);
    onCerrar();
  }, [modelo, lead, onCerrar]);

  const [guardar, cancelar] = useForm(guardar_, onCerrar);

  return (
    <QModal
      abierto={true}
      nombre="cambiarDireccionLead"
      titulo={t("lead.direccion")}
      onCerrar={cancelar}
    >
      <div className="CambiarDireccionLead">
        <quimera-formulario>
          <QInput label={t("lead.direccion")} {...uiProps("direccion")} />
          <QInput label={t("lead.ciudad")} {...uiProps("ciudad")} />
          <QInput label={t("lead.codigoPostal")} {...uiProps("cod_postal")} />
          <QInput label={t("lead.provincia")} {...uiProps("provincia")} />
          <PaisSelector label={t("lead.pais")} {...uiProps("pais_id", "pais")} />
        </quimera-formulario>
        <div className="botones maestro-botones">
          <QBoton onClick={guardar} deshabilitado={!valido}>
            {t("lead.guardar")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
