import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Impressum - SC West Köln Kunstrasen Aktion',
}

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-sc-navy text-white">
      <header className="sticky top-0 z-40 bg-sc-navy/95 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Zurück zur Startseite
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Impressum</h1>

        <div className="prose prose-invert prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-sc-yellow mb-4">Angaben gemäß § 5 TMG</h2>
            <address className="not-italic text-white/80">
              <p className="font-semibold">SC West Köln 1900/11 e.V.</p>
              <p>Apenrader Str. 42</p>
              <p>50825 Köln</p>
              <p className="mt-4">
                <strong>Vereinsregister:</strong> Amtsgericht Köln, VR 4832
              </p>
            </address>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-sc-yellow mb-4">Kontakt</h2>
            <p className="text-white/80">
              <strong>E-Mail:</strong>{' '}
              <a href="mailto:kontakt@sc-west-koeln.de" className="text-sc-yellow hover:underline">
                kontakt@sc-west-koeln.de
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-sc-yellow mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <div className="text-white/80 space-y-3">
              <p>
                <span className="underline">Vertreten durch BGB Vorstand SC West Köln</span>
              </p>
              <ul className="space-y-1">
                <li>Kurt Nürnberg</li>
                <li>Natascha de Palma</li>
                <li>Natascha Lightfoot</li>
              </ul>
              <address className="not-italic">
                Apenrader Str. 42<br />
                50825 Köln
              </address>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-sc-yellow mb-4">Streitschlichtung</h2>
            <p className="text-white/80">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a 
                href="https://ec.europa.eu/consumers/odr/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sc-yellow hover:underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p className="text-white/80 mt-4">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-sc-yellow mb-4">Haftung für Inhalte</h2>
            <p className="text-white/80">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach 
              den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter 
              jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen 
              oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p className="text-white/80 mt-4">
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den 
              allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch 
              erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei 
              Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-sc-yellow mb-4">Haftung für Links</h2>
            <p className="text-white/80">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen 
              Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
              Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der 
              Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche 
              Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
            </p>
            <p className="text-white/80 mt-4">
              Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete 
              Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen 
              werden wir derartige Links umgehend entfernen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-sc-yellow mb-4">Urheberrecht</h2>
            <p className="text-white/80">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
              dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art 
              der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung 
              des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den 
              privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
            <p className="text-white/80 mt-4">
              Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die 
              Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. 
              Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen 
              entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte 
              umgehend entfernen.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-white/40">
            Hauptwebsite:{' '}
            <a 
              href="https://www.sc-west-koeln.de/" 
              target="_blank" 
              className="text-sc-yellow hover:underline"
            >
              www.sc-west-koeln.de
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
