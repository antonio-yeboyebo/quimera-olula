import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ClienteVentaNoRegistrado } from "@olula/ctx/ventas/comun/componentes/moleculas/ClienteVenta/ClienteVentaNoRegistrado.tsx";
import { ClienteVentaRegistrado } from "@olula/ctx/ventas/comun/componentes/moleculas/ClienteVenta/ClienteVentaRegistrado.tsx";
import { EmpresaActual } from "#/comun/componentes/empresaActual.tsx";
import { conEmpresaActual } from "#/valores/empresaActual.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { HookModelo, useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useState } from "react";
import { getFactura } from "../infraestructura.ts";
import "./CrearFactura.css";
import {
  ModeloAltaFacturaNoRegistrada,
  ModeloAltaFacturaRegistrada,
  altaFacturaNoRegistradaVacia,
  altaFacturaRegistradaVacia,
  crearFacturaNoRegistrada,
  crearFacturaRegistrada,
  metaModeloAltaFacturaNoRegistrada,
  metaModeloAltaFacturaRegistrada,
} from "./dominio.ts";
import { useTVentas } from "../../i18n/index.ts";

export const CrearFactura = ({
  publicar = async () => {},
  activo = false,
  onCancelar = () => {},
}: {
  publicar?: EmitirEvento;
  activo?: boolean;
  onCancelar?: () => void;
}) => {
  const t = useTVentas();
  const [modoNoRegistrado, setModoNoRegistrado] = useState(false);
  /* Lazy initializer: referencia estable para useModelo y empresa ya puesta en el
     primer render, sin depender del efecto de EmpresaActual. */
  const [inicialRegistrada] = useState(() =>
    conEmpresaActual(altaFacturaRegistradaVacia, "idEmpresa")
  );
  const [inicialNoRegistrada] = useState(() =>
    conEmpresaActual(altaFacturaNoRegistradaVacia, "idEmpresa")
  );
  const facturaRegistrada = useModelo(
    metaModeloAltaFacturaRegistrada,
    inicialRegistrada
  );
  const facturaNoRegistrada = useModelo(
    metaModeloAltaFacturaNoRegistrada,
    inicialNoRegistrada
  );

  const toggleModoCliente = () => {
    const nuevoModo = !modoNoRegistrado;
    setModoNoRegistrado(nuevoModo);

    facturaRegistrada.init(conEmpresaActual(altaFacturaRegistradaVacia, "idEmpresa"));
    facturaNoRegistrada.init(
      conEmpresaActual(altaFacturaNoRegistradaVacia, "idEmpresa")
    );
  };

  const cancelar = () => {
    facturaRegistrada.init(conEmpresaActual(altaFacturaRegistradaVacia, "idEmpresa"));
    facturaNoRegistrada.init(
      conEmpresaActual(altaFacturaNoRegistradaVacia, "idEmpresa")
    );
    setModoNoRegistrado(false);
    onCancelar();
  };

  return (
    <QModal
      abierto={activo}
      nombre="crear_factura"
      titulo={t("factura.maestro.nueva")}
      onCerrar={cancelar}
    >
      <FormAltaFactura
        publicar={publicar}
        facturaRegistrada={facturaRegistrada}
        facturaNoRegistrada={facturaNoRegistrada}
        modoNoRegistrado={modoNoRegistrado}
        onToggleModoCliente={toggleModoCliente}
      />
    </QModal>
  );
};

const FormAltaFactura = ({
  publicar = async () => {},
  facturaRegistrada,
  facturaNoRegistrada,
  modoNoRegistrado,
  onToggleModoCliente,
}: {
  publicar?: EmitirEvento;
  facturaRegistrada: HookModelo<ModeloAltaFacturaRegistrada>;
  facturaNoRegistrada: HookModelo<ModeloAltaFacturaNoRegistrada>;
  modoNoRegistrado: boolean;
  onToggleModoCliente: () => void;
}) => {
  const t = useTVentas();
  const { intentar } = useContext(ContextoError);

  const crear = useCallback(async () => {
    let id: string;

    if (modoNoRegistrado) {
      id = await intentar(() =>
        crearFacturaNoRegistrada(facturaNoRegistrada.modelo)
      );
    } else {
      id = await intentar(() =>
        crearFacturaRegistrada(facturaRegistrada.modelo)
      );
    }

    const facturaCreada = await getFactura(id);
    publicar("factura_creada", facturaCreada);

    facturaRegistrada.init(altaFacturaRegistradaVacia);
    facturaNoRegistrada.init(altaFacturaNoRegistradaVacia);
  }, [
    modoNoRegistrado,
    facturaRegistrada,
    facturaNoRegistrada,
    publicar,
    intentar,
  ]);

  const cancelarModal = useCallback(() => {
    publicar("creacion_factura_cancelada");
    facturaRegistrada.init(altaFacturaRegistradaVacia);
    facturaNoRegistrada.init(altaFacturaNoRegistradaVacia);
  }, [publicar, facturaRegistrada, facturaNoRegistrada]);

  const actual = modoNoRegistrado ? facturaNoRegistrada : facturaRegistrada;

  return (
    <>
      <div className="modo-cliente">
        <QBoton onClick={onToggleModoCliente} variante="texto" tipo="button">
          {modoNoRegistrado ? t("documento.crear.clienteNoRegistrado") : t("documento.crear.clienteRegistrado")}
        </QBoton>
      </div>
      <quimera-formulario>
        {modoNoRegistrado ? (
          <>
            <EmpresaActual
              nombre="idEmpresa"
              onChange={(id) => facturaNoRegistrada.uiProps("idEmpresa").onChange(id)}
            />
            <ClienteVentaNoRegistrado cliente={facturaNoRegistrada} />
          </>
        ) : (
          <>
            <EmpresaActual
              nombre="idEmpresa"
              onChange={(id) => facturaRegistrada.uiProps("idEmpresa").onChange(id)}
            />
            <ClienteVentaRegistrado cliente={facturaRegistrada} />
          </>
        )}
      </quimera-formulario>
      <div className="botones">
        <QBoton onClick={crear} deshabilitado={!actual.valido}>
          Guardar
        </QBoton>
        <QBoton onClick={cancelarModal} variante="texto">
          Cancelar
        </QBoton>
      </div>
    </>
  );
};
