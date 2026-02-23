import { Field, Schema } from "quimera/lib";

export default parent => {
  // console.log("mimensaje_PARENT", parent.lineasAlbaranesCli.fields);

  return {
    ...parent,
    pedidos: parent.pedidos.fields({
      fechaSalida: Field.Date("fechasalida", "Fecha Salida"),
    }),
    presupuestosCli: parent.presupuestosCli.fields({
      fechaSalida: Field.Date("fechasalida", "Fecha Salida"),
    }),
    lineasPresupuestosCli: parent.lineasPresupuestosCli.fields({
      pvpReferencia: Field.Currency("pvpreferencia", "Precio Referencia"),
    }),
    albaranescli: parent.albaranescli.fields({
      idPartees: Field.Int("idpartees", "Id. partes"),
      codAgente: Field.Text("codagente", "Agente"),
    }),
    lineasPedidosCli: parent.lineasPedidosCli.fields({
      codProveedor: Field.Text("codproveedor", "Cod proveedor"),
      precioNeto: Field.Text("precioneto", "Precio Neto"),
      pvpReferencia: Field.Currency("pvpreferencia", "Precio Referencia"),
    }),
    lineasFacturasCli: parent.lineasFacturasCli.fields({
      codProveedor: Field.Text("codproveedor", "Cod proveedor"),
      precioNeto: Field.Currency("precioneto", "Precio Neto"),
      pvpReferencia: Field.Currency("pvpreferencia", "Precio Referencia"),
    }),
    lineasAlbaranesCli: parent.lineasAlbaranesCli.fields({
      codProveedor: Field.Text("codproveedor", "Cod proveedor"),
      pvpReferencia: Field.Currency("pvpreferencia", "Precio Referencia"),
      canFactura: Field.Int("canfactura", "Cantidad factura"),
    }),
    emailDocsCliente: Schema("clientes", "codcliente").fields({
      codCliente: Field.Int("codcliente", "codcliente").auto(),
      tipoDoc: Field.Text("tipodoc", "Tipo documento"),
      idDoc: Field.Text("idDoc", "idDocumento"),
      codigoParte: Field.Text("codigoParte", "codigoParte"),
      dirTo: Field.Text("dirto", "dirto"),
      dirCc: Field.Text("dircc", "dircc"),
      dirBcc: Field.Text("dirbcc", "dirbcc"),
    }),
  };
};
