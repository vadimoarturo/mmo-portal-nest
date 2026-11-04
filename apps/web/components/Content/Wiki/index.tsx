"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const Wiki = () => {
  const { t } = useTranslation();
  const topics = t("wiki:topics", { returnObjects: true }) as {
    title: string;
    body: string;
  }[];
  const [active, setActive] = useState(0);
  return (
    <section className="min-h-[70vh] max-w-6xl mx-auto px-6 py-16 text-white">
      <p className="text-green uppercase tracking-[0.3em] text-xs mb-4">
        mmo-portal
      </p>
      <h1 className="text-4xl mb-10">{t("wiki:title")}</h1>
      <div className="grid not-mb:grid-cols-[240px_1fr] gap-8">
        <nav className="flex flex-col gap-2" aria-label={t("wiki:title")}>
          {topics.map((topic, index) => (
            <button
              key={index}
              onClick={() => setActive(index)}
              aria-pressed={active === index}
              className={`text-left px-5 py-4 rounded-xl border ${active === index ? "border-green bg-green/10" : "border-white/10 hover:bg-white/5"}`}
            >
              {topic.title}
            </button>
          ))}
        </nav>
        <article className="bg-white/5 rounded-2xl p-10 border border-white/10">
          <h2 className="text-2xl mb-5">{topics[active].title}</h2>
          <p className="text-white/70 text-lg leading-relaxed">
            {topics[active].body}
          </p>
        </article>
      </div>
    </section>
  );
};
