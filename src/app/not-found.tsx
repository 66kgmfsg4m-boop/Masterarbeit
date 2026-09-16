import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold">Datensatz nicht gefunden</h2>
      <p className="text-sm text-muted-foreground">
        Die Materialnummer gibt es in diesem lokalen Bestand nicht.
      </p>
      <Link className="underline" href="/datensatz">
        Zurück zum Datensatz
      </Link>
    </div>
  );
}
