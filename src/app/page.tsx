"use client";

import { useRouter } from "next/navigation";
import { 
  MapPin, 
  Clock, 
  TrendingUp, 
  Search, 
  Car,
  GraduationCap,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationInput } from "@/components/search/LocationInput";
import { useSearchStore } from "@/store/searchStore";
import { useEffect } from "react";

const features = [
  {
    icon: MapPin,
    title: "Search by Location",
    description: "Enter your school or workplace and find rentals within your preferred distance.",
  },
  {
    icon: Clock,
    title: "Real Commute Times",
    description: "Get accurate commute estimates based on actual traffic patterns at your travel times.",
  },
  {
    icon: TrendingUp,
    title: "Value Scoring",
    description: "Our algorithm ranks rentals by best value, considering price, size, and commute time.",
  },
];

const steps = [
  { number: "1", text: "Enter your destination" },
  { number: "2", text: "Set your commute preferences" },
  { number: "3", text: "Browse optimized results" },
];

export default function Home() {
  const router = useRouter();
  const { destinationLat, destinationLng } = useSearchStore();

  // Navigate to results when destination is set
  useEffect(() => {
    if (destinationLat && destinationLng) {
      router.push("/results");
    }
  }, [destinationLat, destinationLng, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">CommuteFinder</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                How It Works
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              <span>Built for college students</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 animate-slide-up tracking-tight">
              Find rentals by{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                commute time
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-slate-600 mb-12 animate-slide-up delay-100 max-w-2xl mx-auto">
              Stop guessing how long your commute will be. Search for apartments based on actual travel time to your school or workplace.
            </p>

            {/* Search Box */}
            <div className="max-w-2xl mx-auto animate-slide-up delay-200">
              <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 p-6 border border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-3 text-left">
                  Where do you need to commute to?
                </label>
                <LocationInput />
                <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4" />
                    <span>University</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    <span>Office</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>Any address</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center justify-center gap-8 mt-12 animate-slide-up delay-300">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                    {step.number}
                  </div>
                  <span className="text-slate-600 text-sm">{step.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to find the perfect rental
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our smart search combines rental data with real-time commute calculations to help you make informed decisions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-slate-50 rounded-2xl p-8 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                Smart apartment hunting in three simple steps
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: "Enter your destination",
                    description: "Tell us where you need to go - your university, workplace, or any location you commute to regularly.",
                  },
                  {
                    title: "Set your preferences",
                    description: "Choose your max commute time, price range, and the times you typically leave and return.",
                  },
                  {
                    title: "Compare and decide",
                    description: "Browse listings ranked by our value score, which factors in price, space, and commute time.",
                  },
                ].map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{step.title}</h3>
                      <p className="text-slate-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="mt-8 group"
                onClick={() => document.querySelector("input")?.focus()}
              >
                Start searching
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Illustration placeholder */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-white shadow-2xl flex items-center justify-center animate-float">
                      <Search className="h-16 w-16 text-emerald-500" />
                    </div>
                    <p className="text-emerald-700 font-medium">Interactive Map View</p>
                    <p className="text-emerald-600/70 text-sm">with real-time commute data</p>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-8 left-8 w-16 h-16 rounded-xl bg-white/60 shadow-lg flex items-center justify-center">
                  <Clock className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="absolute bottom-8 right-8 w-16 h-16 rounded-xl bg-white/60 shadow-lg flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-teal-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to find your perfect rental?
          </h2>
          <p className="text-emerald-100 text-lg mb-8">
            Start your search now and discover rentals optimized for your commute.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-emerald-700 hover:bg-emerald-50"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Get Started Free
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Car className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white">CommuteFinder</span>
            </div>
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} CommuteFinder. Built for students, by students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
