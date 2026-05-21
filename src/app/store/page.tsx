import { MotionPage } from "@/components/ui/motion-page";
import { StoreDashboard } from "@/features/store/components/store-dashboard";
import { useI18n } from "@/providers/i18n-provider";

export const metadata = {
  title: "Store",
};

export default function StorePage() {
  const { t } = useI18n();

  return (
    <MotionPage className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-cherry text-sm font-medium">{t("store_tagline")}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {t("store_title")}
          </h1>
          <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
            {t("store_subtitle")}
          </p>
        </div>

        <StoreDashboard />
      </div>
    </MotionPage>
  );
}
