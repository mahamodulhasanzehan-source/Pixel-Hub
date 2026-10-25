import React from 'react';

export const BackgroundDoodles = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Deep ambient background gradient */}
      <div className="absolute inset-0 bg-[#07090e]" />
      
      {/* Precision hairline dot-grid with subtle radial mask */}
      <div 
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `radial-gradient(rgba(148, 163, 184, 0.45) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 10%, #000 35%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 10%, #000 35%, transparent 85%)'
        }}
      />

      {/* Atmospheric radial glows */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-[420px] h-[300px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-[380px] h-[280px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
};
