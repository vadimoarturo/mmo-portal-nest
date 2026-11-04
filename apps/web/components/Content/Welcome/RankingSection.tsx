"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { BackendApiService } from "@/core/services/api";

type Tab = "topLevel" | "topPK" | "topGuilds";
type Row = { name: string; role: string; clan: string; score: number };

export default function RankingSection() {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<Tab>("topLevel");
  const en = i18n.language !== "ru";
  const { data = [], isPending } = useQuery<Row[]>({
    queryKey: ["rankings", tab, i18n.language],
    queryFn: async () => {
      if (tab === "topGuilds") {
        const guilds = await BackendApiService.getTopGuilds();
        return guilds.map((guild) => ({
          name: guild.name,
          role: guild.leaders || "—",
          clan: `${guild.players} ${t("welcome:rankings.members")}`,
          score: guild.dungeons,
        }));
      }
      const players =
        tab === "topPK"
          ? await BackendApiService.getTopPks()
          : await BackendApiService.getTopPlayers();
      const roles: Record<number, string> = {
        100: en ? "Guardian" : "Страж",
        200: en ? "Arcanist" : "Маг",
        300: en ? "Pathfinder" : "Следопыт",
      };
      return players.map((player) => ({
        name: player.name,
        role: roles[player.job] || `#${player.job}`,
        clan: player.guildName || "—",
        score:
          tab === "topPK" && "pkc" in player ? Number(player.pkc) : player.lv,
      }));
    },
    staleTime: 60000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  return (
    <section id="rank" className="realm-rankings">
      <div className="realm-section-heading">
        <div>
          <p className="realm-kicker">{t("welcome:rankings.eyebrow")}</p>
          <h2>{t("welcome:rankings.title")}</h2>
          <p className="realm-section-description">
            {t("welcome:rankings.description")}
          </p>
        </div>
        <div
          className="realm-tabs"
          role="tablist"
          aria-label={t("welcome:rankings.title")}
        >
          {(["topLevel", "topPK", "topGuilds"] as Tab[]).map((value) => (
            <button
              key={value}
              role="tab"
              id={`tab-${value}`}
              aria-selected={tab === value}
              aria-controls="ranking-panel"
              tabIndex={tab === value ? 0 : -1}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                  const values: Tab[] = ["topLevel", "topPK", "topGuilds"];
                  const next =
                    values[
                      (values.indexOf(tab) +
                        (event.key === "ArrowRight" ? 1 : 2)) %
                        3
                    ];
                  setTab(next);
                  document.getElementById(`tab-${next}`)?.focus();
                }
              }}
              onClick={() => setTab(value)}
            >
              {t(`welcome:tables.${value}.title`)}
            </button>
          ))}
        </div>
      </div>
      <div
        id="ranking-panel"
        className="realm-table-panel"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
      >
        <table className="realm-table">
          <thead>
            <tr>
              <th className="realm-rank-column">
                {t("welcome:rankings.rank")}
              </th>
              <th>
                {tab === "topGuilds"
                  ? en
                    ? "Clan"
                    : "Клан"
                  : t("welcome:rankings.name")}
              </th>
              <th className="realm-desktop-column">
                {tab === "topGuilds"
                  ? en
                    ? "Leader"
                    : "Лидер"
                  : t("welcome:rankings.class")}
              </th>
              <th className="realm-desktop-column">
                {tab === "topGuilds"
                  ? en
                    ? "Members"
                    : "Участники"
                  : t("welcome:rankings.clan")}
              </th>
              <th className="realm-score-column">
                {tab === "topLevel"
                  ? t("welcome:rankings.level")
                  : t("welcome:rankings.score")}
              </th>
            </tr>
          </thead>
          <tbody>
            {isPending ? (
              <tr>
                <td colSpan={5} className="realm-empty">
                  {t("welcome:rankings.loading")}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} className="realm-empty">
                  {t("welcome:rankings.empty")}
                </td>
              </tr>
            ) : (
              data.slice(0, 10).map((row, index) => (
                <tr key={`${row.name}-${index}`}>
                  <td>
                    <span
                      className={`realm-rank-medal realm-medal-${index + 1}`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </td>
                  <td>
                    <div className="realm-player-cell">
                      <span
                        className={`realm-player-sigil realm-sigil-${index % 3}`}
                      >
                        ◆
                      </span>
                      <div className="realm-player-name">
                        {row.name}
                        <span className="realm-mobile-clan">{row.clan}</span>
                      </div>
                    </div>
                  </td>
                  <td className="realm-desktop-column realm-muted">
                    {row.role}
                  </td>
                  <td className="realm-desktop-column realm-muted">
                    {row.clan}
                  </td>
                  <td className="realm-score-column">
                    <span className="realm-score">
                      {Number(row.score).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="realm-table-foot">
          <span>
            ◆{" "}
            {en
              ? "Legends are written in action."
              : "Легенды создаются поступками."}
          </span>
          <span>
            {en ? "Updated every 10 minutes" : "Обновление каждые 10 минут"}
          </span>
        </div>
      </div>
    </section>
  );
}
