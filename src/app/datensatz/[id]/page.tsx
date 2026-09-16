import Link from "next/link";
import { notFound } from "next/navigation";
import { ExtractButtons } from "@/components/extract-buttons";
import { GoldEditor } from "@/components/gold-editor";
import { SideBySide } from "@/components/side-by-side";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecord } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function RecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let record;
  try {
    record = await getRecord(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/datensatz" className="hover:underline">
              Datensatz
            </Link>{" "}
            / {record.partNumber}
          </p>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">{record.partNumber}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline">{record.schemaId}</Badge>
            <Badge variant="outline">{record.split ?? "kein Split"}</Badge>
            <Badge variant={record.goldStatus === "reviewed" ? "default" : "secondary"}>
              {record.goldStatus === "reviewed" ? "Gold geprüft" : "Entwurf"}
            </Badge>
          </div>
        </div>
        {record.hasPdf ? (
          <a
            href={`/api/records/${record.id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            PDF öffnen
          </a>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gold gegen App-JSON</CardTitle>
          </CardHeader>
          <CardContent>
            <GoldEditor record={record} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">PDF-Text (Modelleingabe)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Das ist kein Stammdatenfeld. Der Parser und jedes LLM lesen diesen Text statt der
              PDF-Binärdatei.
            </p>
            <pre className="max-h-[640px] overflow-auto rounded-lg bg-muted/60 p-3 text-xs leading-5 whitespace-pre-wrap">
              {record.text || "Noch kein Text. PDF importieren."}
            </pre>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <ExtractButtons ids={[record.id]} />
        <SideBySide record={record} />
      </div>
    </div>
  );
}
