import { MotionPage } from "@/components/ui/motion-page";
import { StoreDashboard } from "@/features/store/components/store-dashboard";

export const metadata = {
  title: "Store",
};

export default function StorePage() {
  return (
    <MotionPage className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-cherry text-sm font-medium">Cherry Economy</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Premium Store
          </h1>
          <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
            Manage hearts, Cherry Pro access, and premium visual configuration.
          </p>
        </div>

        <StoreDashboard />
      </div>
    </MotionPage>
  );
}
