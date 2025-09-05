import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, Edit, Trash2, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Automation {
  id: string;
  name: string;
  client: string;
  frequency: string;
  permitType: string;
  workClass: string;
  distributionType: string;
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
  distributionSplit: string;
}

const mockAutomations: Automation[] = [
  {
    id: "1",
    name: "Abhishek",
    client: "aaa",
    frequency: "Once",
    permitType: "Any",
    workClass: "Any",
    distributionType: "Round Robin",
    isActive: true,
    distributionSplit: "26%",
    lastRun: "2025-01-14 15:30:00",
    nextRun: "2025-01-15 09:00:00"
  }
];

export default function Automations() {
  const [automations, setAutomations] = useState<Automation[]>(mockAutomations);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<Automation | null>(null);
  const [form, setForm] = useState({
    name: "",
    client: "",
    frequency: "Once",
    permitType: "Any",
    workClass: "Any",
    distributionType: "Round Robin",
    distributionSplit: "50%",
  });

  const handleToggleActive = (automationId: string) => {
    setAutomations(prev => prev.map(automation => 
      automation.id === automationId 
        ? { ...automation, isActive: !automation.isActive }
        : automation
    ));
  };

  const handleCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      client: "",
      frequency: "Once",
      permitType: "Any",
      workClass: "Any",
      distributionType: "Round Robin",
      distributionSplit: "50%",
    });
    setIsEditOpen(true);
  };

  const handleEdit = (a: Automation) => {
    setEditing(a);
    setForm({
      name: a.name,
      client: a.client,
      frequency: a.frequency,
      permitType: a.permitType,
      workClass: a.workClass,
      distributionType: a.distributionType,
      distributionSplit: a.distributionSplit,
    });
    setIsEditOpen(true);
  };

  const handleSave = () => {
    if (editing) {
      setAutomations(prev => prev.map(a => a.id === editing.id ? { ...editing, ...form } as Automation : a));
    } else {
      const newItem: Automation = {
        id: Date.now().toString(),
        ...form,
        isActive: true,
      } as Automation;
      setAutomations(prev => [newItem, ...prev]);
    }
    setIsEditOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setAutomations(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Automations</h1>
          <p className="text-muted-foreground mt-2">
            Manage automated workflows and lead distribution
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground" onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          New Automation
        </Button>
      </div>

      <div className="space-y-4">
        {automations.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="text-center py-12">
              <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Automations</h3>
              <p className="text-muted-foreground mb-4">
                Create your first automation to start distributing leads automatically
              </p>
              <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Create Automation
              </Button>
            </CardContent>
          </Card>
        ) : (
          automations.map((automation) => (
            <Card key={automation.id} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-semibold text-foreground">
                      {automation.name}
                    </h3>
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      {automation.client}
                    </Badge>
                    <Badge 
                      variant={automation.isActive ? "default" : "secondary"}
                      className={automation.isActive ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
                    >
                      {automation.isActive ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={automation.isActive}
                      onCheckedChange={() => handleToggleActive(automation.id)}
                    />
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(automation)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(automation.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Schedule</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Frequency:</span>
                        <span className="text-foreground">{automation.frequency}</span>
                      </div>
                      {automation.lastRun && (
                        <div className="text-muted-foreground">
                          Last run: {automation.lastRun}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Filtering Rules</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Permit Type:</span>
                        <span className="text-foreground ml-2">{automation.permitType}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Work Class:</span>
                        <span className="text-foreground ml-2">{automation.workClass}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Distribution</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="text-foreground ml-2">{automation.distributionType}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Split:</span>
                        <span className="text-foreground ml-2">{automation.distributionSplit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Automation" : "Create Automation"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} />
            <Input placeholder="Client" value={form.client} onChange={(e) => setForm(prev => ({ ...prev, client: e.target.value }))} />
            <Input placeholder="Frequency" value={form.frequency} onChange={(e) => setForm(prev => ({ ...prev, frequency: e.target.value }))} />
            <Input placeholder="Permit Type" value={form.permitType} onChange={(e) => setForm(prev => ({ ...prev, permitType: e.target.value }))} />
            <Input placeholder="Work Class" value={form.workClass} onChange={(e) => setForm(prev => ({ ...prev, workClass: e.target.value }))} />
            <Input placeholder="Distribution Type" value={form.distributionType} onChange={(e) => setForm(prev => ({ ...prev, distributionType: e.target.value }))} />
            <Input placeholder="Distribution Split" value={form.distributionSplit} onChange={(e) => setForm(prev => ({ ...prev, distributionSplit: e.target.value }))} />
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground" onClick={handleSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}