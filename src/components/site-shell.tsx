"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageLoader } from "@/components/page-loader";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";

export function SiteShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <PageLoader />
      <Header />
      {children}
      <ScrollToTopButton />
      <Footer />
    </>
  );
}

