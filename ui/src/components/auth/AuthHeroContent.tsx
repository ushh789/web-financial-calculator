"use client";

import { motion } from "framer-motion";
import { TrendingUp, CheckCircle } from "lucide-react";

interface Props {
  headline: string;
  subheadline: string;
  features: string[];
}

export function AuthHeroContent({ headline, subheadline, features }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative z-10 flex flex-col h-full justify-between"
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">
          Фін. Калькулятор
        </span>
      </div>

      {/* Center content */}
      <div>
        <h1 className="text-3xl font-bold text-white leading-tight mb-3">
          {headline}
        </h1>
        <p className="text-white/70 text-sm leading-relaxed mb-8">
          {subheadline}
        </p>
        <div className="space-y-3">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-white/80 mt-0.5 shrink-0" />
              <span className="text-white/80 text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative bar chart */}
      <div className="flex items-end gap-[3px] h-20 opacity-20">
        {[40, 65, 45, 80, 55, 70, 60, 85, 50, 75, 90, 65].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm bg-white"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </motion.div>
  );
}
