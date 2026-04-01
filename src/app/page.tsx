import { FinalCta } from "@/components/landing/FinalCta";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ImpactTrustSection } from "@/components/landing/ImpactTrustSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { MessageSamples } from "@/components/landing/MessageSamples";

export default function Home() {
  return (
    <div className="min-h-full">
      <main>
        <Hero />
        <HowItWorks />
        <ImpactTrustSection />
        <MessageSamples />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
