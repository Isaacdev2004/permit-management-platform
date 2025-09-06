import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Mail, TestTube } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface EmailSubscription {
  id: string;
  email: string;
  name: string;
  city: string;
  workClass: string;
  frequency: string;
  isActive: boolean;
  created_at: string;
  last_sent: string | null;
}

export default function EmailSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<EmailSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<EmailSubscription | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    city: 'All Cities',
    workClass: 'All Types',
    frequency: 'daily'
  });

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getEmailSubscriptions();
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast.error('Failed to load email subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSubscription) {
        await apiClient.updateEmailSubscription(editingSubscription.id, formData);
        toast.success('Email subscription updated successfully');
      } else {
        await apiClient.createEmailSubscription(formData);
        toast.success('Email subscription created successfully');
      }
      
      setIsDialogOpen(false);
      setEditingSubscription(null);
      setFormData({
        email: '',
        name: '',
        city: 'All Cities',
        workClass: 'All Types',
        frequency: 'daily'
      });
      loadSubscriptions();
    } catch (error) {
      console.error('Error saving subscription:', error);
      toast.error('Failed to save email subscription');
    }
  };

  const handleEdit = (subscription: EmailSubscription) => {
    setEditingSubscription(subscription);
    setFormData({
      email: subscription.email,
      name: subscription.name,
      city: subscription.city,
      workClass: subscription.workClass,
      frequency: subscription.frequency
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this email subscription?')) {
      return;
    }

    try {
      await apiClient.deleteEmailSubscription(id);
      toast.success('Email subscription deleted successfully');
      loadSubscriptions();
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast.error('Failed to delete email subscription');
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setSendingTest(true);
      await apiClient.sendTestEmail(testEmail);
      toast.success('Test email sent successfully');
      setTestEmail('');
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  const handleSendReport = async (subscriptionId: string) => {
    try {
      await apiClient.sendEmailReport([subscriptionId]);
      toast.success('Email report sent successfully');
    } catch (error) {
      console.error('Error sending email report:', error);
      toast.error('Failed to send email report');
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'bg-green-100 text-green-800';
      case 'weekly': return 'bg-blue-100 text-blue-800';
      case 'monthly': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage automated email reports for permit data
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingSubscription(null);
              setFormData({
                email: '',
                name: '',
                city: 'All Cities',
                workClass: 'All Types',
                frequency: 'daily'
              });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingSubscription ? 'Edit Subscription' : 'Add Email Subscription'}
              </DialogTitle>
              <DialogDescription>
                {editingSubscription 
                  ? 'Update the email subscription settings.'
                  : 'Create a new email subscription for automated permit reports.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Cities">All Cities</SelectItem>
                    <SelectItem value="Austin">Austin</SelectItem>
                    <SelectItem value="Houston">Houston</SelectItem>
                    <SelectItem value="Dallas">Dallas</SelectItem>
                    <SelectItem value="San Antonio">San Antonio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workClass">Work Class</Label>
                <Select value={formData.workClass} onValueChange={(value) => setFormData({ ...formData, workClass: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Types">All Types</SelectItem>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                    <SelectItem value="Plumbing Service Line">Plumbing Service Line</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSubscription ? 'Update' : 'Create'} Subscription
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Test Email Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Test Email System
          </CardTitle>
          <CardDescription>
            Send a test email to verify the email system is working
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleSendTest} 
              disabled={sendingTest}
              variant="outline"
            >
              {sendingTest ? 'Sending...' : 'Send Test'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Email Subscriptions ({subscriptions.length})</CardTitle>
          <CardDescription>
            Manage automated email reports for permit data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading subscriptions...</div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No email subscriptions found. Create your first subscription to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Work Class</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Sent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">{subscription.name}</TableCell>
                    <TableCell>{subscription.email}</TableCell>
                    <TableCell>{subscription.city}</TableCell>
                    <TableCell>{subscription.workClass}</TableCell>
                    <TableCell>
                      <Badge className={getFrequencyColor(subscription.frequency)}>
                        {subscription.frequency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(subscription.isActive)}>
                        {subscription.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {subscription.last_sent 
                        ? new Date(subscription.last_sent).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(subscription)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendReport(subscription.id)}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(subscription.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
