import { SettingsForm } from "@/components/settings-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await readSettings();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Einstellungen</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Keys liegen in <code>data/settings.json</code> auf diesem Rechner, nicht im Repository.
        </p>
      </div>
      <Alert>
        <AlertTitle>Keine internen PDFs in die Public Cloud</AlertTitle>
        <AlertDescription>
          Azure nur über den bereits freigegebenen Firmen-Tenant. Ollama nur lokal oder im R&S-Netz.
          Google Colab ist für eure Datenblätter ungeeignet.
        </AlertDescription>
      </Alert>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Endpunkte</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm
            initial={{
              ...settings,
              azureApiKey: settings.azureApiKey ? "••••••••" : "",
              hasAzureKey: Boolean(settings.azureApiKey),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
