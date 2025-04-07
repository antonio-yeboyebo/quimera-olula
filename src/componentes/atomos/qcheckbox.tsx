import "./qcheckbox.css";

type FormInputProps = {
  label: string;
  nombre: string;
  deshabilitado?: boolean;
  placeholder?: string;
  valor?: boolean;
  textoValidacion?: string;
  erroneo?: boolean;
  advertido?: boolean;
  valido?: boolean;
  opcional?: boolean;
  condensado?: boolean;
  onChange?: (valor: boolean, evento: React.ChangeEvent<HTMLElement>) => void;
  onBlur?: (valor: boolean, evento: React.FocusEvent<HTMLElement>) => void;
};

type QCheckBoxProps = FormInputProps & {
  lista?: string;
  autocompletar?: "off" | "on";
  onInput?: (valor: string, evento: React.FormEvent<HTMLInputElement>) => void;
};

export const QCheckbox = ({
  label,
  nombre,
  deshabilitado,
  placeholder,
  valor = false,
  textoValidacion = "",
  erroneo,
  advertido,
  valido,
  opcional,
  condensado,
  onChange,
  onBlur,
  onInput,
}: QCheckBoxProps) => {
  const attrs = { erroneo, advertido, valido, opcional, condensado };

  return (
    <quimera-checkbox {...attrs}>
      <label>
        <span className="etiqueta">
          {label}&nbsp;
          <span className="etiqueta-opcional">(opcional)</span>
        </span>
        <input
          type="checkbox"
          name={nombre}
          placeholder={placeholder}
          checked={onChange ? valor : undefined}
          defaultChecked={onChange ? undefined : valor}
          disabled={deshabilitado}
          required={!opcional}
          onChange={(e) => onChange?.(e.target.checked, e)}
          onBlur={(e) => onBlur?.(e.target.checked, e)}
          onInput={(e) => onInput?.((e.target as HTMLInputElement).value, e)}
        />
        { textoValidacion && <span className="texto-validacion">{textoValidacion}</span> }
      </label>
    </quimera-checkbox>
  );
};




