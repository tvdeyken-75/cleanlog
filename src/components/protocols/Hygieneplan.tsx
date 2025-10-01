
import { HandMetal, GanttChartSquare } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export function Hygieneplan() {
  return (
    <div className="space-y-6 text-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold">LKW bzw. Auflieger</h3>
          <p>Verantwortlich: Fahrer</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">OTTO SPEDITION</p>
          <p>7.1.2</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Reinigungsablauf</CardTitle>
        </CardHeader>
        <CardContent>
            <ol className="list-decimal list-inside space-y-1">
                <li>Entfernung von groben Verschmutzungen (Kehren, Aufheben etc.)</li>
                <li>Vorreinigung mit Wasser 20-60°C bis optische Reinheit vorliegt.</li>
                <li>Einschäumen nach Vorgabe (Tabelle)</li>
                <li>Nachspülen mit Trinkwasser</li>
                <li>Abtrocknung / Lufttrocknung</li>
            </ol>
        </CardContent>
      </Card>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Objekt/Bereich</TableHead>
            <TableHead>R/D</TableHead>
            <TableHead>Häufigkeit</TableHead>
            <TableHead>Produkt</TableHead>
            <TableHead>Konz.</TableHead>
            <TableHead>Mechanik</TableHead>
            <TableHead>Temperatur</TableHead>
            <TableHead>Einwirkzeit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Laderaum, Verdampfer, Gegenstände</TableCell>
            <TableCell><Badge variant="secondary">R/D</Badge></TableCell>
            <TableCell>Täglich, immer bei Wechsel von Non-Food auf Food</TableCell>
            <TableCell>BioTec BTS 3100*</TableCell>
            <TableCell>6%</TableCell>
            <TableCell>einschäumen</TableCell>
            <TableCell>5 - 30 °C</TableCell>
            <TableCell>15 - 20 Minuten</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <p className="text-xs text-muted-foreground">*Materialverträglichkeit: Für alle chlor- und alkalibeständigen Oberflächen in der Lebensmittelindustrie. Nicht geeignet für Zink und Aluminium.</p>
      
      <div className="space-y-2">
        <p className="font-bold">Die Hinweise zur Arbeitssicherheit sind zu beachten. Die erforderliche Schutzausrüstung ist zu tragen.</p>
        <div className="flex gap-2">
            <div className="p-2 border rounded-md bg-blue-100 dark:bg-blue-900"><GanttChartSquare className="h-6 w-6 text-blue-700 dark:text-blue-300" /></div>
            <div className="p-2 border rounded-md bg-blue-100 dark:bg-blue-900"><HandMetal className="h-6 w-6 text-blue-700 dark:text-blue-300" /></div>
        </div>
      </div>
      
      <p className="font-bold text-destructive">Niemals Reinigungs- und Desinfektionsmittel miteinander oder untereinander mischen.</p>
      
      <p>Die Außenreinigung erfolgt am öffentlichen Waschplatz.</p>
    </div>
  );
}
