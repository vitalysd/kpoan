import {Hero} from "@/components/hero";
import {CertificateCarousel} from "@/components/certificate-carousel";
import {Categories} from "@/components/categories";
import {About} from "@/components/about";
import {Advantages} from "@/components/advantages";
import {Assortment} from "@/components/assortment";
import {SocialProof} from "@/components/socialProof";
import {WorkProcess} from "@/components/workProcess";

export default function Home() {
  return (
    <main className="main-container">
      <Hero />
      <CertificateCarousel />
      <Categories />
      <About />
      <Advantages />
      <Assortment />
      <SocialProof />
      <WorkProcess />
    </main>
  );
}
