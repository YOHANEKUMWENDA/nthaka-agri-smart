import { motion } from "framer-motion";
import NavHeader from "@/components/NavHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Mail, BookOpen, MessageCircle, Sprout, FlaskConical, MapPin } from "lucide-react";

const faqs = [
  {
    q: "How do I get my soil tested?",
    a: "You can take soil samples to the Chitedze Agricultural Research Station, Bvumbwe Research Station, or any district agricultural office. They can test for NPK, pH, and organic matter. Alternatively, use our Field Assessment mode which estimates values from visual observations."
  },
  {
    q: "What is the Field Assessment mode?",
    a: "Field Assessment is a guided questionnaire that estimates your soil properties based on visual and sensory observations — soil color, texture, smell, and crop history. It's designed for farmers who don't have access to lab testing."
  },
  {
    q: "How accurate are the recommendations?",
    a: "Our crop recommendation model achieves a 99.55% F1-score on the training dataset using Random Forest. However, real-world accuracy depends on the quality of your soil data input. Lab data gives the most accurate recommendations."
  },
  {
    q: "Which crops does NthakaGuide support?",
    a: "We support 22 crops including maize, rice, tobacco, groundnuts, soybeans, cassava, sweet potatoes, tea, coffee, cotton, sugarcane, pigeon peas, cowpeas, sorghum, millet, bananas, mangoes, tomatoes, onions, cabbage, beans, and sunflower."
  },
  {
    q: "How does the rainfall forecast work?",
    a: "We use 30 years of historical rainfall data for all 28 Malawi districts and apply Exponentially Weighted Moving Average (EWMA) to forecast seasonal rainfall. Fertilizer recommendations auto-adjust based on expected rainfall intensity."
  },
  {
    q: "Can I download my results?",
    a: "Yes! After receiving your recommendations, click the 'Download PDF Report' button. The report includes crop recommendations, fertilizer plans, rainfall data, and soil analysis — perfect to share with extension workers or agri-shops."
  },
  {
    q: "Is NthakaGuide free to use?",
    a: "Yes, NthakaGuide is completely free. It was developed as a final year Computer Science project at the University of Malawi to help farmers make data-driven decisions."
  },
];

export default function HelpSupport() {
  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="container max-w-4xl px-4 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="h-7 w-7 text-primary" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Help & Support</h1>
          </div>
          <p className="text-muted-foreground mb-8">Find answers to common questions or reach out for assistance</p>

          {/* Quick Help Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <Card className="border-border">
              <CardContent className="p-5 text-center space-y-2">
                <BookOpen className="h-8 w-8 text-primary mx-auto" />
                <h3 className="font-display font-bold text-foreground">User Guide</h3>
                <p className="text-sm text-muted-foreground">Learn how to use each input mode and interpret your results</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-5 text-center space-y-2">
                <MessageCircle className="h-8 w-8 text-golden mx-auto" />
                <h3 className="font-display font-bold text-foreground">AI Assistant</h3>
                <p className="text-sm text-muted-foreground">Use the chatbot on any page for instant help with soil analysis</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-5 text-center space-y-2">
                <Mail className="h-8 w-8 text-secondary mx-auto" />
                <h3 className="font-display font-bold text-foreground">Contact Us</h3>
                <p className="text-sm text-muted-foreground">Email: nthakaguide@unima.ac.mw for technical support</p>
              </CardContent>
            </Card>
          </div>

          {/* FAQs */}
          <h2 className="font-display text-xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
          <Card className="border-border">
            <CardContent className="p-4 sm:p-6">
              <Accordion type="single" collapsible className="space-y-1">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* How to use guide */}
          <h2 className="font-display text-xl font-bold text-foreground mt-10 mb-4">How to Use NthakaGuide</h2>
          <div className="space-y-4">
            {[
              { step: "1", icon: <MapPin className="h-5 w-5" />, title: "Select Your District", desc: "Choose from all 28 Malawi districts. This loads rainfall data for your area." },
              { step: "2", icon: <FlaskConical className="h-5 w-5" />, title: "Enter Soil Data", desc: "Use Lab Data mode for precise values, Field Assessment for visual estimation, or Mixed mode for a combination." },
              { step: "3", icon: <Sprout className="h-5 w-5" />, title: "Get Recommendations", desc: "Receive crop suitability scores, fertilizer plans adjusted for your district's rainfall, and actionable advice." },
            ].map(s => (
              <Card key={s.step} className="border-border">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                      {s.icon} {s.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
