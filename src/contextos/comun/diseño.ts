export type ObjetoValor = {
  [clave: string]: unknown;
};

export type Entidad = {
  id: string;
  [clave: string]: unknown;
};

export type EntidadAccion = {
  id: string;
}

export type Criteria = {
  filtro: Filtro;
  orden: Orden;
}


type ValorFiltro = { LIKE: string };
export type Orden = { [campo: string]: "ASC" | "DESC" }
export type Filtro = { [campo: string]: ValorFiltro };

export type Direccion = {
  nombre_via: string;
  tipo_via: string;
  numero: string;
  otros: string;
  cod_postal: string;
  ciudad: string;
  provincia_id: number;
  provincia: string;
  pais_id: string;
  apartado: string;
  telefono: string;
};
