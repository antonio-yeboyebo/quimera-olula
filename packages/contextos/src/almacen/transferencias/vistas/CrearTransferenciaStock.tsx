import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { Mostrar } from "@olula/componentes/moleculas/Mostrar.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { HookModelo, useModelo } from "@olula/lib/useModelo.ts";
import { useContext } from "react";
import { NuevaTransferenciaStock } from "../diseño.ts";
import {
  metaNuevaTransferenciaStock,
  nuevaTransferenciaStockVacia,
} from "../dominio.ts";
import {
  crearTransferenciaStock,
  obtenerTransferenciaStock,
} from "../infraestructura.ts";
import { useTAlmacen } from "../../i18n/index.ts";

export const CrearTransferenciaStock = ({
  publicar = async () => {},
  activo = false,
}: {
  publicar?: ProcesarEvento;
  activo: boolean;
}) => {
  const transferencia = useModelo(metaNuevaTransferenciaStock, nuevaTransferenciaStockVacia);

  const cancelar = () => {
    transferencia.init();
    publicar("creacion_cancelada");
  };

  return (
    <Mostrar modo="modal" activo={activo} onCerrar={cancelar}>
      <FormAltaTransferenciaStock
        publicar={publicar}
        transferencia={transferencia}
      />
    </Mostrar>
  );
};

const FormAltaTransferenciaStock = ({
  publicar = async () => {},
  transferencia,
}: {
  publicar?: ProcesarEvento;
  transferencia: HookModelo<NuevaTransferenciaStock>;
}) => {
  const t = useTAlmacen();
  const { intentar } = useContext(ContextoError);

  const crear = async () => {
    const modelo = {
      ...transferencia.modelo,
    };
    const id = await intentar(() => crearTransferenciaStock(modelo));
    const transferenciaCreada = await obtenerTransferenciaStock(id);
    publicar("transferencia_creada", transferenciaCreada);
    transferencia.init();
  };

  const cancelar = () => {
    publicar("creacion_cancelada");
    transferencia.init();
  };

  return (
    <div className="CrearTransferenciaStock">
      <h2>{t("transferencias.nuevaTransferencia")}</h2>
      <quimera-formulario>
        <Almacen
          label={t("transferencias.origen")}
          {...transferencia.uiProps("origen", "nombre_origen")}
        />
        <Almacen
          label={t("transferencias.destino")}
          {...transferencia.uiProps("destino", "nombre_destino")}
        />
        <QDate label={t("transferencias.fecha")} {...transferencia.uiProps("fecha")} />
      </quimera-formulario>
      <div className="botones">
        <QBoton onClick={crear} deshabilitado={!transferencia.valido}>
          {t("transferencias.guardar")}
        </QBoton>
        <QBoton onClick={cancelar} variante="texto">
          {t("transferencias.cancelar")}
        </QBoton>
      </div>
    </div>
  );
};
