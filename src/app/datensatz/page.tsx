import { ImportDropzone } from "@/components/import-dropzone";
import { RecordTable } from "@/components/record-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listRecords } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function DatasetPage() {
  const records = await listRecords();
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Datensatz</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Eine Materialnummer, ein PDF, ein JSON. Das JSON kommt aus deiner bestehenden App und
          wird erst nach der Korrektur zu Gold. Interne Blätter nicht in Git oder Colab legen.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Import</CardTitle>
        </CardHeader>
        <CardContent>
          <ImportDropzone />
        </CardContent>
      </Card>
      <RecordTable records={records} />
    </div>
  );
}
