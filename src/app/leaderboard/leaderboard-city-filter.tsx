"use client";

import { ChevronDown, Globe2, MapPin } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { cn } from "@/lib/utils/cn";

type LeaderboardCityFilterProps = {
  cities: string[];
  selectedCity: string | null;
};

export function LeaderboardCityFilter({
  cities,
  selectedCity,
}: LeaderboardCityFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleCityChange(city: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (city) {
      params.set("city", city);
    } else {
      params.delete("city");
    }

    startTransition(() => {
      router.push(params.size ? `${pathname}?${params.toString()}` : pathname);
    });
  }

  return (
    <div
      className={cn(
        "border-border bg-card flex w-full items-center gap-3 rounded-lg border px-3 py-2 shadow-sm sm:w-auto",
        isPending && "opacity-70",
      )}
    >
      {selectedCity ? (
        <MapPin className="text-cherry size-4 shrink-0" />
      ) : (
        <Globe2 className="text-cherry size-4 shrink-0" />
      )}
      <label className="sr-only" htmlFor="leaderboard-city">
        City
      </label>
      <div className="relative min-w-0 flex-1 sm:min-w-56">
        <select
          id="leaderboard-city"
          value={selectedCity ?? ""}
          onChange={(event) => handleCityChange(event.target.value)}
          className="text-foreground w-full appearance-none bg-transparent py-1.5 pr-8 text-sm font-medium outline-none"
          disabled={isPending}
        >
          <option value="">Бүкіл әлемдік рейтинг</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        <ChevronDown className="text-muted pointer-events-none absolute top-1/2 right-0 size-4 -translate-y-1/2" />
      </div>
    </div>
  );
}
