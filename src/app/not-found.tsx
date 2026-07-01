import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  const t = useTranslations("errors");
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-4">
      <div className="text-center max-w-md">
        <p className="font-display text-9xl font-bold text-lifac-gold-500 mb-2">
          404
        </p>
        <h1 className="font-display text-2xl font-bold text-lifac-blue-900 mb-3">
          {t("notFound")}
        </h1>
        <p className="text-gray-600 mb-8">
          {t("notFoundDesc")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="default" size="lg" className="w-full sm:w-auto">
              <Home className="h-4 w-4" />
              {t("backHome")}
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Search className="h-4 w-4" />
              {t("contactUs")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
