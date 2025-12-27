import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Datenschutzerklärung - SC West Köln Kunstrasen Aktion',
}

export default function DatenschutzPage() {
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
        <h1 className="text-3xl font-bold mb-8">Datenschutzerklärung</h1>

        <div className="prose prose-invert prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-sc-yellow mb-4">1. Datenschutz auf einen Blick</h2>
            
            <h3 className="text-lg font-medium mt-6 mb-3">Allgemeine Hinweise</h3>
            <p className="text-white/80">
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen 
              Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit 
              denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema 
              Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.
            </p>

            <h3 className="text-lg font-medium mt-6 mb-3">Datenerfassung auf dieser Website</h3>
            <p className="text-white/80">
              <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen 
              Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
            </p>
            <p className="text-white/80 mt-4">
              <strong>Wie erfassen wir Ihre Daten?</strong><br />
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann 
              es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben (Name, E-Mail-Adresse, 
              Anschrift bei der Parzellen-Reservierung).
            </p>
            <p className="text-white/80 mt-4">
              Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch 
              unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, 
              Betriebssystem oder Uhrzeit des Seitenaufrufs).
            </p>
            <p className="text-white/80 mt-4">
              <strong>Wofür nutzen wir Ihre Daten?</strong><br />
              Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu 
              gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden. 
              Bei der Parzellen-Reservierung werden Ihre Daten zur Abwicklung des Kaufvorgangs und zur 
              Kontaktaufnahme verwendet.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-sc-yellow mb-4">2. Verantwortliche Stelle</h2>
            <p className="text-white/80">
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
            </p>
            <address className="not-italic text-white/80 mt-4">
              <p className="font-semibold">SC West Köln 1900/11 e.V.</p>
              <p>Apenrader Str. 42</p>
              <p>50825 Köln</p>
              <p className="mt-2">
                E-Mail:{' '}
                <a href="mailto:kontakt@sc-west-koeln.de" className="text-sc-yellow hover:underline">
                  kontakt@sc-west-koeln.de
                </a>
              </p>
            </address>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-sc-yellow mb-4">3. Erhebung und Speicherung personenbezogener Daten</h2>
            
            <h3 className="text-lg font-medium mt-6 mb-3">Bei der Parzellen-Reservierung</h3>
            <p className="text-white/80">
              Bei der Reservierung von Parzellen erheben wir folgende Daten:
            </p>
            <ul className="list-disc list-inside text-white/80 mt-2 space-y-1">
              <li>Vollständiger Name</li>
              <li>E-Mail-Adresse</li>
              <li>Anschrift (Straße, PLZ, Ort)</li>
              <li>Ausgewählte Parzellen</li>
              <li>Zeitpunkt der Reservierung</li>
            </ul>
            <p className="text-white/80 mt-4">
              Diese Daten werden für die Abwicklung des Kaufvorgangs, die Zusendung der Zahlungsinformationen 
              und die Zuordnung der erworbenen Parzellen benötigt. Die Rechtsgrundlage hierfür ist Art. 6 
              Abs. 1 lit. b DSGVO (Vertragserfüllung).
            </p>

            <h3 className="text-lg font-medium mt-6 mb-3">Server-Log-Dateien</h3>
            <p className="text-white/80">
              Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten 
              Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
            </p>
            <ul className="list-disc list-inside text-white/80 mt-2 space-y-1">
              <li>Browsertyp und Browserversion</li>
              <li>verwendetes Betriebssystem</li>
              <li>Referrer URL</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
              <li>IP-Adresse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-sc-yellow mb-4">4. E-Mail-Versand</h2>
            <p className="text-white/80">
              Für den Versand von E-Mails (Reservierungsbestätigungen, Zahlungsinformationen) nutzen wir 
              den Dienst Mailjet. Dabei werden Ihre E-Mail-Adresse und Ihr Name an Mailjet übermittelt. 
              Mailjet ist ein Dienst der Mailgun Technologies, Inc. mit Sitz in den USA. Die Datenübertragung 
              in die USA erfolgt auf Grundlage von Standardvertragsklauseln der EU-Kommission.
            </p>
            <p className="text-white/80 mt-4">
              Weitere Informationen finden Sie in der Datenschutzerklärung von Mailjet:{' '}
              <a 
                href="https://www.mailjet.com/legal/privacy-policy/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sc-yellow hover:underline"
              >
                https://www.mailjet.com/legal/privacy-policy/
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-sc-yellow mb-4">5. Datenspeicherung</h2>
            <p className="text-white/80">
              Die Reservierungsdaten werden auf Servern von Vercel (Vercel Inc., USA) gespeichert. 
              Die Datenübertragung in die USA erfolgt auf Grundlage von Standardvertragsklauseln der 
              EU-Kommission.
            </p>
            <p className="text-white/80 mt-4">
              Weitere Informationen finden Sie in der Datenschutzerklärung von Vercel:{' '}
              <a 
                href="https://vercel.com/legal/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sc-yellow hover:underline"
              >
                https://vercel.com/legal/privacy-policy
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-sc-yellow mb-4">6. Ihre Rechte</h2>
            <p className="text-white/80">
              Sie haben jederzeit das Recht auf:
            </p>
            <ul className="list-disc list-inside text-white/80 mt-2 space-y-1">
              <li>Auskunft über Ihre bei uns gespeicherten personenbezogenen Daten</li>
              <li>Berichtigung unrichtiger Daten</li>
              <li>Löschung Ihrer Daten</li>
              <li>Einschränkung der Verarbeitung</li>
              <li>Datenübertragbarkeit</li>
              <li>Widerspruch gegen die Verarbeitung</li>
            </ul>
            <p className="text-white/80 mt-4">
              Wenn Sie der Meinung sind, dass die Verarbeitung Ihrer Daten gegen das Datenschutzrecht 
              verstößt, haben Sie das Recht, sich bei einer Aufsichtsbehörde zu beschweren.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-sc-yellow mb-4">7. Aufbewahrungsdauer</h2>
            <p className="text-white/80">
              Ihre Reservierungsdaten werden für die Dauer der Geschäftsbeziehung und darüber hinaus 
              gemäß den gesetzlichen Aufbewahrungspflichten (in der Regel 6-10 Jahre) gespeichert. 
              Nach Ablauf dieser Fristen werden die Daten gelöscht, sofern keine anderen Rechtsgrundlagen 
              für die weitere Speicherung bestehen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-sc-yellow mb-4">8. Kontakt zum Datenschutz</h2>
            <p className="text-white/80">
              Bei Fragen zum Datenschutz wenden Sie sich bitte an:
            </p>
            <address className="not-italic text-white/80 mt-4">
              <p>SC West Köln 1900/11 e.V.</p>
              <p>Apenrader Str. 42</p>
              <p>50825 Köln</p>
              <p>
                E-Mail:{' '}
                <a href="mailto:kontakt@sc-west-koeln.de" className="text-sc-yellow hover:underline">
                  kontakt@sc-west-koeln.de
                </a>
              </p>
            </address>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-white/40">
            Stand: {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
          </p>
          <p className="text-sm text-white/40 mt-2">
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

