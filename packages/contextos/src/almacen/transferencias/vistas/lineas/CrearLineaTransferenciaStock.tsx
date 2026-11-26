import { Articulo } from "#/almacen/comun/componentes/Articulo.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Mostrar } from "@olula/componentes/moleculas/Mostrar.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { HookModelo, useModelo } from "@olula/lib/useModelo.ts";
import { useContext } from "react";
import { NuevaLineaTransferenciaStock } from "../../diseño.ts";
import {
  metaNuevaLineaTransferenciaStock,
  nuevaLineaTransferenciaStockVacia,
} from "../../dominio.ts";
import { crearLineaTransferenciaStock } from "../../infraestructura.ts";
import { useTAlmacen } from "../../../i18n/index.ts";

export const CrearLineaTransferenciaStock = ({
  publicar = async () => {},
  activo = false,
  transferenciaID,
}: {
  publicar?: ProcesarEvento;
  activo?: boolean;
  transferenciaID: string;
}) => {
  const linea = useModelo(
    metaNuevaLineaTransferenciaStock,
    nuevaLineaTransferenciaStockVacia
  );

  const cancelar = () => {
    linea.init();
    publicar("creacion_cancelada");
  };

  return (
    <Mostrar modo="modal" activo={activo} onCerrar={cancelar}>
      <FormAltaLineaTransferenciaStock
        publicar={publicar}
        linea={linea}
        transferenciaID={transferenciaID}
      />
    </Mostrar>
  );
};

const FormAltaLineaTransferenciaStock = ({
  publicar = async () => {},
  linea,
  transferenciaID,
}: {
  publicar?: ProcesarEvento;
  linea: HookModelo<NuevaLineaTransferenciaStock>;
  transferenciaID: string;
}) => {
  const t = useTAlmacen();
  const { intentar } = useContext(ContextoError);

  const crear = async () => {
    const modelo = {
      ...linea.modelo,
    };
    const id = await intentar(() =>
      crearLineaTransferenciaStock(transferenciaID, modelo)
    );
    publicar("linea_creada", { ...modelo, id });
    linea.init();
  };

  const cancelar = () => {
    publicar("creacion_cancelada");
    linea.init();
  };

  return (
    <div className="CrearLineaTransferenciaStock">
      <h2>{t("transferencias.nuevaLinea")}</h2>
      <quimera-formulario>
        <Articulo {...linea.uiProps("sku", "descripcion_producto")} />
        <QInput label={t("transferencias.cantidad")} {...linea.uiProps("cantidad")} />
      </quimera-formulario>
      <div className="botones">
        <QBoton onClick={crear} deshabilitado={!linea.valido}>
          {t("transferencias.guardar")}
        </QBoton>
        <QBoton onClick={cancelar} variante="texto">
          {t("transferencias.cancelar")}
        </QBoton>
      </div>
    </div>
  );
};
