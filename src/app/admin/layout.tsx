import { AdminSidebar } from "@/components/admin/sidebar";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { getCurrentAdminName } from "@/actions/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const adminName = await getCurrentAdminName();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar adminName={adminName} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </NextIntlClientProvider>
  );
}
