"use client";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useModal } from "@/core/providers/modal.provider";
import { Auth } from "@/components/UI/Modal/Content/Auth";
import RankingSection from "./RankingSection";

export default function Welcome() {
  const { t, i18n } = useTranslation();
  const { showModal } = useModal();
  const en = i18n.language !== "ru";
  return (
    <div className="fantasy-home">
      <section className="realm-hero">
        <div className="realm-hero-art" />
        <div className="realm-hero-shade" />
        <div className="realm-hero-content">
          <div className="realm-eyebrow">
            <span />
            {en ? "A new chapter awaits" : "Вас ждёт новая глава"}
            <span />
          </div>
          <h1>{t("welcome:title")}</h1>
          <p>{t("welcome:description")}</p>
          <div className="realm-hero-actions">
            <button
              className="realm-button realm-button-gold"
              onClick={() => showModal(<Auth typeInitial="SIGN_UP" />)}
            >
              {en ? "Begin your journey" : "Начать приключение"}
              <span>↗</span>
            </button>
            <Link className="realm-button realm-button-outline" href="/wiki">
              {en ? "Explore the world" : "Узнать о мире"}
            </Link>
          </div>
          <div className="realm-hero-note">
            <span className="realm-small-diamond" />
            {en
              ? "Your story. Your allies. Your legacy."
              : "Ваша история. Ваши союзники. Ваше наследие."}
          </div>
        </div>
        <a
          href="#rank"
          className="realm-scroll"
          aria-label={en ? "View rankings" : "Посмотреть рейтинги"}
        >
          <span />
          {en ? "Discover more" : "Откройте больше"}
          <b>⌄</b>
        </a>
      </section>
      <section
        className="realm-paths"
        aria-label={en ? "Choose your path" : "Выберите свой путь"}
      >
        <Link href="/wiki" className="realm-path">
          <span className="realm-path-number">I</span>
          <div>
            <small>{en ? "Discover" : "Исследуйте"}</small>
            <h2>{en ? "An uncharted world" : "Неизведанный мир"}</h2>
            <p>
              {en
                ? "Everything you need to begin your legend."
                : "Всё, чтобы начать свою легенду."}
            </p>
          </div>
          <b>↗</b>
        </Link>
        <Link href="/shop" className="realm-path">
          <span className="realm-path-number">II</span>
          <div>
            <small>{en ? "Prepare" : "Подготовьтесь"}</small>
            <h2>{en ? "The Royal Exchange" : "Королевский рынок"}</h2>
            <p>
              {en
                ? "Equip yourself for the road ahead."
                : "Экипировка для грядущих приключений."}
            </p>
          </div>
          <b>↗</b>
        </Link>
        <Link href="/auction" className="realm-path">
          <span className="realm-path-number">III</span>
          <div>
            <small>{en ? "Prosper" : "Процветайте"}</small>
            <h2>{en ? "A player-driven realm" : "Мир в руках игроков"}</h2>
            <p>
              {en
                ? "Trade with the heroes at your side."
                : "Торгуйте с героями рядом с вами."}
            </p>
          </div>
          <b>↗</b>
        </Link>
      </section>
      <RankingSection />
      <section className="realm-join">
        <div className="realm-ornament">◆</div>
        <p className="realm-kicker">mmo-portal</p>
        <h2>
          {en
            ? "Every legend starts with a choice."
            : "Каждая легенда начинается с выбора."}
        </h2>
        <p>{en ? "Make yours." : "Сделайте свой."}</p>
        <button
          className="realm-button realm-button-gold"
          onClick={() => showModal(<Auth typeInitial="SIGN_UP" />)}
        >
          {en ? "Create your account" : "Создать аккаунт"}
          <span>↗</span>
        </button>
      </section>
    </div>
  );
}
