import { useReducer } from "react";
import { useParams } from "react-router";
import { Detalle } from "../../../../componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "../../../../componentes/detalle/tabs/Tabs.tsx";
import { Entidad } from "../../../comun/diseño.ts";
import { Cliente } from "../diseño.ts";
import { estadoAInput, initEstadoClienteVacio, reductor } from "../dominio.ts";
import { getCliente } from "../infraestructura.ts";
import "./DetalleCliente.css";
import { TabComercial } from "./TabComercial.tsx";
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

  // const [guardando, setGuardando] = useState(false);

  const clienteId = clienteInicial?.id ?? params.id;

  // const sufijoTitulo = guardando ? " (Guardando...)" : "";
  const titulo = (cliente: Entidad) => cliente.nombre as string;

  // const [cliente, setCliente] = useState<EstadoCliente>(initEstadoClienteVacio);
  const [cliente, dispatch] = useReducer(reductor, initEstadoClienteVacio());

  // const onGuardarClicked = async() => {
  //   setGuardando(true);
  //   await patchCliente(cliente.valor.id, cliente.valor);
  //   const cliente_guardado = await getCliente(cliente.valor.id);
  //   // setCliente(initEstadoCliente(cliente_guardado));
  //   dispatch({ type: "init", payload: {entidad: cliente_guardado }});
  //   setGuardando(false);
  //   onEntidadActualizada(cliente.valor);
  // };

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
      {!!clienteId && (
        <Tabs
          className="detalle-cliente-tabs"
          children={[
            <Tab
              key="tab-1"
              label="Comercial"
              children={
                <div className="detalle-cliente-tab-contenido">
                  <TabComercial
                    getProps={getProps}
                    setCampo={setCampo}
                    cliente={cliente}
                    dispatch={dispatch}
                    onEntidadActualizada={onEntidadActualizada}
                    />
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
