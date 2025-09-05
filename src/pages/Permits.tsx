import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, FileText } from "lucide-react";
import { downloadCsv } from "@/lib/utils";

const workClassFilters = [
  "Repair", "New", "Remodel", "Change Out", "Addition and Remodel", 
  "Upgrade", "Homebuilder Loop", "Irrigation", "Special Inspections Program",
  "Demolition", "Auxiliary", "Interior Demo Non-Structural", "Fireline", 
  "Wall", "Cut Over/Tank Abandonment", "Temporary Loop", "Shell", 
  "Plumbing Service Line", "Freestanding"
];

const mockPermits = [
  {
    id: "2025-085597 EP",
    type: "Electrical Permit",
    workClass: "Repair",
    issued: "12/07/2025",
    applied: "10/07/2025",
    zip: "78752",
    district: "4",
    sqft: "–", 
    location: "7615 CARVER AVE, AUSTIN, TX, 78752",
    contractor: "TexX Electric, LLC",
    validation: "$6,000"
  },
  {
    id: "2024-101390 EP",
    type: "Electrical Permit", 
    workClass: "New",
    issued: "12/07/2025",
    applied: "21/10/2024",
    zip: "78704",
    district: "3",
    sqft: "468",
    location: "1209 FIELDCREST DR, AUSTIN, TX, 78704",
    contractor: "LED ES Electric",
    validation: "–"
  },
  {
    id: "2025-057123 MP",
    type: "Mechanical Permit",
    workClass: "Remodel", 
    issued: "12/07/2025",
    applied: "14/02/2025",
    zip: "78744",
    district: "2",
    sqft: "89289",
    location: "4500 S PLEASANT VALLEY RD BLDG 3 UNIT 310, AUSTIN, TX, 78744",
    contractor: "2R Mechanical",
    validation: "–"
  }
];

export default function Permits() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const filteredPermits = mockPermits.filter(permit => {
    const matchesSearch = permit.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permit.contractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permit.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilters.length === 0 || 
                         selectedFilters.includes(permit.workClass);
    
    return matchesSearch && matchesFilter;
  });

  const handlePreviewCount = () => {
    alert(`${filteredPermits.length} permits match your filters`);
  };

  const handleViewResults = () => {
    setShowResults(true);
  };

  const handleExportCsv = () => {
    const rows = filteredPermits.map(p => ({
      id: p.id,
      type: p.type,
      workClass: p.workClass,
      issued: p.issued,
      applied: p.applied,
      zip: p.zip,
      district: p.district,
      sqft: p.sqft,
      location: p.location,
      contractor: p.contractor,
      validation: p.validation,
    }));
    downloadCsv(rows, `permits_${Date.now()}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Permit Database</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all permit applications and approvals
          </p>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="text-foreground">WORK CLASS</CardTitle>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search permits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border text-foreground"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {workClassFilters.map((filter) => (
              <Button
                key={filter}
                variant={selectedFilters.includes(filter) ? "default" : "secondary"}
                size="sm"
                onClick={() => toggleFilter(filter)}
                className="text-xs"
              >
                {filter}
              </Button>
            ))}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground" onClick={handlePreviewCount}>
              Preview Count
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground" onClick={handleViewResults}>
              View Results
            </Button>
            <Button variant="outline" size="sm">
              Save Preset
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-foreground font-semibold">PERMIT #</TableHead>
                  <TableHead className="text-foreground font-semibold">TYPE</TableHead>
                  <TableHead className="text-foreground font-semibold">WORK CLASS</TableHead>
                  <TableHead className="text-foreground font-semibold">ISSUED ▲</TableHead>
                  <TableHead className="text-foreground font-semibold">APPLIED</TableHead>
                  <TableHead className="text-foreground font-semibold">ZIP</TableHead>
                  <TableHead className="text-foreground font-semibold">DISTRICT</TableHead>
                  <TableHead className="text-foreground font-semibold">SQ FT</TableHead>
                  <TableHead className="text-foreground font-semibold">LOCATION</TableHead>
                  <TableHead className="text-foreground font-semibold">CONTRACTOR</TableHead>
                  <TableHead className="text-foreground font-semibold">VALIDATION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermits.map((permit) => (
                  <TableRow key={permit.id} className="border-border hover:bg-muted/30">
                    <TableCell className="font-medium text-primary">{permit.id}</TableCell>
                    <TableCell className="text-foreground">{permit.type}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {permit.workClass}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground">{permit.issued}</TableCell>
                    <TableCell className="text-foreground">{permit.applied}</TableCell>
                    <TableCell className="text-foreground">{permit.zip}</TableCell>
                    <TableCell className="text-foreground">{permit.district}</TableCell>
                    <TableCell className="text-foreground">{permit.sqft}</TableCell>
                    <TableCell className="text-sm text-foreground max-w-xs truncate">
                      {permit.location}
                    </TableCell>
                    <TableCell className="text-foreground">{permit.contractor}</TableCell>
                    <TableCell className="text-foreground">{permit.validation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}