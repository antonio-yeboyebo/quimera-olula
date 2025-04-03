import { useState } from "react";
import "./qinput.css";

type QInputProps = {
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
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  onChange,
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
          onChange={onChange}
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
