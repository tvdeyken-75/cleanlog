import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PlanungPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline">Tourenplanung</h1>
      <Card>
        <CardHeader>
          <CardTitle>Planung</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Hier können Sie Touren planen.</p>
        </CardContent>
      </Card>
    </div>
  );
}
