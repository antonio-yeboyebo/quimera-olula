import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useLista } from "@olula/lib/useLista.ts";
import { Maquina, useMaquina } from "@olula/lib/useMaquina.ts";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useEffect, useState } from "react";
import { Cliente } from "../../../cliente/diseño.ts";
import { Contacto } from "../../diseño.ts";
import { getClientesPorContacto } from "../../infraestructura.ts";
import { TabClientesAcciones } from "./TabClientesAcciones.tsx";
import { useTCrm } from "../../../i18n/index.ts";

type Estado = "lista" | "vincular_cliente" | "desvincular_cliente";

type PayloadClientesActualizados = {
  clientes: Cliente[];
  clienteId?: string;
};

export const TabClientes = ({
  contacto,
}: {
  contacto: HookModelo<Contacto>;
}) => {
  const t = useTCrm();
  const clientes = useLista<Cliente>([]);
  const [cargando, setCargando] = useState(true);
  const [estado, setEstado] = useState<Estado>("lista");
  const contactoId = contacto.modelo.id;

  const { setLista } = clientes;
  const cargarClientes = useCallback(async () => {
    setCargando(true);
    const nuevosClientes = await getClientesPorContacto(contactoId);
    setLista(nuevosClientes.datos);
    setCargando(false);
  }, [setLista, contactoId]);

  useEffect(() => {
    if (contactoId) cargarClientes();
  }, [contactoId, cargarClientes]);

  const maquina: Maquina<Estado> = {
    lista: {
      VINCULAR_SOLICITADO: "vincular_cliente",
      DESVINCULAR_SOLICITADO: "desvincular_cliente",
      CLIENTE_SELECCIONADO: (payload: unknown) => {
        const cliente = payload as Cliente;
        clientes.seleccionar(cliente);
      },
    },
    desvincular_cliente: {
      CLIENTES_ACTUALIZADOS: async (payload: unknown) => {
        const { clientes: listaClientes, clienteId } =
          payload as PayloadClientesActualizados;
        clientes.refrescar(listaClientes, clienteId);
        return "lista" as Estado;
      },
      CANCELAR_DESVINCULACION: "lista",
    },
    vincular_cliente: {
      CLIENTES_ACTUALIZADOS: async (payload: unknown) => {
        const { clientes: listaClientes, clienteId } =
          payload as PayloadClientesActualizados;
        clientes.refrescar(listaClientes, clienteId);
        return "lista" as Estado;
      },
      CANCELAR_VINCULACION: "lista",
    },
  };

  const emitir = useMaquina(maquina, estado, setEstado);

  const metaTablaCliente: MetaTabla<Cliente> = [
    { id: "id", cabecera: t("contacto.id") },
    { id: "nombre", cabecera: t("contacto.nombre") },
    { id: "email", cabecera: t("contacto.email") },
  ];

  return (
    <div className="TabClientes">
      <TabClientesAcciones
        seleccionada={clientes.seleccionada}
        emitir={emitir}
        estado={estado}
        contacto={contacto}
      />
      <ListadoSemiControlado
        metaTabla={metaTablaCliente}
        entidades={clientes.lista}
        totalEntidades={clientes.lista.length}
        cargando={cargando}
        seleccionada={clientes.seleccionada || null}
        onSeleccion={(cliente) => emitir("CLIENTE_SELECCIONADO", cliente)}
        criteriaInicial={criteriaDefecto}
        onCriteriaChanged={() => null}
      />
    </div>
  );
};
