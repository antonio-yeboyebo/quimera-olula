import { useState } from "react";
import { useParams } from "react-router";
import { Detalle } from "../../../../componentes/detalle/Detalle.tsx";
import { Input } from "../../../../componentes/detalle/FormularioGenerico.tsx";
import { Tab, Tabs } from "../../../../componentes/detalle/tabs/Tabs.tsx";
import { Entidad } from "../../../comun/diseño.ts";
import { Cliente, IdFiscal as TipoIdFiscal } from "../diseño.ts";
import { clienteVacio } from "../dominio.ts";
import { camposCliente, getCliente, patchCliente } from "../infraestructura.ts";
import "./DetalleCliente.css";
import { IdFiscal } from "./IdFiscal.tsx";
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

  const [cliente, setCliente] = useState<Cliente>(clienteVacio());

  const onIdFiscalCambiadoCallback = async(idFiscal: TipoIdFiscal) => {
    setGuardando(true);
    await guardar(cliente.id, {
        id_fiscal: idFiscal.id_fiscal,
        tipo_id_fiscal: idFiscal.tipo_id_fiscal
    });
    const nuevoCliente = { ...cliente, ...idFiscal };
    setCliente(nuevoCliente);
    setGuardando(false);
    onEntidadActualizada(nuevoCliente);
  };

  const onCampoCambiado = async (campo: string, valor: string) => {
    if (!clienteId) {
      return;
    }
    setGuardando(true);
    const nuevoCliente: Cliente = { ...cliente, [campo]: valor };
    await patchCliente(clienteId, nuevoCliente);
    setGuardando(false);
    setCliente(nuevoCliente);
    onEntidadActualizada(nuevoCliente);
  };

  return (
    <Detalle
      id={clienteId}
      obtenerTitulo={titulo}
      setEntidad={(c) => setCliente(c as Cliente)}
      entidad={cliente}
      cargar={getCliente}
      className="detalle-cliente"
      cerrarDetalle={cancelarSeleccionada}
    >
      {/* <h2 className="detalle-cliente-titulo">{titulo(cliente)}</h2> */}
      <Input
        campo={camposCliente.nombre}
        onCampoCambiado={onCampoCambiado}
        valorEntidad={cliente?.nombre ?? ""}
      />
      <IdFiscal
        cliente={cliente}
        onIdFiscalCambiadoCallback={onIdFiscalCambiadoCallback}
      />
      <Input
        campo={camposCliente.agente_id}
        onCampoCambiado={onCampoCambiado}
        valorEntidad={cliente?.agente_id ?? ""}
      />

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
