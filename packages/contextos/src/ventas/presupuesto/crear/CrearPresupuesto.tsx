import { CamposDireccionVenta } from "#/ventas/comun/componentes/CamposDireccionVenta.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { EmpresaActual } from "#/comun/componentes/empresaActual.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useFocus } from "@olula/lib/useFocus.js";
import { useForm } from "@olula/lib/useForm.js";
import { HookModelo, useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useState } from "react";
import { conEmpresaActual } from "#/valores/empresaActual.ts";
import { Cliente } from "../../comun/componentes/cliente.tsx";
import { DirCliente } from "../../comun/componentes/dirCliente.tsx";
import {
  NuevoPresupuesto,
  NuevoPresupuestoClienteNoRegistrado,
} from "../diseño.ts";
import { getPresupuesto, postPresupuesto } from "../infraestructura.ts";
import "./CrearPresupuesto.css";
import {
  metaNuevoPresupuesto,
  metaNuevoPresupuestoClienteNoRegistrado,
  nuevoPresupuestoClienteNoRegistradoVacio,
  nuevoPresupuestoVacio,
} from "./crear.ts";
import { useTVentas } from "../../i18n/index.ts";

export const CrearPresupuesto = ({
  publicar = async () => {},
  onCancelar = () => {},
  modeloVacio = nuevoPresupuestoVacio,
}: {
  publicar?: EmitirEvento;
  onCancelar?: () => void;
  modeloVacio?: NuevoPresupuesto;
}) => {
  const t = useTVentas();
  const modeloConEmpresa = () => conEmpresaActual(modeloVacio);
  const modeloNoRegistradoConEmpresa = () =>
    conEmpresaActual(nuevoPresupuestoClienteNoRegistradoVacio);

  const [modoNoRegistrado, setModoNoRegistrado] = useState(false);
  // Lazy initializer: se evalúa solo en el montaje, garantiza referencia estable para useModelo
  const [modeloInicialRegistrado] = useState(modeloConEmpresa);
  const [modeloInicialNoRegistrado] = useState(modeloNoRegistradoConEmpresa);
  const presupuestoRegistrado = useModelo(metaNuevoPresupuesto, modeloInicialRegistrado);
  const presupuestoNoRegistrado = useModelo(
    metaNuevoPresupuestoClienteNoRegistrado,
    modeloInicialNoRegistrado
  );

  const toggleModoCliente = () => {
    const nuevoModo = !modoNoRegistrado;
    setModoNoRegistrado(nuevoModo);

    presupuestoRegistrado.init(modeloConEmpresa());
    presupuestoNoRegistrado.init(modeloNoRegistradoConEmpresa());
  };

  const cancelar = () => {
    presupuestoRegistrado.init(modeloConEmpresa());
    presupuestoNoRegistrado.init(modeloNoRegistradoConEmpresa());
    setModoNoRegistrado(false);
    onCancelar();
  };

  return (
    <QModal
      abierto={true}
      nombre="crear_presupuesto"
      titulo={t("presupuesto.maestro.nuevo")}
      onCerrar={cancelar}
    >
      <FormAltaPresupuesto
        publicar={publicar}
        presupuestoRegistrado={presupuestoRegistrado}
        presupuestoNoRegistrado={presupuestoNoRegistrado}
        modoNoRegistrado={modoNoRegistrado}
        modeloVacio={modeloVacio}
        onToggleModoCliente={toggleModoCliente}
      />
    </QModal>
  );
};

const FormAltaPresupuesto = ({
  publicar = async () => {},
  presupuestoRegistrado,
  presupuestoNoRegistrado,
  modoNoRegistrado,
  onToggleModoCliente,
  modeloVacio,
}: {
  publicar?: EmitirEvento;
  presupuestoRegistrado: HookModelo<NuevoPresupuesto>;
  presupuestoNoRegistrado: HookModelo<NuevoPresupuestoClienteNoRegistrado>;
  modoNoRegistrado: boolean;
  modeloVacio: NuevoPresupuesto;
  onToggleModoCliente: () => void;
}) => {
  const t = useTVentas();
  const focus = useFocus();
  const modeloConEmpresa = () => conEmpresaActual(modeloVacio);
  const modeloNoRegistradoConEmpresa = () =>
    conEmpresaActual(nuevoPresupuestoClienteNoRegistradoVacio);

  const crear_ = useCallback(async () => {
    let modelo;

    if (modoNoRegistrado) {
      modelo = { ...presupuestoNoRegistrado.modelo };
    } else {
      modelo = { ...presupuestoRegistrado.modelo };
    }

    const id = await postPresupuesto(modelo);
    const presupuestoCreada = await getPresupuesto(id);
    publicar("presupuesto_creado", presupuestoCreada);

    presupuestoRegistrado.init(modeloConEmpresa());
    presupuestoNoRegistrado.init(modeloNoRegistradoConEmpresa());
  }, [
    modoNoRegistrado,
    presupuestoNoRegistrado,
    presupuestoRegistrado,
    publicar,
    modeloVacio,
  ]);

  const cancelar_ = useCallback(() => {
    publicar("creacion_presupuesto_cancelada");
    presupuestoRegistrado.init(modeloConEmpresa());
    presupuestoNoRegistrado.init(modeloNoRegistradoConEmpresa());
  }, [publicar, presupuestoRegistrado, presupuestoNoRegistrado, modeloVacio]);

  const [crear, cancelar] = useForm(crear_, cancelar_);

  return (
    <>
      <div className="modo-cliente">
        <QBoton onClick={onToggleModoCliente} variante="texto" tipo="button">
          {modoNoRegistrado ? t("documento.crear.clienteRegistrado") : t("documento.crear.clienteNoRegistrado")}
        </QBoton>
      </div>
      <div className="CrearPresupuesto campos-direccion">
        <quimera-formulario>
          {modoNoRegistrado ? (
            <>
              <EmpresaActual
                onChange={(id) => presupuestoNoRegistrado.uiProps("empresa_id").onChange(id)}
              />
              <QInput
                label={t("documento.crear.nombreCliente")}
                {...presupuestoNoRegistrado.uiProps("nombre_cliente")}
                ref={focus}
              />
              <QInput
                label={t("documento.detalle.idFiscal")}
                {...presupuestoNoRegistrado.uiProps("id_fiscal")}
              />
              <CamposDireccionVenta uiProps={presupuestoNoRegistrado.uiProps} />
            </>
          ) : (
            <>
              <EmpresaActual
                onChange={(id) => presupuestoRegistrado.uiProps("empresa_id").onChange(id)}
              />
              <Cliente
                {...presupuestoRegistrado.uiProps("cliente_id", "nombre")}
                nombre="clientePresupuesto"
                avisarObservaciones
                ref={focus}
              />
              <DirCliente
                clienteId={presupuestoRegistrado.modelo.cliente_id}
                {...presupuestoRegistrado.uiProps("direccion_id")}
              />
            </>
          )}
        </quimera-formulario>
      </div>
      <div className="botones">
        <QBoton
          onClick={crear}
          deshabilitado={
            modoNoRegistrado
              ? !presupuestoNoRegistrado.valido
              : !presupuestoRegistrado.valido
          }
        >
          Guardar
        </QBoton>
        <QBoton onClick={cancelar} variante="texto">
          Cancelar
        </QBoton>
      </div>
    </>
  );
};
