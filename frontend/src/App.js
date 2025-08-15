import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Components
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Textarea } from './components/ui/textarea';
import { Badge } from './components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Calendar } from './components/ui/calendar';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

// Icons
import { 
  Users, 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Building, 
  MapPin,
  BarChart3,
  Clock,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
const API = `${BACKEND_URL}/api`;

// Client Form Component
const ClientForm = ({ client, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    phone: client?.phone || '',
    email: client?.email || '',
    business_name: client?.business_name || '',
    business_description: client?.business_description || '',
    address: client?.address || '',
    pitch_status: client?.pitch_status || 'Pending'
  });

  const statusOptions = [
    'Pending',
    'To Be Pitched', 
    'Cancelled',
    'Closed/Won',
    'Lost'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-gray-300 font-medium text-sm uppercase tracking-wider">Full Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-blue-500/20 border-0 text-white placeholder:text-gray-500 h-12 px-4 rounded-xl focus:bg-blue-500/30 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
              placeholder="Enter client's full name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-gray-300 font-medium text-sm uppercase tracking-wider">Phone Number *</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="bg-blue-500/20 border-0 text-white placeholder:text-gray-500 h-12 px-4 rounded-xl focus:bg-blue-500/30 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
              placeholder="e.g., 123-456-7890"
              required
            />
          </div>
        </div>
        
        <div className="mt-6 space-y-2">
          <Label className="text-gray-300 font-medium text-sm uppercase tracking-wider">Email Address *</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="bg-blue-500/20 border-0 text-white placeholder:text-gray-500 h-12 px-4 rounded-xl focus:bg-blue-500/30 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            placeholder="e.g., client@company.com"
            required
          />
        </div>

        <div className="mt-6 space-y-2">
          <Label className="text-gray-300 font-medium text-sm uppercase tracking-wider">Business Name *</Label>
          <Input
            value={formData.business_name}
            onChange={(e) => setFormData({...formData, business_name: e.target.value})}
            className="bg-green-500/20 border-0 text-white placeholder:text-gray-500 h-12 px-4 rounded-xl focus:bg-green-500/30 focus:ring-2 focus:ring-green-500/50 transition-all duration-300"
            placeholder="Enter company/business name"
            required
          />
        </div>

        <div className="mt-6 space-y-2">
          <Label className="text-gray-300 font-medium text-sm uppercase tracking-wider">Pitch Status *</Label>
          <Select value={formData.pitch_status} onValueChange={(value) => setFormData({...formData, pitch_status: value})}>
            <SelectTrigger className="bg-green-500/20 border-0 text-white placeholder:text-gray-500 h-12 px-4 rounded-xl focus:bg-green-500/30 focus:ring-2 focus:ring-green-500/50 transition-all duration-300">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800/95 backdrop-blur-xl border-green-400/20 rounded-xl">
              {statusOptions.map(status => (
                <SelectItem key={status} value={status} className="text-white hover:bg-green-500/20 rounded-lg transition-colors">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 space-y-2">
          <Label className="text-gray-300 font-medium text-sm uppercase tracking-wider">Business Description</Label>
          <Textarea
            value={formData.business_description}
            onChange={(e) => setFormData({...formData, business_description: e.target.value})}
            className="bg-green-500/20 border-0 text-white placeholder:text-gray-500 p-4 rounded-xl focus:bg-green-500/30 focus:ring-2 focus:ring-green-500/50 transition-all duration-300 resize-none"
            rows={3}
            placeholder="Brief description of the business, services offered, industry, etc."
          />
        </div>

        <div className="mt-6 space-y-2">
          <Label className="text-gray-300 font-medium text-sm uppercase tracking-wider">Business Address</Label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="bg-purple-500/20 border-0 text-white placeholder:text-gray-500 h-12 px-4 rounded-xl focus:bg-purple-500/30 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
            placeholder="Street address, city, state, zip code"
          />
        </div>

        <div className="pt-6">
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 text-lg rounded-2xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl shadow-xl"
          >
            {client ? 'Update Client' : 'Add New Client'}
          </Button>
        </div>
      </div>
    </form>
  );
};

// Meeting Form Component
const MeetingForm = ({ clients, onSubmit }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    date: '',
    time: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-gray-300 font-medium text-sm uppercase tracking-wider">Client *</Label>
            <Select value={formData.client_id} onValueChange={(value) => setFormData({...formData, client_id: value})}>
              <SelectTrigger className="bg-purple-500/20 border-0 text-white placeholder:text-gray-500 h-12 px-4 rounded-xl focus:bg-purple-500/30 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/95 backdrop-blur-xl border-purple-400/20 rounded-xl">
                {clients.map(client => (
                  <SelectItem key={client._id || client.id} value={client._id || client.id} className="text-white hover:bg-purple-500/20 rounded-lg transition-colors">
                    {client.name} - {client.business_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-gray-300 font-medium text-sm uppercase tracking-wider">Meeting Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="bg-purple-500/20 border-0 text-white placeholder:text-gray-500 h-12 px-4 rounded-xl focus:bg-purple-500/30 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
              placeholder="e.g., Initial consultation"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-2">
            <Label className="text-gray-300 font-medium text-sm uppercase tracking-wider">Date *</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="bg-purple-500/20 border-0 text-white placeholder:text-gray-500 h-12 px-4 rounded-xl focus:bg-purple-500/30 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-gray-300 font-medium text-sm uppercase tracking-wider">Time *</Label>
            <Input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              className="bg-purple-500/20 border-0 text-white placeholder:text-gray-500 h-12 px-4 rounded-xl focus:bg-purple-500/30 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
              required
            />
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <Label className="text-gray-300 font-medium text-sm uppercase tracking-wider">Agenda & Notes</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className="bg-purple-500/20 border-0 text-white placeholder:text-gray-500 p-4 rounded-xl focus:bg-purple-500/30 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 resize-none"
            rows={4}
            placeholder="Meeting agenda, discussion points, objectives, or any additional notes..."
          />
        </div>

        <div className="pt-6">
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-pink-700 text-white font-bold py-4 text-lg rounded-2xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl shadow-xl"
          >
            Schedule Meeting
          </Button>
        </div>
      </div>
    </form>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [clients, setClients] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const statusOptions = [
    'Pending',
    'To Be Pitched', 
    'Cancelled',
    'Closed/Won',
    'Lost'
  ];

  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'To Be Pitched': 'bg-blue-100 text-blue-800 border-blue-200',
    'Cancelled': 'bg-gray-100 text-gray-800 border-gray-200',
    'Closed/Won': 'bg-green-100 text-green-800 border-green-200',
    'Lost': 'bg-red-100 text-red-800 border-red-200'
  };

  // Calculate stats
  const getStats = () => {
    const totalClients = clients.length;
    const pendingClients = clients.filter(c => c.pitch_status === 'Pending').length;
    const closedClients = clients.filter(c => c.pitch_status === 'Closed/Won').length;
    const upcomingMeetings = meetings.filter(m => new Date(m.date) > new Date()).length;
    
    return { totalClients, pendingClients, closedClients, upcomingMeetings };
  };

  const stats = getStats();

  // Fetch data
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await axios.get(`${API}/clients?${params}`);
      if (response.data.clients) {
        setClients(response.data.clients);
      } else {
        setClients(response.data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  const fetchMeetings = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/meetings`);
      if (response.data.meetings) {
        setMeetings(response.data.meetings);
      } else {
        setMeetings(response.data);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  }, []);

  useEffect(() => {
    fetchClients();
    fetchMeetings();
  }, [fetchClients, fetchMeetings]);

  // Client operations
  const handleAddClient = async (formData) => {
    try {
      await axios.post(`${API}/clients`, formData);
      toast.success('Client added successfully');
      fetchClients();
      setIsAddClientOpen(false);
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Failed to add client');
    }
  };

  const handleUpdateClient = async (clientId, formData) => {
    try {
      await axios.put(`${API}/clients/${clientId}`, formData);
      toast.success('Client updated successfully');
      fetchClients();
      setEditingClient(null);
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await axios.delete(`${API}/clients/${clientId}`);
        toast.success('Client deleted successfully');
        fetchClients();
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error('Failed to delete client');
      }
    }
  };

  // Meeting operations
  const handleAddMeeting = async (formData) => {
    try {
      await axios.post(`${API}/meetings`, formData);
      toast.success('Meeting scheduled successfully');
      fetchMeetings();
      setIsAddMeetingOpen(false);
    } catch (error) {
      console.error('Error adding meeting:', error);
      toast.error('Failed to schedule meeting');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-black/20 backdrop-blur-xl border-r border-white/10">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-8">SalesForge CRM</h1>
            
            <nav className="space-y-2">
              <Button
                variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                className={`w-full justify-start text-left ${
                  activeTab === 'dashboard' 
                    ? 'bg-white/10 text-white hover:bg-white/20' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setActiveTab('dashboard')}
              >
                <BarChart3 className="mr-3 h-4 w-4" />
                Dashboard
              </Button>
              
              <Button
                variant={activeTab === 'clients' ? 'default' : 'ghost'}
                className={`w-full justify-start text-left ${
                  activeTab === 'clients' 
                    ? 'bg-white/10 text-white hover:bg-white/20' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setActiveTab('clients')}
              >
                <Users className="mr-3 h-4 w-4" />
                Clients
              </Button>
              
              <Button
                variant={activeTab === 'meetings' ? 'default' : 'ghost'}
                className={`w-full justify-start text-left ${
                  activeTab === 'meetings' 
                    ? 'bg-white/10 text-white hover:bg-white/20' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setActiveTab('meetings')}
              >
                <CalendarIcon className="mr-3 h-4 w-4" />
                Meetings
              </Button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Total Clients</p>
                        <p className="text-3xl font-bold text-white mt-1">{stats.totalClients}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center group-hover:bg-blue-600/30 transition-all duration-300">
                        <Users className="h-6 w-6 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Pending Clients</p>
                        <p className="text-3xl font-bold text-white mt-1">{stats.pendingClients}</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-600/20 rounded-2xl flex items-center justify-center group-hover:bg-yellow-600/30 transition-all duration-300">
                        <AlertCircle className="h-6 w-6 text-yellow-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Closed/Won</p>
                        <p className="text-3xl font-bold text-white mt-1">{stats.closedClients}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-600/20 rounded-2xl flex items-center justify-center group-hover:bg-green-600/30 transition-all duration-300">
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Upcoming Meetings</p>
                        <p className="text-3xl font-bold text-white mt-1">{stats.upcomingMeetings}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center group-hover:bg-purple-600/30 transition-all duration-300">
                        <Clock className="h-6 w-6 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === 'clients' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Clients</h2>
                <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Client
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-0 text-white max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                    <DialogHeader className="pb-6 border-b border-white/10">
                      <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Add New Client
                      </DialogTitle>
                      <DialogDescription className="text-gray-300 text-lg mt-2">
                        Enter the client's information to add them to your CRM.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                      <ClientForm onSubmit={handleAddClient} />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Search and Filter */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search clients by name, email, or business..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-blue-500/10 border-blue-400/20 text-white"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 bg-purple-500/10 border-purple-400/20 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800/95 backdrop-blur-xl border-slate-700">
                    <SelectItem value="all" className="text-white hover:bg-blue-500/10">All Statuses</SelectItem>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status} className="text-white hover:bg-blue-500/10">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clients Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg">Loading clients...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clients.map(client => (
                    <Card key={client._id || client.id} className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300 group">
                      <CardHeader className="border-b border-slate-700/50">
                        <CardTitle className="text-white text-lg">{client.name}</CardTitle>
                        <CardDescription className="text-gray-400">{client.business_name}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                       <div className="space-y-2">
                         <div className="flex items-center text-gray-300 text-sm">
                           <Phone className="mr-2 h-4 w-4" />
                           {client.phone}
                         </div>
                         <div className="flex items-center text-gray-300 text-sm">
                           <Mail className="mr-2 h-4 w-4" />
                           {client.email}
                         </div>
                         <div className="flex items-center text-gray-300 text-sm">
                           <MapPin className="mr-2 h-4 w-4" />
                           {client.address}
                         </div>
                       </div>
                       
                       <div className="flex items-center justify-between">
                         <Badge className={`${statusColors[client.pitch_status]} text-xs`}>
                           {client.pitch_status}
                         </Badge>
                         
                         <div className="flex space-x-2">
                           <Button
                             size="sm"
                             variant="ghost"
                             className="text-gray-400 hover:text-white hover:bg-slate-700/50"
                             onClick={() => setSelectedClient(client)}
                           >
                             <Eye className="h-4 w-4" />
                           </Button>
                           <Button
                             size="sm"
                             variant="ghost"
                             className="text-gray-400 hover:text-white hover:bg-slate-700/50"
                             onClick={() => setEditingClient(client)}
                           >
                             <Edit className="h-4 w-4" />
                           </Button>
                           <Button
                             size="sm"
                             variant="ghost"
                             className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                             onClick={() => handleDeleteClient(client._id || client.id)}
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 ))}
               </div>
             )}

             {/* Empty State */}
             {!loading && clients.length === 0 && (
               <div className="text-center py-12">
                 <div className="text-gray-400 text-lg">No clients found</div>
                 <div className="text-gray-500 mt-2">Start by adding your first client</div>
               </div>
             )}
           </div>
         )}

         {/* Meetings Tab */}
         {activeTab === 'meetings' && (
           <div>
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-3xl font-bold text-white">Meetings</h2>
               <Dialog open={isAddMeetingOpen} onOpenChange={setIsAddMeetingOpen}>
                 <DialogTrigger asChild>
                   <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                     <Plus className="mr-2 h-4 w-4" />
                     Schedule Meeting
                   </Button>
                 </DialogTrigger>
                 <DialogContent className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-0 text-white max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                   <DialogHeader className="pb-6 border-b border-white/10">
                     <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                       Schedule New Meeting
                     </DialogTitle>
                     <DialogDescription className="text-gray-300 text-lg mt-2">
                       Schedule a meeting with a client.
                     </DialogDescription>
                   </DialogHeader>
                   <div className="py-6">
                     <MeetingForm clients={clients} onSubmit={handleAddMeeting} />
                   </div>
                 </DialogContent>
               </Dialog>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Calendar */}
               <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                 <CardHeader className="border-b border-slate-700/50">
                   <CardTitle className="text-white">Calendar</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6">
                   <Calendar
                     mode="single"
                     selected={selectedDate}
                     onSelect={setSelectedDate}
                     className="text-white"
                   />
                 </CardContent>
               </Card>

               {/* Meetings List */}
               <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                 <CardHeader className="border-b border-slate-700/50">
                   <CardTitle className="text-white">Upcoming Meetings</CardTitle>
                 </CardHeader>
                 <CardContent className="p-4">
                   <div className="space-y-3">
                     {meetings.slice(0, 10).map(meeting => {
                       const client = clients.find(c => (c._id || c.id) === meeting.client_id);
                       return (
                         <div key={meeting._id || meeting.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:bg-slate-700/50 transition-colors">
                          <div>
                            <div className="text-white font-medium">{meeting.title}</div>
                            <div className="text-gray-400 text-sm">
                              {format(new Date(meeting.date), 'MMM dd, yyyy')} at {meeting.time}
                            </div>
                            {client && (
                              <div className="text-gray-500 text-sm">with {client.name}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Edit Client Dialog */}
      {editingClient && (
        <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
          <DialogContent className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-0 text-white max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <DialogHeader className="pb-6 border-b border-white/10">
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Edit Client
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-lg mt-2">
                Update the client's information.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <ClientForm 
                client={editingClient} 
                onSubmit={(data) => handleUpdateClient(editingClient._id || editingClient.id, data)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Client Detail Dialog */}
      {selectedClient && (
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-0 text-white max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <DialogHeader className="pb-6 border-b border-white/10">
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Client Details
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-lg mt-2">
                Complete information about {selectedClient.name}
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-400" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300 text-sm uppercase tracking-wider">Full Name</Label>
                        <p className="text-white font-medium">{selectedClient.name}</p>
                      </div>
                      <div>
                        <Label className="text-gray-300 text-sm uppercase tracking-wider">Phone Number</Label>
                        <p className="text-white font-medium">{selectedClient.phone}</p>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-gray-300 text-sm uppercase tracking-wider">Email Address</Label>
                        <p className="text-white font-medium">{selectedClient.email}</p>
                      </div>
                    </div>
                  </div>

                {/* Business Information */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Building className="w-5 h-5 mr-2 text-green-400" />
                      Business Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300 text-sm uppercase tracking-wider">Business Name</Label>
                        <p className="text-white font-medium">{selectedClient.business_name}</p>
                      </div>
                      <div>
                        <Label className="text-gray-300 text-sm uppercase tracking-wider">Pitch Status</Label>
                        <Badge className={`${statusColors[selectedClient.pitch_status]} text-xs`}>
                          {selectedClient.pitch_status}
                        </Badge>
                      </div>
                      {selectedClient.business_description && (
                        <div className="md:col-span-2">
                          <Label className="text-gray-300 text-sm uppercase tracking-wider">Business Description</Label>
                          <p className="text-white font-medium">{selectedClient.business_description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                {/* Additional Information */}
                {selectedClient.address && (
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-purple-400" />
                      Additional Information
                    </h3>
                    <div>
                      <Label className="text-gray-300 text-sm uppercase tracking-wider">Business Address</Label>
                      <p className="text-white font-medium">{selectedClient.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Toaster />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
