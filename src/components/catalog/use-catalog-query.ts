"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type UpdateValue = string | number | null | undefined;

export function useCatalogQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pushParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const setSingleValue = (key: string, value: UpdateValue) => {
    pushParams((params) => {
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
      if (key !== "page") params.delete("page");
    });
  };

  const setManyValues = (updates: Record<string, UpdateValue>) => {
    pushParams((params) => {
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      params.delete("page");
    });
  };

  const setMultiValue = (key: string, values: string[]) => {
    pushParams((params) => {
      if (values.length === 0) {
        params.delete(key);
      } else {
        params.set(key, values.join(","));
      }
      params.delete("page");
    });
  };

  const toggleMultiValue = (key: string, value: string) => {
    const current = (searchParams.get(key) ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    setMultiValue(key, next);
  };

  const clearAll = () => {
    router.push(pathname, { scroll: false });
  };

  return {
    searchParams,
    setSingleValue,
    setManyValues,
    toggleMultiValue,
    clearAll,
  };
}
