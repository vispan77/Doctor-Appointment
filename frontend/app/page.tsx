"use client"

import FAQSection from "@/components/landing/FAQSection";
import Footer from "@/components/landing/Footer";
import Headers from "@/components/landing/Headers";
import LandingHero from "@/components/landing/LandingHero";
import TestimonialSection from "@/components/landing/TestimonialSection";
import { userAuthStore } from "@/store/authStore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {

  // const user = {
  //   type: "doctor"
  // }

  const {user} = userAuthStore();

  const router = useRouter();

  useEffect(() => {
    if (user?.type === "doctor") {
      router.replace("/doctor/dashboard")
    }
  }, [user, router]);

  if (user?.type === "doctor") {
    return null;
  }

  return (
    <div>
      <Headers showDashboardNav={false} />
      
      <main className="pt-16">
        <LandingHero />
        <TestimonialSection />
        <FAQSection />
        <Footer />
      </main>
    </div>
  );
}
