import { useState, useEffect } from "react";
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
import { Search, Filter, Download, FileText, RefreshCw } from "lucide-react";
import { downloadCsv } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

const CITIES = ["Austin, TX", "Houston, TX", "Dallas, TX", "San Antonio, TX"];

const workClassFilters = [
  "Repair", "New", "Remodel", "Change Out", "Addition and Remodel", 
  "Upgrade", "Homebuilder Loop", "Irrigation", "Special Inspections Program",
  "Demolition", "Auxiliary", "Interior Demo Non-Structural", "Fireline", 
  "Wall", "Cut Over/Tank Abandonment", "Temporary Loop", "Shell", 
  "Plumbing Service Line", "Freestanding"
];

interface Permit {
  id: number;
  permit_id: string;
  city: string;
  permit_type: string;
  work_class: string;
  issued_date: string;
  applied_date: string;
  zip_code: string;
  district: string;
  sqft: string;
  location: string;
  contractor: string;
  validation_amount: string;
  scraped_at: string;
}

export default function Permits() {
  const [permits, setPermits] = useState<Permit[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Austin, TX");

  // Load permits on component mount
  useEffect(() => {
    loadPermits();
  }, []);

  const loadPermits = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getPermits({
        city: selectedCity,
        workClass: selectedFilters.length > 0 ? selectedFilters.join(',') : undefined,
        search: searchTerm || undefined,
        limit: 100
      });
      setPermits(response.data || []);
    } catch (error) {
      console.error('Error loading permits:', error);
      toast.error('Failed to load permits');
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Reload permits when filters change
  useEffect(() => {
    loadPermits();
  }, [selectedFilters, searchTerm, selectedCity]);

  const handlePreviewCount = () => {
    toast.info(`${permits.length} permits match your filters`);
  };

  const handleViewResults = () => {
    setShowResults(true);
  };

  const handleExportCsv = async () => {
    try {
      await apiClient.exportPermits({
        workClass: selectedFilters.length > 0 ? selectedFilters[0] : undefined,
        search: searchTerm || undefined
      });
      toast.success('Permits exported successfully');
    } catch (error) {
      console.error('Error exporting permits:', error);
      toast.error('Failed to export permits');
    }
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
            <div className="flex gap-2">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="pl-4 pr-8 py-2 bg-input border border-border rounded-md text-foreground"
              >
                {CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Loading permits...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : permits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      No permits found. Try scraping Austin, TX data first.
                    </TableCell>
                  </TableRow>
                ) : (
                  permits.map((permit) => (
                    <TableRow key={permit.id} className="border-border hover:bg-muted/30">
                      <TableCell className="font-medium text-primary">{permit.permit_id}</TableCell>
                      <TableCell className="text-foreground">{permit.permit_type}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          {permit.work_class}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground">{permit.issued_date}</TableCell>
                      <TableCell className="text-foreground">{permit.applied_date}</TableCell>
                      <TableCell className="text-foreground">{permit.zip_code}</TableCell>
                      <TableCell className="text-foreground">{permit.district}</TableCell>
                      <TableCell className="text-foreground">{permit.sqft}</TableCell>
                      <TableCell className="text-sm text-foreground max-w-xs truncate">
                        {permit.location}
                      </TableCell>
                      <TableCell className="text-foreground">{permit.contractor}</TableCell>
                      <TableCell className="text-foreground">{permit.validation_amount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}