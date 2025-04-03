import { useEffect, useState } from "react";

export type OpcionCampo = [string, string];

export type CampoFormularioGenerico = {
  nombre: string;
  etiqueta: string;
  placeholder?: string;
  tipo: "text" | "email" | "number" | "date" | "password" | "space" | "select";
  soloLectura?: boolean;
  oculto?: boolean;
  requerido?: boolean;
  valorInicial?: string;
  ancho?: string;
  condensado?: boolean;
  opciones?: OpcionCampo[];
  xtipo?: string;
};

// type FormularioGenericoProps<T> = {
//   campos: CampoFormularioGenerico[];
//   entidad: T;
//   setEntidad: (entidad: T) => void;
//   onSubmit: (data: T) => Promise<void>;
//   onCampoCambiado?: (campo: string, valor: any) => void;
//   validacion?: (entidad: T) => string | null;
// };

export const Input = ({
  controlado = false,
  ...props
}: {
  controlado?: boolean;
  campo: CampoFormularioGenerico;
  onCampoCambiado?: (campo: string, valor: string) => void;
  valorEntidad: string;
  validador?: (valor: string) => boolean;
}) => {
  return controlado ? (
    <InputControlado {...props} />
  ) : (
    <InputNoControlado {...props} />
  );
};

const InputControlado = ({
  campo,
  onCampoCambiado = () => {},
  valorEntidad,
  validador,
}: {
  campo: CampoFormularioGenerico;
  onCampoCambiado?: (campo: string, valor: string) => void;
  valorEntidad: string;
  validador?: (valor: string) => boolean;
}) => {
  const [valido, setValido] = useState<boolean>(true);

  const onInput = (valor: string) => {
    onCampoCambiado(campo.nombre, valor);
    setValido(validador ? validador(valor) : true);
  };

  useEffect(() => {
    setValido(validador ? validador(valorEntidad) : true);
  }, [valorEntidad, validador]);

  return (
    <label>
      {campo.etiqueta + " " + (valido ? "OK" : "(Inválido)")} :
      <input
        type="text"
        value={valorEntidad || ""}
        onInput={(e) => onInput((e.target as HTMLInputElement).value)}
      />
    </label>
  );
};

const InputNoControlado = ({
  campo,
  onCampoCambiado,
  valorEntidad,
  validador,
}: {
  campo: CampoFormularioGenerico;
  onCampoCambiado?: (campo: string, valor: string) => void;
  valorEntidad: string;
  validador?: (valor: string) => boolean;
}) => {
  const [valor, setValor] = useState<string | undefined>(undefined);
  const [valido, setValido] = useState<boolean>(true);

  useEffect(() => {
    setValor(valorEntidad || "");
  }, [valorEntidad]);

  const onInput = (valor: string) => {
    setValor(valor);
    setValido(validador ? validador(valor || "") : true);
  };
  const prefijoCambiado = valor !== valorEntidad ? "!" : "";

  return (
    <label>
      {prefijoCambiado + campo.etiqueta + " " + (valido ? "OK" : "(Inválido)")}{" "}
      :
      <input
        type="text"
        value={valor || ""}
        onBlur={(e) =>
          valido &&
          valor !== valorEntidad &&
          onCampoCambiado &&
          onCampoCambiado(campo.nombre, e.target.value)
        }
        onInput={(e) => onInput((e.target as HTMLInputElement).value)}
        onKeyUp={(e) => e.code === "Escape" && onInput(valorEntidad || "")}
        // onKeyUp={(e) => e.code === 'Enter' && onCampoCambiado && onCampoCambiado(campo.nombre, e.target.value)}
      />
    </label>
  );
};

export const InputNumerico = ({
  controlado = false,
  ...props
}: {
  controlado?: boolean;
  campo: CampoFormularioGenerico;
  onCampoCambiado?: (campo: string, valor: number) => void;
  valorEntidad: number;
  validador?: (valor: number) => boolean;
}) => {
  return controlado ? (
    <InputNumericoControlado {...props} />
  ) : (
    <InputNumericoNoControlado {...props} />
  );
};

const InputNumericoControlado = ({
  campo,
  onCampoCambiado = () => {},
  valorEntidad,
  validador,
}: {
  campo: CampoFormularioGenerico;
  onCampoCambiado?: (campo: string, valor: number) => void;
  valorEntidad: number;
  validador?: (valor: number) => boolean;
}) => {
  const [valido, setValido] = useState<boolean>(true);

  const onInput = (valor: number) => {
    onCampoCambiado(campo.nombre, valor);
    setValido(validador ? validador(valor) : true);
  };

  useEffect(() => {
    setValido(validador ? validador(valorEntidad) : true);
  }, [valorEntidad, validador]);

  return (
    <label>
      {campo.etiqueta + " " + (valido ? "OK" : "(Inválido)")} :
      <input
        type="text"
        value={valorEntidad || ""}
        onInput={(e) =>
          onInput(parseFloat((e.target as HTMLInputElement).value)) ?? 0
        }
      />
    </label>
  );
};

const InputNumericoNoControlado = ({
  campo,
  onCampoCambiado,
  valorEntidad,
  validador,
}: {
  campo: CampoFormularioGenerico;
  onCampoCambiado?: (campo: string, valor: number) => void;
  valorEntidad: number;
  validador?: (valor: number) => boolean;
}) => {
  const [valor, setValor] = useState<number | undefined>(undefined);
  const [valido, setValido] = useState<boolean>(true);

  useEffect(() => {
    setValor(valorEntidad || 0);
  }, [valorEntidad]);

  const onInput = (valor: number) => {
    setValor(valor);
    setValido(validador ? validador(valor || 0) : true);
  };
  const prefijoCambiado = valor !== valorEntidad ? "!" : "";

  return (
    <label>
      {prefijoCambiado + campo.etiqueta + " " + (valido ? "OK" : "(Inválido)")}{" "}
      :
      <input
        type="text"
        value={valor || ""}
        onBlur={(e) =>
          valido &&
          valor !== valorEntidad &&
          onCampoCambiado &&
          onCampoCambiado(campo.nombre, parseFloat(e.target.value))
        }
        onInput={(e) =>
          onInput(parseFloat((e.target as HTMLInputElement).value)) ?? 0
        }
        onKeyUp={(e) => e.code === "Escape" && onInput(valorEntidad || 0)}
        // onKeyUp={(e) => e.code === 'Enter' && onCampoCambiado && onCampoCambiado(campo.nombre, e.target.value)}
      />
    </label>
  );
};

export const InputSelect = ({
  campo,
  valorEntidad,
  onCampoCambiado = () => {},
}: {
  campo: CampoFormularioGenerico;
  valorEntidad: string;
  onCampoCambiado?: (campo: string, valor: string) => void;
}) => {
  const [valor, setValor] = useState<string>(valorEntidad || "");

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoValor = e.target.value;
    setValor(nuevoValor);
    onCampoCambiado(campo.nombre, nuevoValor);
  };

  return (
    <label>
      {campo.etiqueta}:
      <select value={valor} onChange={onChange}>
        <option value="" disabled>
          Seleccione una opción
        </option>
        {(campo.opciones ?? []).map(([valorOpcion, etiquetaOpcion]) => (
          <option key={valorOpcion} value={valorOpcion}>
            {etiquetaOpcion}
          </option>
        ))}
      </select>
    </label>
  );
};
