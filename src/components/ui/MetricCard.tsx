import { ReactNode } from "react";

type Props = {
  title: string;
  value: string | number;
  trend?: string;
  color?: "cyan" | "red" | "green";
  children?: ReactNode;
};

export function MetricCard({ title, value, trend, color = "cyan", children }: Props) {
  const borderColor = color === "red" ? "border-red-500 shadow-red-500/70" : "border-cyber-neon shadow-cyber-neon/70";
  const textColor = color === "red" ? "text-red-400" : color === "green" ? "text-green-400" : "text-cyber-neon";

  return (
    <div className={`bg-cyber-card/90 backdrop-blur-xl border-6 ${borderColor} rounded-3xl p-16 text-center shadow-2xl`}>
      <h3 className="text-5xl font-bold text-cyan-300 mb-8">{title}</h3>
      <p className={`text-8xl md:text-9xl font-black ${textColor} glow-strong`}>{value}</p>
      {trend && <p className="text-5xl font-bold text-cyan-200 mt-10">{trend}</p>}
      {children}
    </div>
  );
}