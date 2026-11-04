export const appLink = {
  home: "/",
  shop: "/shop",
  auction: "/auction",
  wiki: "/wiki",
  discord: process.env.NEXT_PUBLIC_DISCORD_URL || "",
  telegram: process.env.NEXT_PUBLIC_TELEGRAM_URL || "",
  agree: "/agree",
  auth: {
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
  },
};
