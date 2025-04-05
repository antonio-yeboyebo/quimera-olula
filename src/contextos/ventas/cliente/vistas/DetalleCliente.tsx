import { useReducer, useState } from "react";
import { useParams } from "react-router";
import { QBoton } from "../../../../componentes/atomos/qboton.tsx";
import { QInput } from "../../../../componentes/atomos/qinput.tsx";
import { Detalle } from "../../../../componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "../../../../componentes/detalle/tabs/Tabs.tsx";
import { Entidad } from "../../../comun/diseño.ts";
import { Cliente } from "../diseño.ts";
import { estadoAInput, initEstadoClienteVacio, puedoGuardarCliente, reductor } from "../dominio.ts";
import { getCliente, patchCliente } from "../infraestructura.ts";
import "./DetalleCliente.css";
import { TabDirecciones } from "./TabDirecciones.tsx";



export const DetalleCliente = ({
  clienteInicial = null,
  onEntidadActualizada = () => {},
  cancelarSeleccionada,
}: {
  clienteInicial?: Cliente | null;
  onEntidadActualizada?: (entidad: Cliente) => void;
  cancelarSeleccionada?: () => void;
}) => {
  const params = useParams();

  const [guardando, setGuardando] = useState(false);

  const clienteId = clienteInicial?.id ?? params.id;

  const sufijoTitulo = guardando ? " (Guardando...)" : "";
  const titulo = (cliente: Entidad) =>
    `${cliente.nombre} ${sufijoTitulo}` as string;

  // const [cliente, setCliente] = useState<EstadoCliente>(initEstadoClienteVacio);
  const [cliente, dispatch] = useReducer(reductor, initEstadoClienteVacio());

  const onGuardarClicked = async() => {
    setGuardando(true);
    await patchCliente(cliente.valor.id, cliente.valor);
    const cliente_guardado = await getCliente(cliente.valor.id);
    // setCliente(initEstadoCliente(cliente_guardado));
    dispatch({ type: "init", payload: {entidad: cliente_guardado }});
    setGuardando(false);
    onEntidadActualizada(cliente.valor);
  };

  const setCampo = (campo: string) => (valor: string) => {
    // setCliente(cambiarCliente(cliente, campoalor));
    dispatch({
      type: "set_campo",
      payload: {campo, valor, }
    });
  };

  const getProps = (campo: string) => {
    return estadoAInput(cliente, campo);
  };

  return (
    <Detalle
      id={clienteId}
      obtenerTitulo={titulo}
      setEntidad={(c) => dispatch({ type: "init", payload: {entidad: c as Cliente }})}
      entidad={cliente.valor}
      cargar={getCliente}
      className="detalle-cliente"
      cerrarDetalle={cancelarSeleccionada}
    >
      {/* <h2 className="detalle-cliente-titulo">{titulo(cliente)}</h2> */}
      <div className="container">
        <div style={{ gridColumn: 'span 12' }}>
          <QInput
            label="Nombre"
            onChange={setCampo("nombre")}
            {...getProps("nombre")}
          />
        </div>
        <div style={{ gridColumn: 'span 12' }}>
          <QInput
            label="Nombre Comercial"
            onChange={setCampo("nombre_comercial")}
            {...getProps("nombre_comercial")}
            />
        </div>
        <div style={{ gridColumn: 'span 1' }}>
          <QInput
            label="Tipo Id Fiscal"
            onChange={setCampo("tipo_id_fiscal")}
            {...getProps("tipo_id_fiscal")}
          />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <QInput
            label="Id Fiscal"
            onChange={setCampo("id_fiscal")}
            {...getProps("id_fiscal")}
          />
        </div>
        <div style={{ gridColumn: 'span 8' }}>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <QInput
            label="Agente"
            onChange={setCampo("agente_id")}
            {...getProps("agente_id")}
          />
        </div>
        <div style={{ gridColumn: 'span 10' }}>
          <QInput
            label="Nombre"
            {...getProps("nombre_agente")}
          />
        </div>
        <div style={{ gridColumn: 'span 1' }}>
          <QInput
            label="Divisa"
            onChange={setCampo("divisa_id")}
            {...getProps("divisa_id")}
          />
        </div>
        <div style={{ gridColumn: 'span 11' }}>
        </div>
        <div style={{ gridColumn: 'span 12' }}>
          <div className='botones'>
            <QBoton
              onClick={onGuardarClicked}
              deshabilitado={!puedoGuardarCliente(cliente)} 
            >
            Guardar
            </QBoton>
            <QBoton tipo="reset" variante="texto"
              onClick={() => {
                // setCliente(initEstadoCliente(cliente.valor_inicial));
                dispatch({ type: "init", payload: {entidad: cliente.valor_inicial }});
              }}
            >
              Cancelar
            </QBoton>
          </div>
        </div>

      </div>

      {!!clienteId && (
        <Tabs
          className="detalle-cliente-tabs"
          children={[
            <Tab
              key="tab-1"
              label="Comercial"
              children={
                <div className="detalle-cliente-tab-contenido">
                  Comercial contenido
                </div>
              }
            />,
            <Tab
              key="tab-2"
              label="Direcciones"
              children={
                <div className="detalle-cliente-tab-contenido">
                  <TabDirecciones clienteId={clienteId} />
                </div>
              }
            />,
            <Tab
              key="tab-3"
              label="Cuentas Bancarias"
              children={
                <div className="detalle-cliente-tab-contenido">
                  Cuentas Bancarias Master contenido
                </div>
              }
            />,
            <Tab
              key="tab-4"
              label="Agenda"
              children={
                <div className="detalle-cliente-tab-contenido">
                  Agenda contenido
                </div>
              }
            />,
            <Tab
              key="tab-5"
              label="Descuentos"
              children={
                <div className="detalle-cliente-tab-contenido">
                  Descuentos contenido
                </div>
              }
            />,
            <Tab
              key="tab-6"
              label="Documentos"
              children={
                <div className="detalle-cliente-tab-contenido">
                  Documentos contenido
                </div>
              }
            />,
            <Tab
              key="tab-7"
              label="Contabilidad"
              children={
                <div className="detalle-cliente-tab-contenido">
                  Contabilidad contenido
                </div>
              }
            />,
            <Tab
              key="tab-8"
              label="Factura-e"
              children={
                <div className="detalle-cliente-tab-contenido">
                  Factura-e contenido
                </div>
              }
            />,
          ]}
        ></Tabs>
      )}
    </Detalle>
  );
};
