import { QBoton } from "@olula/componentes/index.ts";
import { ButtonHTMLAttributes, ReactNode, useState } from "react";
import "./BotonConTooltip.css";

export const BotonConTooltip = ({
  children,
  tooltip,
  ...props
}: {
  children: ReactNode;
  tooltip: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) => {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0 });

  const onMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({ top: rect.top - 40 });
    setShow(true);
  };

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <QBoton
        {...props}
        onMouseEnter={onMouseEnter}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </QBoton>
      {show && (
        <div
          className="tooltip-custom"
          style={{
            top: coords.top,
            // left: coords.left,
            // right: coords.right,
            // bottom: coords.bottom,
            transform: "translateX(-50%)",
            position: "fixed",
            zIndex: 9999,
          }}
        >
          {tooltip}
        </div>
      )}
    </span>
  );
};
