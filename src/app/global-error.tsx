"use client";

import { useEffect } from "react";
import Link from "next/link";
import { NextIntlClientProvider } from "next-intl";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import messages from "../../messages/fr.json";

function ErrorContent({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
  const t = useTranslations("errors");
  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 bg-gray-50">
        <div className="text-center max-w-md">
        <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
        <h1 className="font-display text-2xl font-bold text-lifac-blue-900 mb-3">
            {t("unexpected")}
        </h1>
        <p className="text-gray-600 mb-8">
            {t("unexpectedDesc")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} variant="default" size="lg">
            <RefreshCw className="h-4 w-4" />
            {t("retry")}
            </Button>
            <Link href="/">
            <Button variant="outline" size="lg">
                <Home className="h-4 w-4" />
                {t("backHome")}
            </Button>
            </Link>
        </div>
        </div>
    </div>
  );
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="fr">
      <body>
        <NextIntlClientProvider locale="fr" messages={messages}>
            <ErrorContent error={error} reset={reset} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
