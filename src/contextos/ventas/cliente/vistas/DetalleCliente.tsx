import { useReducer, useState } from "react";
import { useParams } from "react-router";
import { QBoton } from "../../../../componentes/atomos/qboton.tsx";
import { QInput } from "../../../../componentes/atomos/qinput.tsx";
import { Detalle } from "../../../../componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "../../../../componentes/detalle/tabs/Tabs.tsx";
import { Entidad } from "../../../comun/diseño.ts";
import { Cliente } from "../diseño.ts";
import { initEstadoClienteVacio, puedoGuardarCliente, reductor } from "../dominio.ts";
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

  // const [validacion, setValidacion] = useState<Validacion>({
  //   nombre: {
  //     valido: true,
  //     advertido: false,
  //     erroneo: false,
  //     textoValidacion: "",
  //   },
  // });

   const onGuardarClicked = async() => {
    setGuardando(true);
    await patchCliente(cliente.valor.id, cliente.valor);
    const cliente_guardado = await getCliente(cliente.valor.id);
    // setCliente(initEstadoCliente(cliente_guardado));
    dispatch({ type: "set_cliente", cliente: cliente_guardado });
    setGuardando(false);
    onEntidadActualizada(cliente.valor);
  };



  // const onIdFiscalCambiadoCallback = async(idFiscal: TipoIdFiscal) => {
  //   setGuardando(true);
  //   await guardar(cliente.valor.id, {
  //       id_fiscal: idFiscal.id_fiscal,
  //       tipo_id_fiscal: idFiscal.tipo_id_fiscal
  //   });
  //   const nuevoCliente = { ...cliente, ...idFiscal };
  //   setCliente(nuevoCliente);
  //   setGuardando(false);
  //   onEntidadActualizada(nuevoCliente);
  // };

  const onCampoCambiado = async (campo: string, valor: string) => {
    // setCliente(cambiarCliente(cliente, campo, valor));
    dispatch({
      type: "cambiar_cliente",
      campo, valor, 
    });
  };

  return (
    <Detalle
      id={clienteId}
      obtenerTitulo={titulo}
      // setEntidad={(c) => setCliente(initEstadoCliente(c as Cliente))}
      setEntidad={(c) => dispatch({ type: "set_cliente", cliente: c as Cliente })}
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
            nombre="nombre"
            valor={cliente.valor.nombre}
            onChange={(v) => onCampoCambiado("nombre", v)}
            {...cliente.validacion.nombre}
          />
        </div>
        <div style={{ gridColumn: 'span 12' }}>
          <QInput
            label="Nombre Comercial"
            nombre="nombre comercial"
            valor={cliente.valor.nombre_comercial ?? ""}
            onChange={(v) => onCampoCambiado("nombre_comercial", v)}
            {...cliente.validacion.nombre_comercial}
          />
        </div>
        <div style={{ gridColumn: 'span 1' }}>
          <QInput
            label="Tipo Id Fiscal"
            nombre="tipo_id_fiscal"
            valor={cliente.valor.tipo_id_fiscal}
            onChange={(v) => onCampoCambiado("tipo_id_fiscal", v)}
            {...cliente.validacion.tipo_id_fiscal}
          />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <QInput
            label="Id Fiscal"
            nombre="id_fiscal"
            valor={cliente.valor.id_fiscal}
            onChange={(v) => onCampoCambiado("id_fiscal", v)}
            {...cliente.validacion.id_fiscal}
          />
        </div>
        <div style={{ gridColumn: 'span 8' }}>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <QInput
            label="Agente"
            nombre="agente_id"
            onChange={(v) => onCampoCambiado("agente_id", v)}
            valor={cliente.valor.agente_id ?? ""}
            {...cliente.validacion.agente_id}
          />
        </div>
        <div style={{ gridColumn: 'span 10' }}>
         
          <QInput
            label="Nombre"
            nombre="nombre_agente"
            valor={cliente.valor.nombre_agente ?? ""}
            {...cliente.validacion.nombre_agente}
          />
        </div>
        <div style={{ gridColumn: 'span 1' }}>
          <QInput
            label="Divisa"
            nombre="divisa"
            valor={cliente.valor.divisa_id ?? ""}
          />
        </div>
        <div style={{ gridColumn: 'span 11' }}>
        </div>
        <div style={{ gridColumn: 'span 12' }}>
          <div className='botones'>
            <QBoton
              onClick={onGuardarClicked}
              deshabilitado={!puedoGuardarCliente(cliente.validacion)} 
            >
            Guardar
            </QBoton>
            <QBoton tipo="reset" variante="texto"
              onClick={() => {
                // setCliente(initEstadoCliente(cliente.valor_inicial));
                dispatch({ type: "set_cliente", cliente: cliente.valor_inicial });
              }}
            >
              Cancelar
            </QBoton>
          </div>
        </div>

      </div>
      {/* <IdFiscal
        cliente={cliente.valor}
        onIdFiscalCambiadoCallback={() => {}}
        // onIdFiscalCambiadoCallback={onIdFiscalCambiadoCallback}
      />
      <Input
        campo={camposCliente.agente_id}
        onCampoCambiado={onCampoCambiado}
        valorEntidad={cliente.valor?.agente_id ?? ""}
      /> */}

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
