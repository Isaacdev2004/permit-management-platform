import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter } from "lucide-react";

interface FilterPreset {
  id: string;
  name: string;
  filterBy: string;
  permitType: string;
  workClass: string;
  contractorCategory: string;
}

const mockPresets: FilterPreset[] = [
  {
    id: "1",
    name: "test1",
    filterBy: "Contractor Category",
    permitType: "Electrical",
    workClass: "Plumbing Service Line",
    contractorCategory: "Driveway"
  }
];

export default function Presets() {
  const [presets, setPresets] = useState<FilterPreset[]>(mockPresets);
  const [searchTerm, setSearchTerm] = useState("");
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // load/save presets to localStorage
  useState(() => {
    const saved = localStorage.getItem("filter_presets");
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch {}
    }
  });

  const persist = (next: FilterPreset[]) => {
    setPresets(next);
    localStorage.setItem("filter_presets", JSON.stringify(next));
  };

  const handleApply = (id: string) => {
    setActivePresetId(id);
    alert("Preset applied. You can navigate to Permits to use it.");
  };

  const handleSave = (preset: FilterPreset) => {
    const renamed = { ...preset, name: preset.name + " (saved)" };
    const next = presets.map(p => (p.id === preset.id ? renamed : p));
    persist(next);
  };

  const handleCancel = () => {
    setActivePresetId(null);
  };

  const handleDelete = (id: string) => {
    persist(presets.filter(p => p.id !== id));
  };

  const filteredPresets = presets.filter(preset =>
    preset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Saved Filter Presets</h1>
          <p className="text-muted-foreground mt-2">
            Manage your saved filter configurations for quick access
          </p>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-foreground">Filter Presets</CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search presets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border text-foreground"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPresets.length === 0 ? (
              <div className="text-center py-8">
                <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No filter presets found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Create your first preset to get started
                </p>
              </div>
            ) : (
              filteredPresets.map((preset) => (
                <Card key={preset.id} className="bg-muted/20 border-border">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {preset.name}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Filter by: <span className="text-foreground font-medium">{preset.filterBy}</span>
                          </span>
                          {preset.permitType && (
                            <span className="text-muted-foreground">
                              Permit Type: <span className="text-foreground font-medium">{preset.permitType}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground" onClick={() => handleApply(preset.id)}>
                          Apply & Close
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleSave(preset)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>
                          Cancel
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(preset.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}