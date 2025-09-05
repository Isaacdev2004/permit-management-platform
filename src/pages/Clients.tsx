import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface Client {
  id: number;
  company: string;
  email: string;
  industry: string;
  automations: number;
  created_at: string;
  updated_at: string;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    company: "",
    email: "",
    industry: ""
  });
  const [loading, setLoading] = useState(false);

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getClients();
      setClients(response.data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      company: client.company,
      email: client.email,
      industry: client.industry
    });
    setIsEditDialogOpen(true);
  };

  const handleView = (client: Client) => {
    setEditingClient(client);
    setIsViewDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingClient) {
        await apiClient.updateClient(editingClient.id.toString(), formData);
        toast.success('Client updated successfully');
      } else {
        await apiClient.createClient(formData);
        toast.success('Client created successfully');
      }
      loadClients(); // Reload clients
      setIsEditDialogOpen(false);
      setEditingClient(null);
      setFormData({ company: "", email: "", industry: "" });
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error('Failed to save client');
    }
  };

  const handleDelete = async (clientId: number) => {
    try {
      await apiClient.deleteClient(clientId.toString());
      toast.success('Client deleted successfully');
      loadClients(); // Reload clients
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage client information and relationships
          </p>
        </div>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
              onClick={() => {
                setEditingClient(null);
                setFormData({ company: "", email: "", industry: "" });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? "Edit Client" : "Add New Client"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="company" className="text-foreground">Company Name</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="bg-input border-border text-foreground mt-1"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-foreground">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-input border-border text-foreground mt-1"
                  placeholder="Enter contact email"
                />
              </div>
              <div>
                <Label htmlFor="industry" className="text-foreground">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  className="bg-input border-border text-foreground mt-1"
                  placeholder="Enter industry"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => setIsEditDialogOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle>Client Details</DialogTitle>
            </DialogHeader>
            {editingClient && (
              <div className="space-y-2 text-sm">
                <div><span className="text-muted-foreground">Company:</span> {editingClient.company}</div>
                <div><span className="text-muted-foreground">Email:</span> {editingClient.email}</div>
                <div><span className="text-muted-foreground">Industry:</span> {editingClient.industry}</div>
                <div><span className="text-muted-foreground">Automations:</span> {editingClient.automations}</div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-foreground">Client Database</CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border text-foreground"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-foreground font-semibold">Company</TableHead>
                  <TableHead className="text-foreground font-semibold">Email</TableHead>
                  <TableHead className="text-foreground font-semibold">Industry</TableHead>
                  <TableHead className="text-foreground font-semibold">Automations</TableHead>
                  <TableHead className="text-foreground font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading clients...
                    </TableCell>
                  </TableRow>
                ) : filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No clients found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id} className="border-border hover:bg-muted/30">
                      <TableCell className="font-medium text-foreground">
                        {client.company}
                      </TableCell>
                      <TableCell className="text-foreground">{client.email}</TableCell>
                      <TableCell className="text-foreground">{client.industry}</TableCell>
                      <TableCell className="text-foreground">{client.automations}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleView(client)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleEdit(client)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(client.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
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