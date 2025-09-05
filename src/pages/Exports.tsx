import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, File, Calendar, Clock } from "lucide-react";
import { downloadCsv } from "@/lib/utils";

interface ExportRecord {
  id: string;
  filename: string;
  type: string;
  size: string;
  records: number;
  createdAt: string;
  status: "completed" | "processing" | "failed";
}

const mockExports: ExportRecord[] = [
  {
    id: "1",
    filename: "permits_export_2025_01_15.csv",
    type: "CSV",
    size: "2.4 MB",
    records: 1450,
    createdAt: "2025-01-15 10:30:00",
    status: "completed"
  },
  {
    id: "2", 
    filename: "client_data_export.json",
    type: "JSON",
    size: "892 KB",
    records: 324,
    createdAt: "2025-01-14 16:45:00",
    status: "completed"
  }
];

export default function Exports() {
  const [exports, setExports] = useState<ExportRecord[]>(mockExports);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>;
      case "processing":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Processing</Badge>;
      case "failed":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleExport = (type: string) => {
    if (type.toUpperCase() === "CSV") {
      const rows = [
        { id: 1, name: "Lead A", email: "a@example.com" },
        { id: 2, name: "Lead B", email: "b@example.com" },
      ];
      downloadCsv(rows, `leads_${Date.now()}.csv`);
    }
    const newExport: ExportRecord = {
      id: Date.now().toString(),
      filename: `export_${Date.now()}.${type.toLowerCase()}`,
      type: type.toUpperCase(),
      size: "Processing...",
      records: 0,
      createdAt: new Date().toLocaleString(),
      status: "processing"
    };
    
    setExports(prev => [newExport, ...prev]);
    
    setTimeout(() => {
      setExports(prev => prev.map(exp => 
        exp.id === newExport.id 
          ? { ...exp, status: "completed" as const, size: "1.5 MB", records: 850 }
          : exp
      ));
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Export Data</h1>
        <p className="text-muted-foreground mt-2">
          Export your data in various formats and manage previous exports
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Create New Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
              onClick={() => handleExport("CSV")}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
              onClick={() => handleExport("JSON")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button 
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
              onClick={() => handleExport("XLSX")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Export as Google Doc
            </Button>
            <Button 
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
              onClick={() => handleExport("SHEET")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Export as Google Sheet
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Export History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-foreground font-semibold">File</TableHead>
                  <TableHead className="text-foreground font-semibold">Type</TableHead>
                  <TableHead className="text-foreground font-semibold">Size</TableHead>
                  <TableHead className="text-foreground font-semibold">Records</TableHead>
                  <TableHead className="text-foreground font-semibold">Created</TableHead>
                  <TableHead className="text-foreground font-semibold">Status</TableHead>
                  <TableHead className="text-foreground font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exports.map((exportRecord) => (
                  <TableRow key={exportRecord.id} className="border-border hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="truncate max-w-xs">{exportRecord.filename}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{exportRecord.type}</TableCell>
                    <TableCell className="text-foreground">{exportRecord.size}</TableCell>
                    <TableCell className="text-foreground">
                      {exportRecord.records > 0 ? exportRecord.records.toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        {exportRecord.createdAt.split(' ')[0]}
                        <Clock className="w-3 h-3 text-muted-foreground ml-2" />
                        {exportRecord.createdAt.split(' ')[1]}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(exportRecord.status)}</TableCell>
                    <TableCell>
                      {exportRecord.status === "completed" ? (
                        <Button size="sm" variant="outline">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      )}
                    </TableCell>
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