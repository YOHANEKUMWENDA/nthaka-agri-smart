import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sprout, Leaf, CloudRain, FileText, ChevronRight, FlaskConical, MapPin, Smartphone } from "lucide-react";
import heroImage from "@/assets/hero-farm.jpg";
import logo from "@/assets/logo.jpeg";
import NavHeader from "@/components/NavHeader";

const stats = [
  { value: "99.55%", label: "Crop Model F1-Score", color: "text-primary" },
  { value: "22", label: "Crop Classes", color: "text-accent" },
  { value: "7", label: "Fertilizer Types", color: "text-golden" },
  { value: "28", label: "Malawi Districts", color: "text-secondary" },
];

const features = [
  { icon: "🧪", title: "Three Input Modes", desc: "Lab values, field visual assessment without equipment, or a combination of both. No farmer is left out." },
  { icon: "🌧️", title: "Rainfall Intelligence", desc: "30-year district rainfall data with EWMA seasonal forecasting. Fertilizer plans auto-adjust to your district's expected rainfall." },
  { icon: "🤖", title: "Real Trained Models", desc: "Random Forest crop model (99.55% F1) and fertilizer classifier trained on actual datasets, not rule-based lookups." },
  { icon: "📱", title: "Mobile-First Design", desc: "Works on any phone. Responsive layout from 375px upward. Accessible everywhere." },
  { icon: "📄", title: "Printable Reports", desc: "Generate and print full crop + fertilizer reports for farmers to take to agri-shops or extension offices." },
  { icon: "🔌", title: "Flask API Ready", desc: "Full Python backend included. Connects to Flutter mobile app. All endpoints documented and tested." },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

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
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src={logo} alt="NthakaGuide logo" className="h-12 w-12 rounded-lg shadow-lg" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 mb-6">
              <Sprout className="h-3.5 w-3.5 text-golden" />
              <span className="text-golden font-body text-xs tracking-widest uppercase font-semibold">Smart Soil Analysis for Malawi</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              Smarter Farming{" "}
              <span className="block text-golden">with Soil Intelligence</span>
            </h1>
            <p className="text-primary-foreground/80 text-lg sm:text-xl font-body max-w-xl mx-auto mb-8 leading-relaxed">
              Machine learning crop recommendations and fertilizer predictions tailored to your soil properties and Malawi's rainfall patterns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/recommend">
                <Button size="lg" className="bg-golden text-golden-foreground hover:bg-golden/90 font-semibold text-lg px-8 py-6 shadow-golden">
                  🔬 Start Analysis <ChevronRight className="ml-1 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8 py-6">
                  📊 View Model Results
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-4 -mt-12 relative z-20">
        <div className="container max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(s => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-lg p-4 text-center shadow-sm"
            >
              <p className={`text-2xl sm:text-3xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4">
        <div className="container max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
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
                <span className="text-3xl mb-4 block">{f.icon}</span>
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
            <img src={logo} alt="NthakaGuide" className="h-6 w-6 rounded" />
            <span className="font-display font-semibold text-foreground">NthakaGuide</span>
          </div>
          <p>University of Malawi — Computer Science Final Year Project · COM422</p>
        </div>
      </footer>
    </div>
  );
}
