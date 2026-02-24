import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sprout, Leaf, CloudRain, FileText, ChevronRight, FlaskConical, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-farm.jpg";

const features = [
  { icon: Sprout, title: "Crop Recommendations", desc: "Get the best crops for your soil conditions across 15+ Malawi-relevant crops." },
  { icon: FlaskConical, title: "Fertilizer Plans", desc: "Precise fertilizer type, rate, and timing recommendations tailored to your soil." },
  { icon: CloudRain, title: "Rainfall Forecasting", desc: "District-level rainfall predictions using EWMA for all 28 Malawi districts." },
  { icon: FileText, title: "PDF Reports", desc: "Download professional recommendation reports to share with extension workers." },
  { icon: MapPin, title: "All 28 Districts", desc: "Localized data and recommendations for every district in Malawi." },
  { icon: Leaf, title: "No Sensors Needed", desc: "Works with manual soil data entry — no IoT devices required." },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <img
          src={heroImage}
          alt="Malawian farmland with maize crops and Lake Malawi"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sprout className="h-8 w-8 text-golden" />
              <span className="text-golden font-body text-sm tracking-widest uppercase font-semibold">NthakaGuide</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              Smart Farming Decisions{" "}
              <span className="block text-golden">for Malawi</span>
            </h1>
            <p className="text-primary-foreground/80 text-lg sm:text-xl font-body max-w-xl mx-auto mb-8 leading-relaxed">
              A machine learning–based crop and fertilizer recommendation system for farmers and agricultural organizations across all 28 districts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/recommend">
                <Button size="lg" className="bg-golden text-golden-foreground hover:bg-golden/90 font-semibold text-lg px-8 py-6 shadow-golden">
                  Start Analysis <ChevronRight className="ml-1 h-5 w-5" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8 py-6">
                  Learn More
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="container max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How NthakaGuide Helps
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Empowering Malawian farmers with data-driven agricultural decisions — no expensive sensors required.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-lg bg-card border border-border hover:shadow-golden transition-all duration-300 group"
              >
                <f.icon className="h-8 w-8 text-primary mb-4 group-hover:text-golden transition-colors" />
                <h3 className="font-display font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-earth-gradient">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-earth-foreground mb-4">
            Ready to Optimize Your Farm?
          </h2>
          <p className="text-earth-foreground/80 mb-8 text-lg">
            Enter your soil data and get personalized crop and fertilizer recommendations in seconds.
          </p>
          <Link to="/recommend">
            <Button size="lg" className="bg-golden text-golden-foreground hover:bg-golden/90 font-semibold text-lg px-10 py-6 shadow-golden">
              Get Started <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border bg-card">
        <div className="container max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sprout className="h-4 w-4 text-primary" />
            <span className="font-display font-semibold text-foreground">NthakaGuide</span>
          </div>
          <p>University of Malawi — Computer Science Final Year Project</p>
        </div>
      </footer>
    </div>
  );
}
