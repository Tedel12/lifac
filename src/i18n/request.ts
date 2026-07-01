import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales, LOCALE_COOKIE, type Locale } from "./config";

function negotiate(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  const preferred = acceptLanguage
    .split(",")
    .map((p) => p.split(";")[0].trim().toLowerCase().slice(0, 2));
  for (const code of preferred) {
    if ((locales as readonly string[]).includes(code)) return code as Locale;
  }
  return defaultLocale;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value as Locale | undefined;

  let locale: Locale;
  if (fromCookie && (locales as readonly string[]).includes(fromCookie)) {
    locale = fromCookie;
  } else {
    const hdrs = await headers();
    locale = negotiate(hdrs.get("accept-language"));
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return { locale, messages };
});
