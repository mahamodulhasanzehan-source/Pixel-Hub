import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Code, Box, Cpu, Layers, Sparkles, Hexagon, Triangle, Circle, Terminal } from 'lucide-react';

export const BackgroundDoodles = () => {
  const icons = [Code, Box, Cpu, Layers, Sparkles, Hexagon, Triangle, Circle, Terminal];
  const [doodles, setDoodles] = useState<Array<{ id: number; Icon: any; size: number; left: number; top: number; duration: number; delay: number }>>([]);

  useEffect(() => {
    const newDoodles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      Icon: icons[i % icons.length],
      size: Math.random() * 40 + 20,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * -20,
    }));
    setDoodles(newDoodles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-slate-950/80" />
      {doodles.map((doodle) => {
        const { Icon } = doodle;
        return (
          <motion.div
            key={doodle.id}
            className="absolute text-blue-500/10"
            style={{ left: `${doodle.left}%`, top: `${doodle.top}%` }}
            animate={{
              y: [0, -60, 0],
              x: [0, 40, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: doodle.duration,
              repeat: Infinity,
              ease: "linear",
              delay: doodle.delay,
            }}
          >
            <Icon size={doodle.size} strokeWidth={1.5} />
          </motion.div>
        );
      })}
    </div>
  );
};
