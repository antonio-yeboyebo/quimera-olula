# Sobrecarga

## Componentes

### En src (base)
Cambios a realizar en el componente a sobrecargar

Creamos y exportamos un tipo para las props del componente
```js
export type LineasListaProps = {
  lineas: Linea[];
  publicar: ProcesarEvento;
};
```

Renombramos el componente original como NombreComponente + Base y usamos el tipo creado
```js
export const LineasListaBase = ({
  lineas,
  publicar,
}: LineasListaProps) => {

  // ...render de componente original

};
```

Creamos y exportamos una función con el nombre del componente original que use el contexto factory para obtener el componente inyectado
```js
export const LineasLista = (props: LineasListaProps) => {
  
  const { app } = useContext(FactoryCtx);
  const LineasLista_ = app.Ventas.pedido_detalle_lineas_LineasLista as typeof LineasListaBase;

  return LineasLista_(props);
}
```

Incluimos una clave en la factory del contexto correspondiente apuntando al componente base
```js
export class FactoryVentasOlula {
    // ...
    static pedido_detalle_lineas_LineasLista = LineasListaBase
}
```

### En app (nueva versión)

Creamos un archivo con el componente, que debe usar el mismo tipo de props 
```js
import  {LineasListaProps} from ...

export const LineasListaApp = ({
  lineas,
  publicar,
}: LineasListaProps) => {

  // ...render de componente original

};
```
donde _App_ es el sufijo con los tres dígitos que suelen identificar al cliente / proyecto (Gan, Mon, Gua, San, ...)

Incluimos una clave en la factory del contexto correspondiente de la app apuntando al nuevo componente
```js
export class FactoryVentasApp {
    // ...
    static pedido_detalle_lineas_LineasLista = LineasListaApp
}
```
## Infraestructura