# Lógica de lecturas en salidas

La generación de salidas crea líneas para cada combinación SKU / ubicación desde donde hay que sacar la mercancía.

## Glosario

_articulo suelto_: artículo en una ubicación que no está dentro de ninguna caja.
_lote suelto_: material asociado a un  lote en una ubicación que no está dentro de ninguna caja.

## UI
En la ubicación, el usuario puede leer un SKU, un código de lote o una caja
+ Si lee un SKU se comprueba que el artículo vaya por lotes
	+ Si va por lotes > Error
	+ Si no va por lotes, se comprueba si hay artículo suelto
		+ Si hay artículo suelto se crea la línea por min(cantidad pendiente de la línea, cantidad del sku en la ubicación)
		+ Si no hay artículo suelto > Error
+ Si se lee un Lote
	+ Si hay artículo suelto del sku y lote leído, se crea la línea por min(cantidad pendiente de la línea, cantidad del sku en la ubicación)
	+ Si no hay artículo suelto del sku y lote leído > Error
+ Si se lee una Caja
	+ Si el artículo no va por lotes:
		+ Si el artículo está contenido en la caja (primer nivel), se crea la lectura
		+ Si el artículo no está contenido en la caja > Error
	+ Si el artículo va por lotes:
		+ Si el artículo está contenido en la caja (primer nivel) y solo hay un lote para el artículo, se crea la lectura
		+ Si el artículo está contenido en la caja (primer nivel) y solo hay más de un lote para el artículo, se pide al usuario que elija el lote de una lista de lotes
		+ Si el artículo y lote no está contenido en la caja > Error

## Fin de la salida: albaranar

+ Cuando todas las líneas están leídas la orden de SALIDA queda **PREPARADA** (no TERMINADA). El lector de pick se cierra igual que al terminar.
+ En una SALIDA PREPARADA la acción principal es **Albaranar** (`ordenAlbaranable`). También hay un botón Albaranar en el detalle, deshabilitado mientras la salida no está PREPARADA y oculto cuando ya está TERMINADA. El botón Terminar se oculta en PREPARADA.
+ Albaranar (`PATCH /almacen/orden/<id>/albaranar`) genera un albarán por pedido y deja la orden TERMINADA. El modal enlaza los albaranes generados.
+ Al borrar uno de esos albaranes la orden vuelve a PREPARADA y se puede albaranar de nuevo.
+ El maestro muestra por defecto las órdenes PENDIENTE, EN_CURSO y PREPARADA.

## Envío por agencia

+ Una SALIDA **TERMINADA** (ya albaranada) muestra el botón **Generar envío** si la app tiene alguna agencia de transporte activa (plugins `transporte_dachser`, `transporte_correose`) y le queda algún albarán sin envío (`ordenPermiteEnvio`).
+ El modal (`vistas/generar_envio/GenerarEnvioOrden.tsx`) carga las agencias activas (`GET /almacen/envio_agencia/agencias`) y pide albarán, agencia, servicio, bultos, kilos, fecha de recogida y observaciones. Si solo hay un albarán sin envío o una sola agencia, vienen elegidos; al cambiar de agencia se vacía el servicio.
+ Al generar (`POST /almacen/orden/<id>/envio_agencia`) se imprime la etiqueta (`GET /almacen/envio_agencia/<albaran_id>/etiqueta`) y se refresca la orden.
+ En la cabecera, cada albarán con envío muestra la agencia, el nº de envío y un botón **Etiqueta** para reimprimirla.
