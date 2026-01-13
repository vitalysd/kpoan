import {Hero} from "@/components/hero";
import {Categories} from "@/components/categories";
import {About} from "@/components/about";
import {Advantages} from "@/components/advantages";
import {Assortment} from "@/components/assortment";
import {Tenders} from "@/components/tenders";
import {SocialProof} from "@/components/socialProof";
import {WorkProcess} from "@/components/workProcess";

export default function Home() {
  return (
    <main className="main-container">
      <Hero />
      <Categories />
      <About />
      <Advantages />
      <Assortment />
      <Tenders />
      <SocialProof />
      <WorkProcess />
    </main>
  );
}
