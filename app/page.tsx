"use client";

import Link from "next/link";
import { SoccerField } from "@/components/soccer-field";
import { ShoppingCart } from "@/components/shopping-cart";
import { ParcelProvider } from "@/lib/parcel-context";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatEuro } from "@/lib/utils";
import { FIELD_CONFIG } from "@/lib/parcels";

function Header() {
  return (
    <header className="sticky top-0 z-40 bg-sc-navy/95 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="https://www.sc-west-koeln.de/"
          target="_blank"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-sc-yellow rounded-full flex items-center justify-center">
            <span className="font-bold text-sc-navy text-sm">SCW</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">SC West Köln</h1>
            <p className="text-xs text-white/60">1900/11 e.V.</p>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#feld"
            className="text-sm hover:text-sc-yellow transition-colors"
          >
            Spielfeld
          </a>
          <a
            href="#preise"
            className="text-sm hover:text-sc-yellow transition-colors"
          >
            Preise
          </a>
          <a
            href="#faq"
            className="text-sm hover:text-sc-yellow transition-colors"
          >
            FAQ
          </a>
        </nav>
        <a href="#feld">
          <Button className="bg-sc-yellow text-sc-navy hover:bg-sc-yellow/90 font-semibold">
            Jetzt mitmachen
          </Button>
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sc-navy via-sc-navy to-[#1a472a]/50" />
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.03) 50px, rgba(255,255,255,0.03) 51px),
                           repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(255,255,255,0.03) 50px, rgba(255,255,255,0.03) 51px)`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="mb-6 bg-sc-yellow/20 text-sc-yellow border-sc-yellow/30">
            Kunstrasen Aktion 2025
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Werde Teil von
            <br />
            <span className="text-sc-yellow">SC West Köln</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/70 mb-4 font-light">
            Tradition. Veedel. Verein.
          </p>
          <p className="text-lg text-white/60 mb-8 max-w-xl mx-auto">
            Sichere dir dein eigenes Stück Kunstrasen und unterstütze deinen
            Verein beim Ausbau unserer Spielstätte in Köln-Neu-Ehrenfeld.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#feld">
              <Button
                size="lg"
                className="bg-sc-yellow text-sc-navy hover:bg-sc-yellow/90 font-semibold text-lg px-8"
              >
                Parzelle auswählen
              </Button>
            </a>
            <a href="#faq">
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 hover:bg-white/10 text-lg"
              >
                Mehr erfahren
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function PriceSection() {
  const prices = [
    {
      name: "Tor-Parzelle",
      price: FIELD_CONFIG.PRICES.goal,
      description: "5 Parzellen pro Tor",
      highlight: true,
    },
    {
      name: "Elfmeterpunkt",
      price: FIELD_CONFIG.PRICES.penalty,
      description: "2 verfügbar",
      highlight: true,
    },
    {
      name: "Anstoßpunkt",
      price: FIELD_CONFIG.PRICES.kickoff,
      description: "Einzigartig",
      highlight: true,
    },
    {
      name: "Feld-Parzelle",
      price: FIELD_CONFIG.PRICES.field,
      description: "3.000 verfügbar",
      highlight: false,
    },
  ];

  return (
    <section id="preise" className="py-16 bg-sc-navy">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Preisübersicht</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {prices.map((item) => (
            <div
              key={item.name}
              className={`p-6 rounded-xl text-center transition-transform hover:scale-105 ${
                item.highlight
                  ? "bg-gradient-to-br from-sc-yellow/20 to-sc-yellow/5 border border-sc-yellow/30"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              <p className="text-2xl md:text-3xl font-bold text-sc-yellow mb-2">
                {formatEuro(item.price)}
              </p>
              <p className="font-medium mb-1">{item.name}</p>
              <p className="text-sm text-white/50">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FieldSection() {
  return (
    <section
      id="feld"
      className="py-16 bg-gradient-to-b from-[#1a472a]/50 to-sc-navy"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Wähle deine Parzellen</h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Klicke auf das Spielfeld, um Parzellen auszuwählen. Zoome hinein für
            Details.
            <span className="hidden md:inline">
              {" "}
              Halte Shift + Mausklick gedrückt, um zu verschieben.
            </span>
          </p>
        </div>
        <div className="max-w-5xl mx-auto">
          <SoccerField />
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    {
      question: "Wie funktioniert die Zahlung?",
      answer: `Nach der Reservierung erhalten Sie eine E-Mail mit allen Zahlungsinformationen. Der Betrag ist per Banküberweisung zu zahlen. Bitte verwenden Sie unbedingt den in der E-Mail angegebenen Verwendungszweck, damit wir Ihre Zahlung zuordnen können.`,
    },
    {
      question: "Welche Bankverbindung gilt für die Überweisung?",
      answer: `Die Bankverbindung finden Sie in Ihrer Bestätigungs-E-Mail. Empfänger: SC West Köln 1900/11 e.V. Bitte geben Sie als Verwendungszweck Ihre Reservierungsnummer an.`,
    },
    {
      question: "Was passiert nach der Zahlung?",
      answer: `Sobald wir den Zahlungseingang bestätigt haben, werden Ihre Parzellen als verkauft markiert und Sie erhalten eine finale Bestätigung. Die Parzellen sind dann dauerhaft Ihnen zugeordnet.`,
    },
    {
      question: "Wie lange ist meine Reservierung gültig?",
      answer: `Ihre Reservierung ist 14 Tage gültig. Sollte innerhalb dieser Zeit keine Zahlung eingehen, werden die Parzellen wieder freigegeben und können von anderen Unterstützern erworben werden.`,
    },
    {
      question: "Kann ich meine Reservierung stornieren?",
      answer: `Ja, eine Stornierung ist möglich, solange noch keine Zahlung erfolgt ist. Kontaktieren Sie uns dazu bitte per E-Mail an kontakt@sc-west-koeln.de.`,
    },
    {
      question: "Erhalte ich eine Spendenquittung?",
      answer: `Da es sich um einen Kauf und keine Spende handelt, kann leider keine Spendenquittung ausgestellt werden. Sie unterstützen den Verein jedoch direkt beim Ausbau der Spielstätte.`,
    },
    {
      question: "Wer ist der Ansprechpartner bei Fragen?",
      answer: `Bei Fragen wenden Sie sich bitte an kontakt@sc-west-koeln.de oder besuchen Sie uns im Vereinsheim in der Apenrader Str. 42, 50825 Köln.`,
    },
  ];

  return (
    <section id="faq" className="py-16 bg-sc-navy">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Häufige Fragen</h2>
        <div className="max-w-2xl mx-auto">
          <Accordion className="space-y-4 border-0">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                className="bg-white/5 border border-white/10 rounded-lg px-6 overflow-hidden"
              >
                <AccordionTrigger className="text-left hover:text-sc-yellow py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/70 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-sc-navy border-t border-white/10 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-sc-yellow rounded-full flex items-center justify-center">
                <span className="font-bold text-sc-navy text-sm">SCW</span>
              </div>
              <div>
                <h3 className="font-bold">SC West Köln</h3>
                <p className="text-xs text-white/60">1900/11 e.V.</p>
              </div>
            </div>
            <p className="text-sm text-white/60">
              Tradition. Veedel. Verein.
              <br />
              Seit 1900 im Kölner Westen.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Kontakt</h3>
            <address className="text-sm text-white/60 not-italic space-y-1">
              <p>Apenrader Str. 42</p>
              <p>50825 Köln</p>
              <p>
                <a
                  href="mailto:kontakt@sc-west-koeln.de"
                  className="hover:text-sc-yellow transition-colors"
                >
                  kontakt@sc-west-koeln.de
                </a>
              </p>
            </address>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Links</h3>
            <nav className="space-y-2 text-sm">
              <Link
                href="https://www.sc-west-koeln.de/"
                target="_blank"
                className="block text-white/60 hover:text-sc-yellow transition-colors"
              >
                Vereinswebsite
              </Link>
              <Link
                href="/impressum"
                className="block text-white/60 hover:text-sc-yellow transition-colors"
              >
                Impressum
              </Link>
              <Link
                href="/datenschutz"
                className="block text-white/60 hover:text-sc-yellow transition-colors"
              >
                Datenschutz
              </Link>
            </nav>
          </div>
        </div>

        <Separator className="bg-white/10 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>
            © {new Date().getFullYear()} SC West Köln 1900/11 e.V. Alle Rechte
            vorbehalten.
          </p>
          <p>
            <a
              href="https://www.sc-west-koeln.de/"
              target="_blank"
              className="hover:text-sc-yellow transition-colors"
            >
              www.sc-west-koeln.de
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <ParcelProvider>
      <div className="min-h-screen bg-sc-navy text-white">
        <Header />
        <main>
          <Hero />
          <PriceSection />
          <FieldSection />
          <FAQSection />
        </main>
        <Footer />
        <ShoppingCart />
      </div>
    </ParcelProvider>
  );
}
