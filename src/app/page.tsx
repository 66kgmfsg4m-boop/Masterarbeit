import Link from "next/link";
import { ExtractButtons } from "@/components/extract-buttons";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listRecords } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const records = await listRecords();
  const reviewed = records.filter((record) => record.goldStatus === "reviewed").length;
  const withPdf = records.filter((record) => record.hasPdf).length;
  const schemas = new Set(records.map((record) => record.schemaId)).size;
  const hasSplit = records.some((record) => record.split);

  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-3">
        <p className="text-sm font-medium text-emerald-800">Lokal · kein Colab · Materialschema</p>
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-[oklch(0.22_0.03_210)]">
          Datenblätter prüfen, GPT-5 vergleichen, Open Source anlernen
        </h2>
        <p className="text-base leading-7 text-muted-foreground">
          Lege PDF und JSON unter derselben Materialnummer ab. Das JSON aus deiner App ist der
          Vorschlag, nach der Korrektur das Gold. Danach misst du feldweise gegen den lokalen
          Parser, optional Ollama oder Azure — und exportierst JSONL für LoRA on-premise.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Datensätze" value={String(records.length)} hint="Ziel: ca. 100, geprüft" />
        <Stat label="Gold geprüft" value={`${reviewed}/${records.length || 0}`} hint="Testset extra gegenlesen" />
        <Stat label="mit PDF" value={String(withPdf)} hint="braucht der lokale Parser" />
        <Stat label="Baugruppen" value={String(schemas)} hint="lieber wenige Schemas, mehr Exemplare" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nächster Schritt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6">
          {!records.length ? (
            <p>
              Es liegen noch keine Daten. Unter Datensatz PDF+JSON importieren oder die
              Beispieldatensätze per <code>npm run seed</code> laden.
            </p>
          ) : !hasSplit ? (
            <p>
              {records.length} Datensätze sind da. Als Nächstes auf Datensatz den Split erzeugen,
              dann die Testblätter gegen das PDF prüfen.
            </p>
          ) : (
            <p>
              Split liegt. Lokalen Parser auf allen Blättern laufen lassen, dann Auswertung öffnen.
              Azure/Ollama nur, wenn der Endpoint intern erlaubt ist.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Link href="/datensatz" className={buttonVariants()}>
              Zum Datensatz
            </Link>
            <Link href="/vergleich" className={buttonVariants({ variant: "outline" })}>
              Vergleich
            </Link>
            <Link href="/auswertung" className={buttonVariants({ variant: "outline" })}>
              Auswertung
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Extraktoren jetzt ausführen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Der lokale Parser braucht kein GPU-Training. Er liest Tabellenzeilen und Einheiten aus
            dem PDF-Text — Baseline neben GPT-5. Ollama/Azure nur on-prem bzw. über den
            freigegebenen Firmenweg.
          </p>
          <ExtractButtons />
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">App-JSON = GPT-5-Export</Badge>
            <Badge variant="secondary">Gold = korrigiert</Badge>
            <Badge variant="secondary">intern speichern</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 font-heading text-2xl font-semibold">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
