"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DatasheetRecord } from "@/lib/types";

function statusBadge(record: DatasheetRecord) {
  if (record.goldStatus === "reviewed") {
    return <Badge className="bg-emerald-700 text-white hover:bg-emerald-700">geprüft</Badge>;
  }
  return <Badge variant="secondary">Entwurf</Badge>;
}

export function RecordTable({ records }: { records: DatasheetRecord[] }) {
  const router = useRouter();

  async function split() {
    const response = await fetch("/api/records", { method: "POST" });
    if (!response.ok) {
      toast.error("Split fehlgeschlagen");
      return;
    }
    toast.success("Train / Val / Test neu verteilt (nach Baugruppe, 65/15/20)");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm(`${id} löschen?`)) return;
    await fetch(`/api/records/${id}`, { method: "DELETE" });
    toast.success("Gelöscht");
    router.refresh();
  }

  if (records.length === 0) {
    return (
      <p className="rounded-xl border bg-white px-4 py-8 text-center text-sm text-muted-foreground">
        Noch keine Datensätze. Importiere PDF+JSON mit derselben Materialnummer.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{records.length} Datensätze</p>
        <Button variant="outline" size="sm" onClick={() => void split()}>
          Split erzeugen
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Materialnummer</TableHead>
              <TableHead>Schema</TableHead>
              <TableHead>Gold</TableHead>
              <TableHead>Split</TableHead>
              <TableHead>PDF</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-mono text-sm">
                  <Link className="underline-offset-2 hover:underline" href={`/datensatz/${record.id}`}>
                    {record.partNumber}
                  </Link>
                </TableCell>
                <TableCell>{record.schemaId}</TableCell>
                <TableCell>{statusBadge(record)}</TableCell>
                <TableCell>{record.split ?? "—"}</TableCell>
                <TableCell>{record.hasPdf ? "ja" : "nein"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => void remove(record.id)}>
                    Löschen
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
