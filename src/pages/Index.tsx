import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Zap, Download } from "lucide-react";

const Index = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's what's happening with your permits today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Permits"
          value="1000"
          icon={FileText}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Clients"
          value="1"
          icon={Users}
          trend={{ value: 3, isPositive: true }}
        />
        <StatCard
          title="Automations"
          value="1"
          icon={Zap}
        />
        <StatCard
          title="Exports Today"
          value="5"
          icon={Download}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Permits Issued Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center border border-border rounded-lg bg-muted/20">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">Chart Placeholder</div>
              <p className="text-muted-foreground">Permits analytics visualization will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
