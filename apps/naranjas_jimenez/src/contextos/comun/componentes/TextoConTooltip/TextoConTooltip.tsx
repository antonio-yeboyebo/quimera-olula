import { useState } from "react";
import "./TextoConTooltip.css";

export const TextoConTooltip = ({ texto }: { texto: string | null }) => {
  const [tooltip, setTooltip] = useState<{ show: boolean; top: number; left: number }>({ show: false, top: 0, left: 0 });
  
  if (!texto) return null;
  
  const onMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    const el = e.currentTarget;
    if (el.scrollWidth <= el.clientWidth) return; // Solo mostrar si hay ellipsis

    const rect = el.getBoundingClientRect(); // Posición del elemento
    const width = Math.min(texto.length * 8, window.innerWidth * 0.9); // Ancho tooltip (~8px/char, máx 90%)
    let left = rect.left + rect.width / 2; // Centrar horizontalmente
    
    if (left - width / 2 < 10) left = width / 2 + 10; // Ajustar si se sale por izquierda
    else if (left + width / 2 > window.innerWidth - 10) left = window.innerWidth - width / 2 - 10; // Ajustar si se sale por derecha
    
    setTooltip({ show: true, top: rect.top - 40, left }); // Mostrar 40px arriba
  };
  
  return (
    <span className="texto-responsive" onMouseEnter={onMouseEnter} onMouseLeave={() => setTooltip(prev => ({ ...prev, show: false }))}>
      {texto}
      {tooltip.show && <div className="tooltip-custom" style={{ top: tooltip.top, left: tooltip.left, transform: 'translateX(-50%)' }} /* Posición dinámica calculada */>{texto}</div>}
    </span>
  );
};