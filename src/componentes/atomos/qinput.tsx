import { useState } from "react";
import "./qinput.css";

export type FormInputProps = {
  label: string;
  nombre: string;
  deshabilitado?: boolean;
  placeholder?: string;
  valor?: string;
  textoValidacion?: string;
  erroneo?: boolean;
  advertido?: boolean;
  valido?: boolean;
  opcional?: boolean;
  condensado?: boolean;
  onChange?: (valor: string, evento: React.ChangeEvent<HTMLElement>) => void;
  onBlur?: (valor: string, evento: React.FocusEvent<HTMLElement>) => void;
};

type QInputProps = FormInputProps & {
  lista?: string;
  autocompletar?: "off" | "on";
  onInput?: (valor: string, evento: React.FormEvent<HTMLInputElement>) => void;
};

export const QInput = ({
  label,
  nombre,
  deshabilitado,
  placeholder,
  valor = "",
  textoValidacion = "",
  erroneo,
  advertido,
  valido,
  opcional,
  condensado,
  lista,
  autocompletar,
  onChange,
  onBlur,
  onInput,
}: QInputProps) => {
  const attrs = { erroneo, advertido, valido, opcional, condensado };

  return (
    <quimera-input {...attrs}>
      <label>
        <span className="etiqueta">
          {label}&nbsp;
          <span className="etiqueta-opcional">(opcional)</span>
        </span>
        <input
          type="text"
          name={nombre}
          placeholder={placeholder}
          value={onChange ? valor : undefined}
          defaultValue={onChange ? undefined : valor}
          disabled={deshabilitado}
          required={!opcional}
          list={lista}
          autoComplete={autocompletar}
          onChange={(e) => onChange?.(e.target.value, e)}
          onBlur={(e) => onBlur?.(e.target.value, e)}
          onInput={(e) => onInput?.((e.target as HTMLInputElement).value, e)}
        />
        <span className="texto-validacion">{textoValidacion}</span>
      </label>
    </quimera-input>
  );
};


type QInputProps2 = {
  label: string;
  nombre: string;
  deshabilitado?: boolean;
  placeholder?: string;
  valor?: string;
  textoValidacion?: string;
  erroneo?: boolean;
  advertido?: boolean;
  valido?: boolean | ((v: string) => boolean);
  opcional?: boolean;
  condensado?: boolean;
  onChange?: (valor : string) => void;
  controlado?: boolean;
};

export const QInput2 = ({
  label,
  nombre,
  deshabilitado,
  placeholder,
  valor = "",
  textoValidacion = "",
  erroneo,
  advertido,
  valido,
  opcional,
  condensado,
  onChange,
  controlado=false,
}: QInputProps2) => {

  const [valorInterno, setValorInterno] = useState(valor);
  const [esValido, setEsValido] = useState<boolean>(typeof valido === "boolean" ? valido : true);

  console.log("Valido", esValido);

  const onChangeInterno = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;

    if (valido && typeof valido === "function") {
      setEsValido(valido(valor));
    }
    
    if (controlado) {
      onChange && onChange(valor);
    } else {
      setValorInterno(valor);
    }
  };

  // erroneo = true
  const attrs = { erroneo:!esValido, advertido, valido, opcional, condensado };
  return (
    <quimera-input {...attrs}>
      <label>
        <span className="etiqueta">
          {label}&nbsp;
          <span className="etiqueta-opcional">(opcional)</span>
        </span>
        <input
          type="text"
          name={nombre}
          placeholder={placeholder}
          disabled={deshabilitado}

          value={controlado ? valor : valorInterno}
          defaultValue={controlado ? undefined : valor}
          onChange={onChangeInterno}
          onBlur={(e: React.FocusEvent<HTMLInputElement>) => !controlado && onChange && onChange(e.target.value)}
        />
        <span className="texto-validacion">{textoValidacion}</span>
      </label>
    </quimera-input>
  );
};
