import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Auth
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Landing Page
import Landing from './pages/Landing';

// UI
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Calendar } from './components/ui/calendar';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Badge } from './components/ui/badge';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { Textarea } from './components/ui/textarea';
import { Progress } from './components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import ChatBot from './components/chatbot/ChatBot.jsx';
// Charts
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend, CategoryScale, LinearScale, BarElement, Title as ChartTitle } from 'chart.js';

// Icons
import { Users, Calendar as CalendarIcon, Plus, Search, CheckCircle, AlertCircle, Clock, Eye, Edit, Trash2, Mail, Phone, Download, Briefcase, LogOut } from 'lucide-react';
import * as XLSX from 'xlsx';

import { format, subMonths, startOfMonth, eachMonthOfInterval } from 'date-fns';

ChartJS.register(ArcElement, ChartTooltip, ChartLegend, CategoryScale, LinearScale, BarElement, ChartTitle);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL;

function Dashboard() {
  const { logout } = useAuth();
  const [clients, setClients] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    business_name: '',
    business_description: '',
    address: '',
    pitch_status: 'Pending'
  });

  // Optimized form handlers to prevent typing lag
  const handleNewClientChange = useCallback((field, value) => {
    setNewClient(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEditClientChange = useCallback((field, value) => {
    setEditClient(prev => prev ? { ...prev, [field]: value } : null);
  }, []);

  const handleNewLeadChange = useCallback((field, value) => {
    setNewLead(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEditLeadChange = useCallback((field, value) => {
    setEditLead(prev => prev ? { ...prev, [field]: value } : null);
  }, []);

  // Optimized form reset functions
  const resetNewClientForm = useCallback(() => {
    setNewClient({
      name: '',
      phone: '',
      email: '',
      business_name: '',
      business_description: '',
      address: '',
      pitch_status: 'Pending'
    });
  }, []);

  const resetNewLeadForm = useCallback(() => {
    setNewLead({
      fullName: '',
      email: '',
      phone: '',
      company: '',
      source: 'website',
      status: 'new',
      priority: 'medium',
      notes: '',
      estimated_value: '',
      currency: 'USD'
    });
  }, []);
  const [isViewClientOpen, setIsViewClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [editClient, setEditClient] = useState(null);
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ client_id: '', title: '', date: '', time: '', notes: '' });
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [isViewMeetingOpen, setIsViewMeetingOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isEditMeetingOpen, setIsEditMeetingOpen] = useState(false);
  const [editMeeting, setEditMeeting] = useState({ client_id: '', title: '', date: '', time: '', notes: '' });
  const [projects, setProjects] = useState([]);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    client_id: '',
    description: '',
    start_date: '',
    due_date: '',
    assigned_to: '',
    status: 'Not Started',
    priority: 'Medium',
    progress: '',
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('all');
  const projectStatusOptions = ['Not Started','In Progress','On Hold','Completed'];
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);
  const [viewingProject, setViewingProject] = useState(null);

  // Leads state
  const [leads, setLeads] = useState([]);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    source: 'website',
    status: 'new',
    priority: 'medium',
    notes: '',
    estimated_value: '',
    currency: 'USD'
  });
  const [isViewLeadOpen, setIsViewLeadOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isEditLeadOpen, setIsEditLeadOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [editLead, setEditLead] = useState(null);
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [leadSourceFilter, setLeadSourceFilter] = useState('all');
  const [leadPriorityFilter, setLeadPriorityFilter] = useState('all');
  const [isImportLeadsOpen, setIsImportLeadsOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  // Memoized status options and colors for better performance
  const statusOptions = useMemo(() => ['Pending', 'To Be Pitched', 'Cancelled', 'Closed/Won', 'Lost'], []);
  const statusColors = useMemo(() => ({
    Pending: 'bg-yellow-100 text-yellow-800',
    'To Be Pitched': 'bg-blue-100 text-blue-800',
    Cancelled: 'bg-gray-100 text-gray-800',
    'Closed/Won': 'bg-green-100 text-green-800',
    Lost: 'bg-red-100 text-red-800'
  }), []);

  const projectStatusNumberText = useMemo(() => ({
    'Not Started': 'text-gray-300',
    'In Progress': 'text-sky-300',
    'On Hold': 'text-amber-300',
    'Completed': 'text-emerald-300',
  }), []);

  const projectStatusColors = useMemo(() => ({
    'Not Started': 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-sky-100 text-sky-800',
    'On Hold': 'bg-amber-100 text-amber-800',
    'Completed': 'bg-emerald-100 text-emerald-800',
  }), []);

  // Memoized lead options and colors for better performance
  const leadStatusOptions = useMemo(() => ['new', 'contacted', 'in_progress', 'qualified', 'proposal', 'converted', 'dropped'], []);
  const leadSourceOptions = useMemo(() => ['website', 'referral', 'facebook', 'linkedin', 'whatsapp', 'marketing', 'cold_call', 'trade_show', 'other'], []);
  const leadPriorityOptions = useMemo(() => ['low', 'medium', 'high'], []);
  
  const leadStatusColors = useMemo(() => ({
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-purple-100 text-purple-800',
    qualified: 'bg-indigo-100 text-indigo-800',
    proposal: 'bg-orange-100 text-orange-800',
    converted: 'bg-green-100 text-green-800',
    dropped: 'bg-red-100 text-red-800'
  }), []);
  
  const leadStatusNumberText = useMemo(() => ({
    new: 'text-blue-300',
    contacted: 'text-yellow-300',
    in_progress: 'text-purple-300',
    qualified: 'text-indigo-300',
    proposal: 'text-orange-300',
    converted: 'text-green-300',
    dropped: 'text-red-300'
  }), []);
  
  const leadSourceColors = useMemo(() => ({
    website: 'bg-sky-100 text-sky-800',
    referral: 'bg-emerald-100 text-emerald-800',
    facebook: 'bg-blue-100 text-blue-800',
    linkedin: 'bg-indigo-100 text-indigo-800',
    whatsapp: 'bg-green-100 text-green-800',
    marketing: 'bg-purple-100 text-purple-800',
    cold_call: 'bg-gray-100 text-gray-800',
    trade_show: 'bg-amber-100 text-amber-800',
    other: 'bg-slate-100 text-slate-800'
  }), []);
  
  const leadPriorityColors = useMemo(() => ({
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  }), []);

  const projectStatusCounts = useMemo(() => {
    const counts = { 'Not Started': 0, 'In Progress': 0, 'On Hold': 0, 'Completed': 0 };
    (projects || []).forEach((p) => { if (counts[p.status] !== undefined) counts[p.status] += 1; });
    return counts;
  }, [projects]);

  const stats = useMemo(() => {
    const totalClients = clients.length;
    const totalProjects = projects.length;
    const totalLeads = leads.length;
    const lostClients = clients.filter(c => c.pitch_status === 'Lost').length;
    const upcomingMeetings = meetings.filter(m => new Date(m.date) > new Date()).length;
    return { totalClients, totalProjects, totalLeads, lostClients, upcomingMeetings };
  }, [clients, projects, leads, meetings]);

  const statusCounts = useMemo(() => {
    const counts = {
      Pending: 0,
      'To Be Pitched': 0,
      Cancelled: 0,
      'Closed/Won': 0,
      Lost: 0,
    };
    (clients || []).forEach((c) => {
      if (counts[c.pitch_status] !== undefined) counts[c.pitch_status] += 1;
    });
    return counts;
  }, [clients]);

  const leadStatusCounts = useMemo(() => {
    const counts = { new: 0, contacted: 0, in_progress: 0, qualified: 0, proposal: 0, converted: 0, dropped: 0 };
    (leads || []).forEach((l) => { if (counts[l.status] !== undefined) counts[l.status] += 1; });
    return counts;
  }, [leads]);

  const statusNumberText = useMemo(() => ({
    Pending: 'text-amber-300',
    'To Be Pitched': 'text-sky-300',
    Cancelled: 'text-gray-300',
    'Closed/Won': 'text-emerald-300',
    Lost: 'text-rose-300',
  }), []);

  const handleExportClients = () => {
    // Group by status in desired order
    const order = ['Closed/Won', 'Pending', 'To Be Pitched', 'Cancelled', 'Lost'];
    const grouped = order.flatMap((status) => {
      return (clients || [])
        .filter((c) => c.pitch_status === status)
        .map((c) => ({
          Status: status,
          Name: c.name || '',
          Email: c.email || '',
          Phone: c.phone || '',
          Business: c.business_name || '',
          Address: c.address || '',
          Description: c.business_description || '',
          CreatedAt: c.createdAt ? new Date(c.createdAt).toLocaleString() : '',
        }));
    });

    const ws = XLSX.utils.json_to_sheet(grouped);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');
    XLSX.writeFile(wb, `clients-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleExportProjects = () => {
    const grouped = (projects || []).map((p) => ({
      Name: p.name || '',
      ClientName: p.client_id?.name || '',
      ClientBusiness: p.client_id?.business_name || '',
      Status: p.status || '',
      Priority: p.priority || '',
      AssignedTo: p.assigned_to || '',
      Progress: typeof p.progress === 'number' ? p.progress : '',
      StartDate: p.start_date ? new Date(p.start_date).toLocaleDateString() : '',
      DueDate: p.due_date ? new Date(p.due_date).toLocaleDateString() : '',
      Description: p.description || '',
      CreatedAt: p.createdAt ? new Date(p.createdAt).toLocaleString() : '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(grouped);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects');
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects_export.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('Projects exported to Excel');
  };

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      const response = await axios.get(`${API}/clients?${params}`);
      setClients(response.data.clients || response.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  const fetchMeetings = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/meetings`);
      setMeetings(response.data.meetings || response.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch meetings');
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data.projects || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch projects');
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (leadSearch) params.append('search', leadSearch);
      if (leadStatusFilter && leadStatusFilter !== 'all') params.append('status', leadStatusFilter);
      if (leadSourceFilter && leadSourceFilter !== 'all') params.append('source', leadSourceFilter);
      if (leadPriorityFilter && leadPriorityFilter !== 'all') params.append('priority', leadPriorityFilter);
      
      const response = await axios.get(`${API}/leads?${params}`);
      setLeads(response.data.leads || response.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch leads');
    }
  }, [leadSearch, leadStatusFilter, leadSourceFilter, leadPriorityFilter]);

  useEffect(() => {
    fetchClients();
    fetchMeetings();
    fetchProjects();
    fetchLeads();
  }, [fetchClients, fetchMeetings, fetchProjects, fetchLeads]);

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Delete this client?')) return;
    try {
      await axios.delete(`${API}/clients/${clientId}`);
      toast.success('Client deleted');
      fetchClients();
    } catch (err) {
      console.error(err);
      toast.error('Delete failed');
    }
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    if (!editingClient || !editClient) return;
    const id = editingClient._id || editingClient.id;
    try {
      const payload = {
        ...editClient,
        name: (editClient.name || '').trim(),
        phone: (editClient.phone || '').trim(),
        email: (editClient.email || '').trim(),
        business_name: (editClient.business_name || '').trim(),
        business_description: (editClient.business_description || '').trim(),
        address: (editClient.address || '').trim(),
        pitch_status: (editClient.pitch_status || 'Pending'),
      };
      if (!payload.email) delete payload.email;
      await axios.put(`${API}/clients/${id}`, payload);
      toast.success('Client updated');
      setIsEditClientOpen(false);
      setEditingClient(null);
      setEditClient(null);
      fetchClients();
    } catch (err) {
      console.error(err);
      const firstValidationMessage = Array.isArray(err?.response?.data?.details) && err.response.data.details.length > 0
        ? err.response.data.details[0]?.msg
        : null;
      const message = firstValidationMessage || err?.response?.data?.error || err?.response?.data?.message || 'Failed to update client';
      toast.error(message);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newClient,
        name: (newClient.name || '').trim(),
        phone: (newClient.phone || '').trim(),
        email: (newClient.email || '').trim(),
        business_name: (newClient.business_name || '').trim(),
        business_description: (newClient.business_description || '').trim(),
        address: (newClient.address || '').trim(),
      };
      if (!payload.email) delete payload.email;
      await axios.post(`${API}/clients`, payload);
      toast.success('Client added');
      setIsAddClientOpen(false);
      resetNewClientForm();
      fetchClients();
    } catch (err) {
      console.error(err);
      const firstValidationMessage = Array.isArray(err?.response?.data?.details) && err.response.data.details.length > 0
        ? err.response.data.details[0]?.msg
        : null;
      const message = firstValidationMessage || err?.response?.data?.error || err?.response?.data?.message || 'Failed to add client';
      toast.error(message);
    }
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    try {
      const { client_id, title, date, time } = newMeeting;
      if (!client_id || !title || !date || !time) {
        toast.error('Please fill in client, title, date and time');
        return;
      }
      const [yy, mm, dd] = date.split('-').map((v) => parseInt(v, 10));
      const [hh, min] = time.split(':').map((v) => parseInt(v, 10));
      const localDateTime = new Date(yy, (mm || 1) - 1, dd || 1, hh || 0, min || 0, 0);
      const payload = { ...newMeeting, date: localDateTime.toISOString() };
      await axios.post(`${API}/meetings`, payload);
      toast.success('Meeting scheduled');
      setIsAddMeetingOpen(false);
      setNewMeeting({ client_id: '', title: '', date: '', time: '', notes: '' });
      fetchMeetings();
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to schedule meeting';
      toast.error(message);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!meetingId) return;
    if (!window.confirm('Delete this meeting?')) return;
    try {
      await axios.delete(`${API}/meetings/${meetingId}`);
      toast.success('Meeting deleted');
      fetchMeetings();
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.error || 'Failed to delete meeting';
      toast.error(message);
    }
  };

  const handleUpdateMeeting = async (e) => {
    e.preventDefault();
    if (!selectedMeeting) return;
    try {
      const { client_id, title, date, time, notes } = editMeeting;
      if (!client_id || !title || !date || !time) {
        toast.error('Please fill in client, title, date and time');
        return;
      }
      const [yy, mm, dd] = date.split('-').map((v) => parseInt(v, 10));
      const [hh, min] = time.split(':').map((v) => parseInt(v, 10));
      const localDateTime = new Date(yy, (mm || 1) - 1, dd || 1, hh || 0, min || 0, 0);
      const payload = { client_id, title, time, notes, date: localDateTime.toISOString() };
      const id = selectedMeeting._id || selectedMeeting.id;
      await axios.put(`${API}/meetings/${id}`, payload);
      toast.success('Meeting updated');
      setIsEditMeetingOpen(false);
      setSelectedMeeting(null);
      fetchMeetings();
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.error || 'Failed to update meeting';
      toast.error(message);
    }
  };

  // Lead handler functions
  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newLead,
        fullName: (newLead.fullName || '').trim(),
        email: (newLead.email || '').trim(),
        phone: (newLead.phone || '').trim(),
        company: (newLead.company || '').trim(),
        notes: (newLead.notes || '').trim(),
        estimated_value: newLead.estimated_value ? parseFloat(newLead.estimated_value) : undefined,
        currency: (newLead.currency || 'USD').toUpperCase(),
      };
      
      if (!payload.fullName) {
        toast.error('Full name is required');
        return;
      }
      
      if (!payload.email && !payload.phone) {
        toast.error('Either email or phone is required');
        return;
      }
      
      await axios.post(`${API}/leads`, payload);
      toast.success('Lead added successfully');
      setIsAddLeadOpen(false);
      resetNewLeadForm();
      fetchLeads();
    } catch (err) {
      console.error(err);
      const firstValidationMessage = Array.isArray(err?.response?.data?.details) && err.response.data.details.length > 0
        ? err.response.data.details[0]?.msg
        : null;
      const message = firstValidationMessage || err?.response?.data?.error || err?.response?.data?.message || 'Failed to add lead';
      toast.error(message);
    }
  };

  const handleUpdateLead = async (e) => {
    e.preventDefault();
    if (!editingLead || !editLead) return;
    const id = editingLead._id || editingLead.id;
    
    // Check if this is a conversion to client
    const isConvertingToClient = editLead.status === 'converted' && editingLead.status !== 'converted';
    
    try {
      // Show loading state for conversion
      if (isConvertingToClient) {
        toast.loading('Converting lead to client...', { id: 'converting' });
      }
      
      const payload = {
        ...editLead,
        fullName: (editLead.fullName || '').trim(),
        email: (editLead.email || '').trim(),
        phone: (editLead.phone || '').trim(),
        company: (editLead.company || '').trim(),
        notes: (editLead.notes || '').trim(),
        estimated_value: editLead.estimated_value ? parseFloat(editLead.estimated_value) : undefined,
        currency: (editLead.currency || 'USD').toUpperCase(),
      };
      
      if (!payload.fullName) {
        toast.error('Full name is required');
        return;
      }
      
      if (!payload.email && !payload.phone) {
        toast.error('Either email or phone is required');
        return;
      }
      
      const response = await axios.put(`${API}/leads/${id}`, payload);
      
      // Check if lead was converted to client
      if (response.data.convertedToClient) {
        // Dismiss loading toast and show success
        toast.dismiss('converting');
        toast.success(`Lead "${editingLead.fullName}" converted to client successfully! New client created with "Pending" status.`);
        
        // Small delay to let user see the success message before data refreshes
        setTimeout(() => {
          // Refresh both leads and clients lists
          fetchLeads();
          fetchClients();
        }, 500);
        
        // If user is not on clients tab, show a suggestion to view the new client
        if (activeTab !== 'clients') {
          setTimeout(() => {
            toast.info(`Client "${editingLead.fullName}" created! Switch to Clients tab to view it.`, {
              action: {
                label: 'View New Client',
                onClick: () => setActiveTab('clients')
              }
            });
          }, 1500);
        } else {
          // User is already on clients tab, show confirmation
          setTimeout(() => {
            toast.success(`Client "${editingLead.fullName}" is now visible in the clients list above!`);
          }, 1000);
        }
      } else {
        toast.success('Lead updated successfully');
        // Small delay for consistency
        setTimeout(() => {
          fetchLeads();
        }, 500);
      }
      
      setIsEditLeadOpen(false);
      setEditingLead(null);
      setEditLead(null);
    } catch (err) {
      console.error(err);
      
      // Dismiss loading toast if there was an error during conversion
      if (isConvertingToClient) {
        toast.dismiss('converting');
      }
      
      const firstValidationMessage = Array.isArray(err?.response?.data?.details) && err.response.data.details.length > 0
        ? err.response.data.details[0]?.msg
        : null;
      let message = firstValidationMessage || err?.response?.data?.error || err?.response?.data?.message || 'Failed to update lead';
      
      // Add more context for conversion errors
      if (isConvertingToClient) {
        message = `Failed to convert lead to client: ${message}`;
      }
      
      toast.error(message);
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await axios.delete(`${API}/leads/${leadId}`);
      toast.success('Lead deleted successfully');
      fetchLeads();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete lead');
    }
  };

  const handleImportLeads = async (e) => {
    e.preventDefault();
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }
    
    setIsImporting(true);
    setImportProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
      
      const response = await axios.post(`${API}/leads/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 90) / progressEvent.total);
          setImportProgress(progress);
        },
      });
      
      setImportProgress(100);
      setImportResults(response.data.results);
      
      if (response.data.results.imported > 0) {
        toast.success(`Successfully imported ${response.data.results.imported} leads`);
        fetchLeads();
      }
      
      if (response.data.results.errors.length > 0) {
        toast.error(`${response.data.results.errors.length} rows had errors. Check the import results for details.`);
      }
      
      // Reset form
      setImportFile(null);
      setIsImportLeadsOpen(false);
      
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.error || 'Failed to import leads';
      toast.error(message);
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const handleExportLeads = async () => {
    try {
      const params = new URLSearchParams();
      if (leadStatusFilter && leadStatusFilter !== 'all') params.append('status', leadStatusFilter);
      if (leadSourceFilter && leadSourceFilter !== 'all') params.append('source', leadSourceFilter);
      if (leadPriorityFilter && leadPriorityFilter !== 'all') params.append('priority', leadPriorityFilter);
      
      const response = await axios.get(`${API}/leads/export/excel?${params}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads-export-${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Leads exported successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export leads');
    }
  };

  // Derived meetings views for the Meetings page
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingMeetingsAll = (meetings || []).filter((m) => {
    const d = new Date(m.date);
    d.setHours(0, 0, 0, 0);
    return d >= today;
  });
  const highlightedDates = Array.from(
    new Set(upcomingMeetingsAll.map((m) => new Date(m.date).toDateString()))
  ).map((s) => new Date(s));
  const isSameCalendarDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const displayedMeetings = selectedCalendarDate
    ? upcomingMeetingsAll.filter((m) =>
        isSameCalendarDay(new Date(m.date), selectedCalendarDate)
      )
    : upcomingMeetingsAll;
  const sortedDisplayedMeetings = [...displayedMeetings].sort(
    (a, b) => new Date(a.date) - new Date(b.date) || (a.time || '').localeCompare(b.time || '')
  );

  // Charts data
  const statusPieData = useMemo(() => {
    const labels = ['Pending', 'To Be Pitched', 'Closed/Won', 'Lost', 'Cancelled'];
    const colorMap = {
      Pending: '#fbbf24',
      'To Be Pitched': '#38bdf8',
      'Closed/Won': '#34d399',
      Lost: '#f87171',
      Cancelled: '#9ca3af',
    };
    const counts = labels.map((label) => clients.filter((c) => c.pitch_status === label).length);
    return {
      labels,
      datasets: [
        {
          data: counts,
          backgroundColor: labels.map((l) => colorMap[l] + 'AA'),
          borderColor: labels.map((l) => colorMap[l]),
          borderWidth: 1,
        },
      ],
    };
  }, [clients]);

  const monthLabels = useMemo(() => {
    const end = startOfMonth(new Date());
    const start = startOfMonth(subMonths(end, 11));
    return eachMonthOfInterval({ start, end }).map((d) => format(d, 'MMM yyyy'));
  }, []);

  const newClientsPerMonthData = useMemo(() => {
    const map = new Map(monthLabels.map((label) => [label, 0]));
    clients.forEach((c) => {
      const created = c.createdAt ? new Date(c.createdAt) : null;
      if (!created) return;
      const key = format(startOfMonth(created), 'MMM yyyy');
      if (map.has(key)) map.set(key, (map.get(key) || 0) + 1);
    });
    return {
      labels: monthLabels,
      datasets: [
        {
          label: 'New Clients',
          data: monthLabels.map((l) => map.get(l) || 0),
          backgroundColor: 'rgba(56, 189, 248, 0.3)',
          borderColor: 'rgba(56, 189, 248, 1)',
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    };
  }, [clients, monthLabels]);

  const meetingsPerMonthData = useMemo(() => {
    const map = new Map(monthLabels.map((label) => [label, 0]));
    meetings.forEach((m) => {
      const d = m.date ? new Date(m.date) : null;
      if (!d) return;
      const key = format(startOfMonth(d), 'MMM yyyy');
      if (map.has(key)) map.set(key, (map.get(key) || 0) + 1);
    });
    return {
      labels: monthLabels,
      datasets: [
        {
          label: 'Meetings',
          data: monthLabels.map((l) => map.get(l) || 0),
          backgroundColor: 'rgba(168, 85, 247, 0.3)',
          borderColor: 'rgba(168, 85, 247, 1)',
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    };
  }, [meetings, monthLabels]);

  const chartOptions = {
    plugins: {
      legend: { labels: { color: '#e5e7eb' } },
      title: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.06)' } },
      y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.06)' }, beginAtZero: true },
    },
    maintainAspectRatio: false,
  };

  const filteredProjects = useMemo(() => {
    const query = (projectSearch || '').trim().toLowerCase();
    return (projects || []).filter((p) => {
      if (projectStatusFilter !== 'all' && p.status !== projectStatusFilter) return false;
      if (!query) return true;
      const client = p.client_id || {};
      const fields = [p.name, p.description, p.assigned_to, client.name, client.business_name]
        .map((v) => (v || '').toString().toLowerCase());
      return fields.some((f) => f.includes(query));
    });
  }, [projects, projectSearch, projectStatusFilter]);

  const completedProjects = useMemo(() => filteredProjects.filter((p) => p.status === 'Completed'), [filteredProjects]);
  const inProgressProjects = useMemo(() => filteredProjects.filter((p) => p.status === 'In Progress'), [filteredProjects]);
  const notStartedProjects = useMemo(() => filteredProjects.filter((p) => p.status === 'Not Started'), [filteredProjects]);
  const onHoldProjects = useMemo(() => filteredProjects.filter((p) => p.status === 'On Hold'), [filteredProjects]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const openProjectDetail = (project) => {
    setViewingProject(project);
    setIsProjectDetailOpen(true);
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="flex h-full">
        {/* Mobile Navigation Toggle */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('dashboard')}
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg p-2 bg-black/20 backdrop-blur-md"
            title="Menu"
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>

        {/* Sidebar - Hidden on Mobile, Visible on Desktop */}
        <aside className="hidden lg:block w-64 min-h-screen bg-gradient-to-b from-purple-500/10 via-indigo-500/10 to-sky-500/10 border border-white/10 p-6 rounded-2xl m-6 sticky top-6 backdrop-blur-md">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-sky-300 bg-clip-text text-transparent">Cliento CRM</h1>
                <div className="text-xs text-white/60 mt-1">A product by DevelopSuite</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg p-2"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Button variant={activeTab === 'dashboard' ? 'default' : 'ghost'} className="w-full justify-start rounded-xl transition-all duration-300 hover:translate-x-0.5 bg-blue-500/5 hover:bg-blue-500/10 text-sky-200" onClick={() => setActiveTab('dashboard')}>
              <Users className="mr-3 h-4 w-4" /> Dashboard
              </Button>
            <Button variant={activeTab === 'clients' ? 'default' : 'ghost'} className="w-full justify-start rounded-xl transition-all duration-300 hover:translate-x-0.5 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-200" onClick={() => setActiveTab('clients')}>
              <Users className="mr-3 h-4 w-4" /> Clients
              </Button>
            <Button variant={activeTab === 'leads' ? 'default' : 'ghost'} className="w-full justify-start rounded-xl transition-all duration-300 hover:translate-x-0.5 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-200" onClick={() => setActiveTab('leads')}>
              <Users className="mr-3 h-4 w-4" /> Leads
              </Button>
            <Button variant={activeTab === 'projects' ? 'default' : 'ghost'} className="w-full justify-start rounded-xl transition-all duration-300 hover:translate-x-0.5 bg-fuchsia-500/5 hover:bg-fuchsia-500/10 text-fuchsia-200" onClick={() => setActiveTab('projects')}>
              <Briefcase className="mr-3 h-4 w-4" /> Projects
              </Button>
            <Button variant={activeTab === 'meetings' ? 'default' : 'ghost'} className="w-full justify-start rounded-xl transition-all duration-300 hover:translate-x-0.5 bg-purple-500/5 hover:bg-purple-500/10 text-purple-200" onClick={() => setActiveTab('meetings')}>
              <CalendarIcon className="mr-3 h-4 w-4" /> Meetings
              </Button>
          </div>
        </aside>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-md border-t border-white/10">
          <div className="flex justify-around py-2">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('dashboard')}
              className="flex flex-col items-center p-2 text-xs rounded-lg transition-all duration-300"
            >
              <Users className="h-4 w-4 mb-1" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'clients' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('clients')}
              className="flex flex-col items-center p-2 text-xs rounded-lg transition-all duration-300"
            >
              <Users className="h-4 w-4 mb-1" />
              Clients
            </Button>
            <Button
              variant={activeTab === 'leads' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('leads')}
              className="flex flex-col items-center p-2 text-xs rounded-lg transition-all duration-300"
            >
              <Users className="h-4 w-4 mb-1" />
              Leads
            </Button>
            <Button
              variant={activeTab === 'projects' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('projects')}
              className="flex flex-col items-center p-2 text-xs rounded-lg transition-all duration-300"
            >
              <Briefcase className="h-4 w-4 mb-1" />
              Projects
            </Button>
            <Button
              variant={activeTab === 'meetings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('meetings')}
              className="flex flex-col items-center p-2 text-xs rounded-lg transition-all duration-300"
            >
              <CalendarIcon className="h-4 w-4 mb-1" />
              Meetings
            </Button>
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto pb-24 lg:pb-6">
          {activeTab === 'dashboard' && (
              <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                  <Card className="bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Total Clients</p>
                          <p className="text-2xl sm:text-3xl font-bold text-sky-300">{stats.totalClients}</p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/20 to-sky-500/10 flex items-center justify-center">
                          <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                                <Card className="bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Projects</p>
                        <p className="text-2xl sm:text-3xl font-bold text-fuchsia-300">{stats.totalProjects}</p>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-white/10 bg-gradient-to-br from-fuchsia-500/20 to-sky-500/10 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-fuchsia-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                                <Card className="bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Leads</p>
                        <p className="text-2xl sm:text-3xl font-bold text-emerald-300">{stats.totalLeads}</p>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                                <Card className="bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Upcoming Meetings</p>
                        <p className="text-2xl sm:text-3xl font-bold text-purple-300">{stats.upcomingMeetings}</p>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-white/10 bg-gradient-to-br from-fuchsia-500/20 to-purple-500/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            {(() => {
              const recentClients = [...clients]
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .slice(0, 3);
              const upcoming = [...meetings]
                .filter((m) => new Date(m.date) >= new Date())
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 3);
              return (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300">
                    <CardHeader className="border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white/90">Clients Overview</CardTitle>
                        <Button onClick={() => setIsAddClientOpen(true)} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                          <Plus className="mr-2 h-4 w-4" /> Add Client
                        </Button>
                      </div>
                      <CardDescription className="text-white/60">Recent clients and quick action</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      {recentClients.length === 0 ? (
                        <div className="text-gray-400">No clients yet</div>
                      ) : (
                        recentClients.map((c) => (
                          <div key={c._id || c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                            <div>
                              <div className="font-medium text-white/90">{c.name}</div>
                              <div className="text-xs text-white/60">{c.business_name}</div>
                            </div>
                            <Badge className={`px-2.5 py-1 rounded-full border border-white/10 bg-white/5 ${statusColors[c.pitch_status] || ''}`}>{c.pitch_status}</Badge>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300">
                    <CardHeader className="border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white/90">Upcoming Meetings</CardTitle>
                        <Button onClick={() => setIsAddMeetingOpen(true)} className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                          <Plus className="mr-2 h-4 w-4" /> Schedule
                        </Button>
                      </div>
                      <CardDescription className="text-white/60">Next few meetings at a glance</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      {upcoming.length === 0 ? (
                        <div className="text-gray-400">No upcoming meetings</div>
                      ) : (
                        upcoming.map((m) => {
                          const client = clients.find((c) => (c._id || c.id) === (m.client_id?._id || m.client_id));
                          return (
                            <div key={m._id || m.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-white/90">{m.title}</div>
                                <div className="text-xs text-white/70">{format(new Date(m.date), 'MMM dd, yyyy')} · {m.time}</div>
                              </div>
                              <div className="text-xs text-white/60 mt-1">{client ? `with ${client.name}` : ''}</div>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              <Card className="bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300">
                <CardHeader className="border-b border-white/10">
                  <CardTitle className="text-white/90">Status Breakdown</CardTitle>
                  <CardDescription className="text-white/60">Clients by pitch status</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-64">
                    <Pie data={statusPieData} options={{ plugins: { legend: { labels: { color: '#e5e7eb' } } } }} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300 xl:col-span-1">
                <CardHeader className="border-b border-white/10">
                  <CardTitle className="text-white/90">Monthly New Clients</CardTitle>
                  <CardDescription className="text-white/60">Last 12 months</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-64">
                    <Bar data={newClientsPerMonthData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300 xl:col-span-1">
                <CardHeader className="border-b border-white/10">
                  <CardTitle className="text-white/90">Meetings Per Month</CardTitle>
                  <CardDescription className="text-white/60">Last 12 months</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-64">
                    <Bar data={meetingsPerMonthData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-fuchsia-300 to-sky-300 bg-clip-text text-transparent">Projects</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="ghost" className="rounded-xl text-white hover:bg-white/10" onClick={handleExportProjects}>
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                  <Button className="bg-fuchsia-600 hover:bg-fuchsia-700 rounded-xl shadow" onClick={() => setIsAddProjectOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Project
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
                {projectStatusOptions.map((s) => (
                  <Card key={s} className="bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all duration-300">
                    <CardContent className="p-3">
                      <div className="text-xs text-white/60">{s}</div>
                      <div className={`text-2xl font-semibold ${projectStatusNumberText[s] || 'text-white'}`}>{projectStatusCounts[s] || 0}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                  <Input value={projectSearch} onChange={(e) => setProjectSearch(e.target.value)} placeholder="Search projects..." className="h-12 pl-10 pr-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/70 backdrop-blur-xl shadow-sm hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition" />
                </div>
                <Select value={projectStatusFilter} onValueChange={setProjectStatusFilter}>
                  <SelectTrigger className="h-12 w-56 pl-4 pr-10 bg-white/10 border border-white/20 rounded-2xl text-white data-[placeholder]:text-white data-[placeholder]:opacity-100 backdrop-blur-xl shadow-sm hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-xl text-white">
                    <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-white/60">Quick filter</div>
                    <SelectItem value="all" className="text-white/90 hover:bg-white/15 focus:bg-white/15 data-[state=checked]:bg-white/20 data-[state=checked]:text-white rounded-lg m-1 px-3.5 py-2.5">All Statuses</SelectItem>
                    {projectStatusOptions.map(s => (
                      <SelectItem key={s} value={s} className="text-white/90 hover:bg-white/15 focus:bg-white/15 data-[state=checked]:bg-white/20 data-[state=checked]:text-white rounded-lg m-1 px-3.5 py-2.5">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredProjects.map((p) => (
                  <Card key={p._id || p.id} className="bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl group">
                    <CardHeader className="pb-3 border-b border-white/10">
                      <CardTitle className="text-white/90 group-hover:text-white transition">{p.name}</CardTitle>
                      <CardDescription className="text-gray-400">{p.client_id?.name} • {p.client_id?.business_name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {p.description && (
                        <div className="text-sm text-white/70 line-clamp-2">{p.description}</div>
                      )}
                      <div className="text-xs text-white/60">Due: {p.due_date ? new Date(p.due_date).toLocaleDateString() : '—'}</div>
                      <div className="text-xs text-white/60">Assigned: {p.assigned_to || '—'}</div>
                      <div className="pt-1">
                        <Progress value={p.progress || 0} />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <Badge className={`px-2.5 py-1 rounded-full border border-white/10 bg-white/5 ${projectStatusColors[p.status] || ''}`}>{p.status}</Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="rounded-lg text-emerald-300 hover:bg-emerald-500/10" onClick={() => openProjectDetail(p)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="rounded-lg text-sky-300 hover:bg-sky-500/10" onClick={() => { 
                            setSelectedProject(p); 
                            setIsEditProjectOpen(true); 
                            setSelectedFiles([]);
                            setEditProject({
                              name: p.name || '',
                              client_id: p.client_id?._id || p.client_id,
                              description: p.description || '',
                              start_date: p.start_date ? new Date(p.start_date).toISOString().slice(0,10) : '',
                              due_date: p.due_date ? new Date(p.due_date).toISOString().slice(0,10) : '',
                              assigned_to: p.assigned_to || '',
                              status: p.status || 'Not Started',
                              priority: p.priority || 'Medium',
                              progress: p.progress || 0,
                            }); 
                          }}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-400/10 rounded-lg" onClick={async () => { if (!window.confirm('Delete this project?')) return; try { await axios.delete(`${API}/projects/${p._id || p.id}`); toast.success('Project deleted'); fetchProjects(); } catch (e) { toast.error('Failed to delete project'); } }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredProjects.length === 0 && (
                <div className="text-center py-12 text-gray-400">No projects found</div>
              )}
            </div>
          )}

          {activeTab === 'leads' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">Leads Development</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="ghost" className="rounded-xl text-white hover:bg-white/10" onClick={handleExportLeads}>
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                  <Button variant="ghost" className="rounded-xl text-white hover:bg-white/10" onClick={() => setIsImportLeadsOpen(true)}>
                    <Download className="mr-2 h-4 w-4" /> Import
                  </Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow" onClick={() => setIsAddLeadOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Lead
                  </Button>
                </div>
              </div>

              {/* Lead status summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 sm:gap-3 mb-4 sm:mb-6">
                {leadStatusOptions.map((s) => (
                  <Card key={s} className="bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all duration-300">
                    <CardContent className="p-3">
                      <div className="text-xs text-white/60 capitalize">{s.replace('_', ' ')}</div>
                      <div className={`text-2xl font-semibold ${leadStatusNumberText[s] || 'text-white'}`}>{leadStatusCounts[s] || 0}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Search and filters */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                  <Input 
                    value={leadSearch} 
                    onChange={(e) => setLeadSearch(e.target.value)} 
                    placeholder="Search leads..." 
                    className="h-12 pl-10 pr-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/70 backdrop-blur-xl shadow-sm hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition" 
                  />
                </div>
                <Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
                  <SelectTrigger className="h-12 w-40 pl-4 pr-10 bg-white/10 border border-white/20 rounded-2xl text-white data-[placeholder]:text-white data-[placeholder]:opacity-100 backdrop-blur-xl shadow-sm hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-xl text-white">
                    <SelectItem value="all" className="text-white/90 hover:bg-white/15 focus:bg-white/15 data-[state=checked]:bg-white/20 data-[state=checked]:text-white rounded-lg m-1 px-3.5 py-2.5">All Statuses</SelectItem>
                    {leadStatusOptions.map(s => (
                      <SelectItem key={s} value={s} className="text-white/90 hover:bg-white/15 focus:bg-white/15 data-[state=checked]:bg-white/20 data-[state=checked]:text-white rounded-lg m-1 px-3.5 py-2.5 capitalize">{s.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={leadSourceFilter} onValueChange={setLeadSourceFilter}>
                  <SelectTrigger className="h-12 w-40 pl-4 pr-10 bg-white/10 border border-white/20 rounded-2xl text-white data-[placeholder]:text-white data-[placeholder]:opacity-100 backdrop-blur-xl shadow-sm hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-xl text-white">
                    <SelectItem value="all" className="text-white/90 hover:bg-white/15 focus:bg-white/15 data-[state=checked]:bg-white/20 data-[state=checked]:text-white rounded-lg m-1 px-3.5 py-2.5">All Sources</SelectItem>
                    {leadSourceOptions.map(s => (
                      <SelectItem key={s} value={s} className="text-white/90 hover:bg-white/15 focus:bg-white/15 data-[state=checked]:bg-white/20 data-[state=checked]:text-white rounded-lg m-1 px-3.5 py-2.5 capitalize">{s.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={leadPriorityFilter} onValueChange={setLeadPriorityFilter}>
                  <SelectTrigger className="h-12 w-40 pl-4 pr-10 bg-white/10 border border-white/20 rounded-2xl text-white data-[placeholder]:text-white data-[placeholder]:opacity-100 backdrop-blur-xl shadow-sm hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-xl text-white">
                    <SelectItem value="all" className="text-white/90 hover:bg-white/15 focus:bg-white/15 data-[state=checked]:bg-white/20 data-[state=checked]:text-white rounded-lg m-1 px-3.5 py-2.5">All Priorities</SelectItem>
                    {leadPriorityOptions.map(s => (
                      <SelectItem key={s} value={s} className="text-white/90 hover:bg-white/15 focus:bg-white/15 data-[state=checked]:bg-white/20 data-[state=checked]:text-white rounded-lg m-1 px-3.5 py-2.5 capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Leads List View - Brief */}
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-white/5 border-b border-white/10 text-xs font-medium text-white/70 uppercase tracking-wider">
                    <div className="col-span-2">Lead</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1">Priority</div>
                    <div className="col-span-1">Source</div>
                    <div className="col-span-1">Actions</div>
                  </div>
                  
                  {/* Table Rows */}
                  {leads.map(lead => (
                    <div key={lead._id || lead.id} className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-colors duration-200 group">
                      {/* Lead Info */}
                      <div className="col-span-2">
                        <div className="font-medium text-white/90 group-hover:text-white transition">{lead.fullName}</div>
                        <div className="text-sm text-gray-400">{lead.company || 'No company'}</div>
                        {lead.email && (
                          <div className="text-xs text-gray-500 mt-1 truncate">{lead.email}</div>
                        )}
                      </div>
                      
                      {/* Status */}
                      <div className="col-span-1">
                        <Badge className={`px-2.5 py-1 rounded-full border border-white/10 bg-white/5 ${leadStatusColors[lead.status] || ''} text-xs`}>
                          {lead.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {/* Priority */}
                      <div className="col-span-1">
                        <Badge className={`px-2.5 py-1 rounded-full border border-white/10 bg-white/5 ${leadPriorityColors[lead.priority] || ''} text-xs`}>
                          {lead.priority}
                        </Badge>
                      </div>
                      
                      {/* Source */}
                      <div className="col-span-1">
                        <Badge className={`px-2.5 py-1 rounded-full border border-white/10 bg-white/5 ${leadSourceColors[lead.source] || ''} text-xs`}>
                          {lead.source.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {/* Actions */}
                      <div className="col-span-1">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-lg text-sky-300 hover:bg-sky-500/10 h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedLead(lead);
                              setIsViewLeadOpen(true);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-lg text-purple-300 hover:bg-purple-500/10 h-8 w-8 p-0"
                            onClick={() => {
                              setEditingLead(lead);
                              setEditLead({
                                fullName: lead.fullName || '',
                                email: lead.email || '',
                                phone: lead.phone || '',
                                company: lead.company || '',
                                source: lead.source || 'website',
                                status: lead.status || 'new',
                                priority: lead.priority || 'medium',
                                notes: lead.notes || '',
                                estimated_value: lead.estimated_value || '',
                                currency: lead.currency || 'USD'
                              });
                              setIsEditLeadOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-400 hover:bg-red-400/10 rounded-lg h-8 w-8 p-0" 
                            onClick={() => handleDeleteLead(lead._id || lead.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && leads.length === 0 && (
                <div className="text-center py-12 text-gray-400">No leads found</div>
              )}
            </div>
          )}

          {activeTab === 'clients' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-300 to-sky-300 bg-clip-text text-transparent">Clients</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="ghost" className="rounded-xl text-white hover:bg-white/10" onClick={handleExportClients}>
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow" onClick={() => setIsAddClientOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Client
                  </Button>
                </div>
              </div>

              {/* Small status summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
                {['Pending','To Be Pitched','Cancelled','Closed/Won','Lost'].map((s) => (
                  <Card key={s} className="bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all duration-300">
                    <CardContent className="p-3">
                      <div className="text-xs text-white/60">{s}</div>
                      <div className={`text-2xl font-semibold ${statusNumberText[s] || 'text-white'}`}>{statusCounts[s] || 0}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search clients..."
                    className="h-12 pl-10 pr-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/70 backdrop-blur-xl shadow-sm hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12 w-56 pl-4 pr-10 bg-white/10 border border-white/20 rounded-2xl text-white data-[placeholder]:text-white data-[placeholder]:opacity-100 backdrop-blur-xl shadow-sm hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-xl text-white">
                    <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-white/60">Quick filter</div>
                    <SelectItem value="all" className="text-white/90 hover:bg-white/15 focus:bg-white/15 data-[state=checked]:bg-white/20 data-[state=checked]:text-white rounded-lg m-1 px-3.5 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                        <span>All Statuses</span>
                      </div>
                    </SelectItem>
                    {statusOptions.map(s => (
                      <SelectItem
                        key={s}
                        value={s}
                        className="text-white/90 hover:bg-white/15 focus:bg-white/15 data-[state=checked]:bg-white/20 data-[state=checked]:text-white rounded-lg m-1 px-3.5 py-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${s === 'Pending' ? 'bg-amber-300' : s === 'To Be Pitched' ? 'bg-sky-300' : s === 'Cancelled' ? 'bg-gray-300' : s === 'Closed/Won' ? 'bg-emerald-300' : 'bg-rose-300'}`}></span>
                          <span>{s}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {clients.map(client => (
                    <Card key={client._id || client.id} className="bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl group">
                      <CardHeader className="pb-3 border-b border-white/10">
                        <CardTitle className="text-white/90 group-hover:text-white transition">{client.name}</CardTitle>
                        <CardDescription className="text-gray-400">{client.business_name}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                         {client.email && (
                           <div className="flex items-center text-gray-300 text-sm">
                             <Mail className="mr-2 h-4 w-4" />
                             <span className="mt-0.5 inline-block">{client.email}</span>
                           </div>
                         )}
                         <div className="flex items-center text-gray-300 text-sm">
                           <Phone className="mr-2 h-4 w-4" />
                           <span className="mt-0.5 inline-block">{client.phone}</span>
                         </div>
                         <div className="flex items-center justify-between pt-2">
                           <Badge className={`px-2.5 py-1 rounded-full border border-white/10 bg-white/5 ${statusColors[client.pitch_status] || ''}`}>{client.pitch_status}</Badge>
                           <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                               className="rounded-lg text-sky-300 hover:bg-sky-500/10"
                               onClick={() => {
                                 setSelectedClient(client);
                                 setIsViewClientOpen(true);
                               }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                               className="rounded-lg text-purple-300 hover:bg-purple-500/10"
                               onClick={() => {
                                 setEditingClient(client);
                                 setEditClient({
                                   name: client.name || '',
                                   phone: client.phone || '',
                                   email: client.email || '',
                                   business_name: client.business_name || '',
                                   business_description: client.business_description || '',
                                   address: client.address || '',
                                   pitch_status: client.pitch_status || 'Pending'
                                 });
                                 setIsEditClientOpen(true);
                               }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-400/10 rounded-lg" onClick={() => handleDeleteClient(client._id || client.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!loading && clients.length === 0 && (
                 <div className="text-center py-12 text-gray-400">No clients found</div>
              )}
            </div>
          )}

          {activeTab === 'meetings' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-300 to-sky-300 bg-clip-text text-transparent">Meetings</h2>
               <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setIsAddMeetingOpen(true)}>
                 <Plus className="mr-2 h-4 w-4" /> Schedule Meeting
               </Button>
               <Dialog open={isAddMeetingOpen} onOpenChange={setIsAddMeetingOpen}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl text-white">
                    <div className="sticky top-0 z-10 relative h-20 bg-gradient-to-r from-fuchsia-500/30 via-purple-500/20 to-sky-500/20">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_40%)]" />
                                  <div className="relative px-4 sm:px-6 pt-6">
              <h3 className="text-xl font-semibold text-white/90">Schedule New Meeting</h3>
              <p className="text-sm text-white/60">Create a meeting with an existing client</p>
            </div>
                    </div>
                    <form onSubmit={handleScheduleMeeting} className="px-4 sm:px-6 py-5 space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-white/70 text-xs uppercase tracking-wider">Client *</Label>
                          <Select value={newMeeting.client_id} onValueChange={(v) => setNewMeeting({ ...newMeeting, client_id: v })}>
                            <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-xl">
                              <SelectValue placeholder="Select client" />
                            </SelectTrigger>
                            <SelectContent className="bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl">
                              {clients.map(c => (
                                <SelectItem key={c._id || c.id} value={c._id || c.id} className="text-white/90 hover:bg-white/15 focus:bg-white/15">{c.name} — {c.business_name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-white/70 text-xs uppercase tracking-wider">Title *</Label>
                          <Input
                            placeholder="Discovery call"
                            value={newMeeting.title}
                            onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                            required
                            className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-white/70 text-xs uppercase tracking-wider">Date *</Label>
                          <Input
                            type="date"
                            value={newMeeting.date}
                            onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                            required
                            className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-white/70 text-xs uppercase tracking-wider">Time *</Label>
                          <Input
                            type="time"
                            value={newMeeting.time}
                            onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                            required
                            className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                          <Label className="text-white/70 text-xs uppercase tracking-wider">Notes</Label>
                          <Textarea
                            rows={3}
                            placeholder="Agenda, goals, follow-ups"
                            value={newMeeting.notes}
                            onChange={(e) => setNewMeeting({ ...newMeeting, notes: e.target.value })}
                            className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-3">
                        <Button type="button" variant="ghost" className="text-white hover:bg-white/10 rounded-xl" onClick={() => setIsAddMeetingOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 rounded-xl px-6">Schedule</Button>
                   </div>
                    </form>
                 </DialogContent>
               </Dialog>
             </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                <Card className="bg-white/5 border border-white/10 rounded-2xl">
                  <CardHeader className="border-b border-white/10">
                    <CardTitle className="text-white/90">Calendar</CardTitle>
                 </CardHeader>
                  <CardContent className="p-4">
                   <Calendar
                     mode="single"
                      selected={selectedCalendarDate}
                      onSelect={(d) => setSelectedCalendarDate(d || null)}
                      modifiers={{ hasMeeting: highlightedDates }}
                      modifiersClassNames={{ hasMeeting: 'bg-white/20 text-white' }}
                     className="text-white"
                   />
                    <div className="mt-3 text-xs text-white/70">
                      {selectedCalendarDate ? `Selected: ${format(selectedCalendarDate,'MMM dd, yyyy')}` : 'Select a date to filter'}
                    </div>
                 </CardContent>
               </Card>

                <Card className="bg-white/5 border border-white/10 rounded-2xl lg:col-span-2">
                  <CardHeader className="border-b border-white/10">
                    <CardTitle className="text-white/90">Upcoming Meetings</CardTitle>
                 </CardHeader>
                 <CardContent className="p-4">
                    {sortedDisplayedMeetings.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">No meetings found</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {sortedDisplayedMeetings.slice(0, 20).map((meeting) => {
                          const client = clients.find((c) => (c._id || c.id) === meeting.client_id);
                       return (
                            <div key={meeting._id || meeting.id} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-white/90">{meeting.title}</div>
                                <div className="text-xs text-white/70">{format(new Date(meeting.date), 'MMM dd, yyyy')} · {meeting.time}</div>
                              </div>
                              <div className="text-sm text-white/70 mt-1">
                                {client ? `with ${client.name}` : ''}
                              </div>
                              {meeting.notes && (
                                <div className="text-sm text-white/60 mt-1 line-clamp-2">{meeting.notes}</div>
                              )}
                              <div className="flex items-center justify-end gap-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="rounded-lg text-sky-300 hover:bg-sky-500/10"
                                  onClick={() => {
                                    setSelectedMeeting(meeting);
                                    setIsViewMeetingOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="rounded-lg text-purple-300 hover:bg-purple-500/10"
                                  onClick={() => {
                                    setSelectedMeeting(meeting);
                                    setEditMeeting({
                                      client_id: meeting.client_id?._id || meeting.client_id,
                                      title: meeting.title || '',
                                      date: meeting.date ? new Date(meeting.date).toISOString().slice(0,10) : '',
                                      time: meeting.time || '',
                                      notes: meeting.notes || ''
                                    });
                                    setIsEditMeetingOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-400/10 rounded-lg" onClick={() => handleDeleteMeeting(meeting._id || meeting.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                        </div>
                      );
                    })}
                  </div>
                    )}
                </CardContent>
              </Card>
              </div>
            </div>
          )}
        </main>
    </div>

      <Toaster />

      {/* Add Client Dialog */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl text-white">
          <div className="relative h-28 bg-gradient-to-r from-fuchsia-500/30 via-purple-500/20 to-sky-500/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_40%)]" />
            <div className="relative px-4 sm:px-6 pt-6">
              <h3 className="text-xl font-semibold text-white/90">Add New Client</h3>
              <p className="text-sm text-white/60">Enter client details to add them to your CRM</p>
            </div>
          </div>
          <form onSubmit={handleAddClient} className="px-4 sm:px-6 py-5 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Full Name *</Label>
                <Input
                  placeholder="John Carter"
                  value={newClient.name}
                                          onChange={(e) => handleNewClientChange('name', e.target.value)}
                  required
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Phone Number *</Label>
                <Input
                  placeholder="e.g. +1 555 123 4567"
                  value={newClient.phone}
                                          onChange={(e) => handleNewClientChange('phone', e.target.value)}
                  required
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Email Address</Label>
                <Input
                  type="email"
                  placeholder="client@company.com"
                  value={newClient.email}
                                          onChange={(e) => handleNewClientChange('email', e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Business Name *</Label>
                <Input
                  placeholder="Acme Inc."
                  value={newClient.business_name}
                                          onChange={(e) => handleNewClientChange('business_name', e.target.value)}
                  required
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Pitch Status *</Label>
                <Select value={newClient.pitch_status} onValueChange={(v) => setNewClient({ ...newClient, pitch_status: v })}>
                  <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl">
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s} className="text-white/90 hover:bg-white/15 focus:bg-white/15">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Business Address</Label>
                <Input
                  placeholder="Street, City, State, ZIP"
                  value={newClient.address}
                                          onChange={(e) => handleNewClientChange('address', e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Business Description</Label>
                <Textarea
                  rows={4}
                  placeholder="Brief description of services, industry, goals..."
                  value={newClient.business_description}
                                          onChange={(e) => handleNewClientChange('business_description', e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-1">
              <Button type="button" variant="ghost" className="text-white hover:bg-white/10 rounded-xl" onClick={() => setIsAddClientOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl px-6">Save Client</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Project Dialog */}
      <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl text-white">
          <div className="sticky top-0 z-20 h-20 bg-gradient-to-r from-fuchsia-500/30 via-purple-500/20 to-sky-500/20 border-b border-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_40%)]" />
            <div className="relative px-4 sm:px-6 pt-6">
              <h3 className="text-xl font-semibold text-white/90">Add New Project</h3>
              <p className="text-sm text-white/60">Link a project to a client</p>
            </div>
          </div>
          <div className="overflow-y-auto max-h-[calc(90vh-5rem)]">
                      <form onSubmit={async (e) => { e.preventDefault(); try { const formData = new FormData(); formData.append('name', newProject.name); formData.append('client_id', newProject.client_id); formData.append('description', newProject.description || ''); if (newProject.start_date) formData.append('start_date', new Date(newProject.start_date).toISOString()); if (newProject.due_date) formData.append('due_date', new Date(newProject.due_date).toISOString()); formData.append('assigned_to', newProject.client_id); formData.append('status', newProject.status); formData.append('priority', newProject.priority); if (newProject.progress !== '') formData.append('progress', newProject.progress); selectedFiles.forEach(file => { formData.append('documents', file); }); if (!newProject.client_id) { toast.error('Select a client'); return; } await axios.post(`${API}/projects`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Project created'); setIsAddProjectOpen(false); setNewProject({ name: '', client_id: '', description: '', start_date: '', due_date: '', assigned_to: '', status: 'Not Started', priority: 'Medium', progress: '' }); setSelectedFiles([]); fetchProjects(); } catch (err) { const firstValidationMessage = Array.isArray(err?.response?.data?.details) && err.response.data.details.length > 0 ? err.response.data.details[0]?.msg : null; const message = firstValidationMessage || err?.response?.data?.error || err?.response?.data?.message || 'Failed to create project'; toast.error(message); } }} className="px-4 sm:px-6 py-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Project Name *</Label>
                <Input value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} required className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Client *</Label>
                <Select value={newProject.client_id} onValueChange={(v) => setNewProject({ ...newProject, client_id: v })}>
                  <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-xl">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl">
                    {clients.map(c => (
                      <SelectItem key={c._id || c.id} value={c._id || c.id} className="text-white/90 hover:bg-white/15 focus:bg-white/15">{c.name} — {c.business_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Description</Label>
                <Textarea rows={2} value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10">
                      <CalendarIcon className="mr-2 h-4 w-4 text-white/70" />
                      {newProject.start_date ? format(new Date(newProject.start_date), 'PP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white/10 border border-white/20 backdrop-blur-2xl rounded-2xl text-white">
                    <Calendar
                      mode="single"
                      selected={newProject.start_date ? new Date(newProject.start_date) : undefined}
                      onSelect={(d) => setNewProject({ ...newProject, start_date: d ? d.toISOString() : '' })}
                      initialFocus
                      className="[&_button]:text-white [&_.rdp-day_selected]:bg-white/20"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10">
                      <CalendarIcon className="mr-2 h-4 w-4 text-white/70" />
                      {newProject.due_date ? format(new Date(newProject.due_date), 'PP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white/10 border border-white/20 backdrop-blur-2xl rounded-2xl text-white">
                    <Calendar
                      mode="single"
                      selected={newProject.due_date ? new Date(newProject.due_date) : undefined}
                      onSelect={(d) => setNewProject({ ...newProject, due_date: d ? d.toISOString() : '' })}
                      initialFocus
                      className="[&_button]:text-white [&_.rdp-day_selected]:bg-white/20"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Assigned To</Label>
                <Input value={newProject.assigned_to} onChange={(e) => setNewProject({ ...newProject, assigned_to: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Status *</Label>
                <Select value={newProject.status} onValueChange={(v) => setNewProject({ ...newProject, status: v })}>
                  <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl">
                    {['Not Started','In Progress','On Hold','Completed'].map(s => (
                      <SelectItem key={s} value={s} className="text-white/90 hover:bg-white/15 focus:bg-white/15">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Priority</Label>
                <Select value={newProject.priority} onValueChange={(v) => setNewProject({ ...newProject, priority: v })}>
                  <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-xl">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl">
                    {['Low','Medium','High','Critical'].map(s => (
                      <SelectItem key={s} value={s} className="text-white/90 hover:bg-white/15 focus:bg-white/15">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Progress (0-100)</Label>
                <Input type="number" min={0} max={100} value={newProject.progress} placeholder="e.g. 45" onChange={(e) => setNewProject({ ...newProject, progress: e.target.value === '' ? '' : Number(e.target.value) })} className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition" />
              </div>
            </div>
            
            {/* File Upload Section */}
            <div className="space-y-3">
              <Label className="text-white/70 text-xs uppercase tracking-wider">Attach Documents</Label>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-4 hover:border-white/30 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                  className="hidden"
                  id="project-files"
                />
                <label htmlFor="project-files" className="cursor-pointer block text-center">
                  <div className="text-white/60 hover:text-white/80 transition-colors">
                    <div className="text-lg mb-2">📁 Click to upload files</div>
                    <div className="text-sm">PDF, Word, Excel, Images (Max 10MB each)</div>
                  </div>
                </label>
              </div>
              
              {/* Selected Files Display */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-white/70">Selected Files:</div>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-sky-400 text-sm">📄</span>
                        </div>
                        <div>
                          <div className="text-white/90 text-sm font-medium">{file.name}</div>
                          <div className="text-white/60 text-xs">{formatFileSize(file.size)}</div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:bg-red-400/10 rounded-lg"
                        onClick={() => removeFile(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <Button type="button" variant="ghost" className="text-white hover:bg-white/10 rounded-xl" onClick={() => { setIsAddProjectOpen(false); setSelectedFiles([]); }}>Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-fuchsia-600 to-sky-600 hover:from-fuchsia-700 hover:to-sky-700 rounded-xl px-6">Save Project</Button>
            </div>
          </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl text-white">
          <div className="sticky top-0 z-20 h-20 bg-gradient-to-r from-fuchsia-500/30 via-purple-500/20 to-sky-500/20 border-b border-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_40%)]" />
            <div className="relative px-6 pt-6">
              <h3 className="text-xl font-semibold text-white/90">Edit Project</h3>
              <p className="text-sm text-white/60">Update the project details</p>
            </div>
          </div>
          {editProject && (
            <div className="overflow-y-auto max-h-[calc(90vh-5rem)]">
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const id = selectedProject?._id || selectedProject?.id;
                const payload = {
                  ...editProject,
                  progress: editProject.progress === '' ? undefined : Number(editProject.progress)
                };
                
                if (!payload.client_id) {
                  toast.error('Select a client');
                  return;
                }
                
                if (payload.start_date) payload.start_date = new Date(editProject.start_date).toISOString();
                if (payload.due_date) payload.due_date = new Date(editProject.due_date).toISOString();
                
                await axios.put(`${API}/projects/${id}`, payload);
                
                // Handle file uploads if any files are selected
                if (selectedFiles.length > 0) {
                  const formData = new FormData();
                  selectedFiles.forEach(file => {
                    formData.append('documents', file);
                  });
                  await axios.post(`${API}/projects/${id}/documents`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                  });
                  toast.success('Project updated and documents uploaded');
                } else {
                  toast.success('Project updated');
                }
                
                setIsEditProjectOpen(false);
                setSelectedProject(null);
                setSelectedFiles([]);
                fetchProjects();
              } catch (err) {
                const firstValidationMessage = Array.isArray(err?.response?.data?.details) && err.response.data.details.length > 0 ? err.response.data.details[0]?.msg : null;
                const message = firstValidationMessage || err?.response?.data?.error || err?.response?.data?.message || 'Failed to update project';
                toast.error(message);
              }
            }} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Project Name *</Label>
                  <Input value={editProject.name} onChange={(e) => setEditProject({ ...editProject, name: e.target.value })} required className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Client *</Label>
                  <Select value={editProject.client_id} onValueChange={(v) => setEditProject({ ...editProject, client_id: v })}>
                    <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-xl">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl">
                      {clients.map(c => (
                        <SelectItem key={c._id || c.id} value={c._id || c.id} className="text-white/90 hover:bg-white/15 focus:bg-white/15">{c.name} — {c.business_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Description</Label>
                  <Textarea rows={2} value={editProject.description} onChange={(e) => setEditProject({ ...editProject, description: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Start Date</Label>
                  <Input type="date" value={editProject.start_date} onChange={(e) => setEditProject({ ...editProject, start_date: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Due Date</Label>
                  <Input type="date" value={editProject.due_date} onChange={(e) => setEditProject({ ...editProject, due_date: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Assigned To</Label>
                  <Input value={editProject.assigned_to} onChange={(e) => setEditProject({ ...editProject, assigned_to: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Status *</Label>
                  <Select value={editProject.status} onValueChange={(v) => setEditProject({ ...editProject, status: v })}>
                    <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-xl">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl">
                      {['Not Started','In Progress','On Hold','Completed'].map(s => (
                        <SelectItem key={s} value={s} className="text-white/90 hover:bg-white/15 focus:bg-white/15">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Priority</Label>
                  <Select value={editProject.priority} onValueChange={(v) => setEditProject({ ...editProject, priority: v })}>
                    <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-xl">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl">
                      {['Low','Medium','High','Critical'].map(s => (
                        <SelectItem key={s} value={s} className="text-white/90 hover:bg-white/15 focus:bg-white/15">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Progress (0-100)</Label>
                  <Input type="number" min={0} max={100} value={editProject.progress} placeholder="e.g. 45" onChange={(e) => setEditProject({ ...editProject, progress: e.target.value === '' ? '' : Number(e.target.value) })} className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition" />
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-3">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Attach Documents</Label>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-4 hover:border-white/30 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                    className="hidden"
                    id="edit-project-files"
                  />
                  <label htmlFor="edit-project-files" className="cursor-pointer block text-center">
                    <div className="text-white/60 hover:text-white/80 transition-colors">
                      <div className="text-lg mb-2">📁 Click to upload files</div>
                      <div className="text-sm">PDF, Word, Excel, Images (Max 10MB each)</div>
                    </div>
                  </label>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-white/70">Files to upload:</div>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-sky-400 text-sm">📄</span>
                          </div>
                          <div>
                            <div className="text-white/90 text-sm font-medium">{file.name}</div>
                            <div className="text-white/60 text-xs">{formatFileSize(file.size)}</div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:bg-red-400/10 rounded-lg"
                          onClick={() => removeFile(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Existing Documents */}
                {editProject.documents && editProject.documents.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm text-white/70">Existing Documents:</div>
                    {editProject.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-sky-400 text-sm">📄</span>
                          </div>
                          <div>
                            <div className="text-white/90 text-sm font-medium">{doc.originalName}</div>
                            <div className="text-white/60 text-xs">
                              {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-sky-400 hover:bg-sky-500/10 rounded-lg"
                            onClick={() => window.open(`http://localhost:5000/${doc.path}`, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:bg-red-400/10 rounded-lg"
                            onClick={async () => {
                              if (!window.confirm('Delete this document?')) return;
                              try {
                                await axios.delete(`${API}/projects/${editProject._id || editProject.id}/documents/${doc._id}`);
                                toast.success('Document deleted');
                                
                                // Update the edit project state immediately by removing the deleted document
                                setEditProject(prev => ({
                                  ...prev,
                                  documents: prev.documents.filter(d => d._id !== doc._id)
                                }));
                                
                                // Refresh the projects list
                                fetchProjects();
                              } catch (e) {
                                console.error('Delete document error:', e);
                                toast.error('Failed to delete document');
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <Button type="button" variant="ghost" className="text-white hover:bg-white/10 rounded-xl" onClick={() => {
                  setIsEditProjectOpen(false);
                  setSelectedFiles([]);
                }}>Cancel</Button>
                <Button type="submit" className="bg-gradient-to-r from-fuchsia-600 to-sky-600 hover:from-fuchsia-700 hover:to-sky-700 rounded-xl px-6">Update Project</Button>
              </div>
            </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Add Meeting Dialog (global) */}
      <Dialog open={isAddMeetingOpen} onOpenChange={setIsAddMeetingOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl text-white">
          <div className="sticky top-0 z-10 relative h-20 bg-gradient-to-r from-fuchsia-500/30 via-purple-500/20 to-sky-500/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_40%)]" />
            <div className="relative px-6 pt-6">
              <h3 className="text-xl font-semibold text-white/90">Schedule New Meeting</h3>
              <p className="text-sm text-white/60">Create a meeting with an existing client</p>
            </div>
          </div>
          <form onSubmit={handleScheduleMeeting} className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Client *</Label>
                <Select value={newMeeting.client_id} onValueChange={(v) => setNewMeeting({ ...newMeeting, client_id: v })}>
                  <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-xl">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl">
                    {clients.map(c => (
                      <SelectItem key={c._id || c.id} value={c._id || c.id} className="text-white/90 hover:bg-white/15 focus:bg-white/15">{c.name} — {c.business_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Title *</Label>
                <Input
                  placeholder="Discovery call"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  required
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Date *</Label>
                <Input
                  type="date"
                  value={newMeeting.date}
                  onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                  required
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Time *</Label>
                <Input
                  type="time"
                  value={newMeeting.time}
                  onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                  required
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Notes</Label>
                <Textarea
                  rows={3}
                  placeholder="Agenda, goals, follow-ups"
                  value={newMeeting.notes}
                  onChange={(e) => setNewMeeting({ ...newMeeting, notes: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" className="text-white hover:bg-white/10 rounded-xl" onClick={() => setIsAddMeetingOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 rounded-xl px-6">Schedule</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Client Dialog */}
      <Dialog open={isViewClientOpen} onOpenChange={setIsViewClientOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl">
      {selectedClient && (
                      <div>
              <div className="relative h-28 bg-gradient-to-r from-fuchsia-500/30 via-purple-500/20 to-sky-500/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_40%)]" />
                <div className="relative px-6 pt-6">
                  <h3 className="text-xl font-semibold text-white/90">Client Details</h3>
                  <p className="text-sm text-white/60">Complete profile overview</p>
                    </div>
                  </div>

              <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-wider text-white/60">Full Name</div>
                  <div className="mt-1.5 font-medium">{selectedClient.name}</div>
                      </div>
                {selectedClient.email && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-wider text-white/60">Email</div>
                    <div className="mt-1.5 font-medium">{selectedClient.email}</div>
                  </div>
                )}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-wider text-white/60">Phone</div>
                  <div className="mt-1.5 font-medium">{selectedClient.phone}</div>
                        </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-wider text-white/60">Business</div>
                  <div className="mt-1.5 font-medium">{selectedClient.business_name}</div>
                  </div>
                {selectedClient.address && (
                  <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-wider text-white/60">Address</div>
                    <div className="mt-1.5 font-medium">{selectedClient.address}</div>
                    </div>
                )}
                {selectedClient.business_description && (
                  <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-wider text-white/60">Description</div>
                    <div className="mt-1.5 font-medium leading-relaxed text-white/90">{selectedClient.business_description}</div>
                  </div>
                )}
              </div>

              <div className="px-6 pb-6 flex items-center justify-end gap-3">
                <Button variant="ghost" className="text-white hover:bg-white/10 rounded-xl" onClick={() => setIsViewClientOpen(false)}>Close</Button>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl">Edit</Button>
              </div>
            </div>
          )}
          </DialogContent>
        </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl text-white">
          <div className="relative h-28 bg-gradient-to-r from-fuchsia-500/30 via-purple-500/20 to-sky-500/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_40%)]" />
            <div className="relative px-6 pt-6">
              <h3 className="text-xl font-semibold text-white/90">Edit Client</h3>
              <p className="text-sm text-white/60">Update details for this client</p>
            </div>
          </div>
          {editClient && (
            <form onSubmit={handleUpdateClient} className="px-6 py-5 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Full Name *</Label>
                  <Input
                    placeholder="John Carter"
                    value={editClient.name}
                                            onChange={(e) => handleEditClientChange('name', e.target.value)}
                    required
                    className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Phone Number *</Label>
                  <Input
                    placeholder="e.g. +1 555 123 4567"
                    value={editClient.phone}
                                            onChange={(e) => handleEditClientChange('phone', e.target.value)}
                    required
                    className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="client@company.com"
                    value={editClient.email}
                                            onChange={(e) => handleEditClientChange('email', e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Business Name *</Label>
                  <Input
                    placeholder="Acme Inc."
                    value={editClient.business_name}
                                            onChange={(e) => handleEditClientChange('business_name', e.target.value)}
                    required
                    className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Pitch Status *</Label>
                  <Select value={editClient.pitch_status} onValueChange={(v) => setEditClient({ ...editClient, pitch_status: v })}>
                    <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-xl">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl">
                      {statusOptions.map((s) => (
                        <SelectItem key={s} value={s} className="text-white/90 hover:bg-white/15 focus:bg-white/15">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Business Address</Label>
                  <Input
                    placeholder="Street, City, State, ZIP"
                    value={editClient.address}
                                            onChange={(e) => handleEditClientChange('address', e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Business Description</Label>
                  <Textarea
                    rows={4}
                    placeholder="Brief description of services, industry, goals..."
                    value={editClient.business_description}
                                            onChange={(e) => handleEditClientChange('business_description', e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-1">
                <Button type="button" variant="ghost" className="text-white hover:bg-white/10 rounded-xl" onClick={() => setIsEditClientOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl px-6">Update Client</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Meeting Dialog */}
      <Dialog open={isViewMeetingOpen} onOpenChange={setIsViewMeetingOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl text-white">
          {selectedMeeting && (
            <div>
              <div className="relative h-16 bg-gradient-to-r from-fuchsia-500/30 via-purple-500/20 to-sky-500/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_40%)]" />
                <div className="relative px-6 pt-4">
                  <h3 className="text-lg font-semibold text-white/90">{selectedMeeting.title}</h3>
                  <p className="text-xs text-white/70">{format(new Date(selectedMeeting.date),'MMM dd, yyyy')} · {selectedMeeting.time}</p>
                </div>
              </div>
              <div className="px-6 py-5 space-y-3">
                <div className="text-sm text-white/80">{selectedMeeting.notes || 'No notes provided'}</div>
              </div>
              <div className="px-6 pb-4 flex items-center justify-end gap-2">
                <Button variant="ghost" className="text-white hover:bg-white/10 rounded-xl" onClick={() => setIsViewMeetingOpen(false)}>Close</Button>
                <Button className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 rounded-xl"
                  onClick={() => {
                    setIsViewMeetingOpen(false);
                    setEditMeeting({
                      client_id: selectedMeeting.client_id?._id || selectedMeeting.client_id,
                      title: selectedMeeting.title || '',
                      date: selectedMeeting.date ? new Date(selectedMeeting.date).toISOString().slice(0,10) : '',
                      time: selectedMeeting.time || '',
                      notes: selectedMeeting.notes || ''
                    });
                    setIsEditMeetingOpen(true);
                  }}>Edit</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Meeting Dialog */}
      <Dialog open={isEditMeetingOpen} onOpenChange={setIsEditMeetingOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl text-white">
          <div className="relative h-16 bg-gradient-to-r from-fuchsia-500/30 via-purple-500/20 to-sky-500/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_40%)]" />
            <div className="relative px-6 pt-4">
              <h3 className="text-lg font-semibold text-white/90">Edit Meeting</h3>
              <p className="text-xs text-white/70">Update the meeting details</p>
            </div>
          </div>
          {editMeeting && (
            <form onSubmit={handleUpdateMeeting} className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Client *</Label>
                  <Select value={editMeeting.client_id} onValueChange={(v) => setEditMeeting({ ...editMeeting, client_id: v })}>
                    <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-xl">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl">
                      {clients.map(c => (
                        <SelectItem key={c._id || c.id} value={c._id || c.id} className="text-white/90 hover:bg-white/15 focus:bg-white/15">{c.name} — {c.business_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Title *</Label>
                  <Input
                    value={editMeeting.title}
                    onChange={(e) => setEditMeeting({ ...editMeeting, title: e.target.value })}
                    required
                    className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Date *</Label>
                  <Input
                    type="date"
                    value={editMeeting.date}
                    onChange={(e) => setEditMeeting({ ...editMeeting, date: e.target.value })}
                    required
                    className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Time *</Label>
                  <Input
                    type="time"
                    value={editMeeting.time}
                    onChange={(e) => setEditMeeting({ ...editMeeting, time: e.target.value })}
                    required
                    className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Notes</Label>
                  <Textarea
                    rows={3}
                    value={editMeeting.notes}
                    onChange={(e) => setEditMeeting({ ...editMeeting, notes: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" className="text-white hover:bg-white/10 rounded-xl" onClick={() => setIsEditMeetingOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 rounded-xl px-6">Update</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Project Detail Modal */}
      <Dialog open={isProjectDetailOpen} onOpenChange={setIsProjectDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl text-white">
          <div className="sticky top-0 z-20 h-20 bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-cyan-500/20 border-b border-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_40%)]" />
            <div className="relative px-6 pt-6">
              <h3 className="text-xl font-semibold text-white/90">Project Details</h3>
              <p className="text-sm text-white/60">View project information and documents</p>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[calc(90vh-10rem)]">
            {viewingProject && (
              <div className="px-6 py-5 space-y-6">
              {/* Project Header */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white/90 mb-2">{viewingProject.name}</h2>
                    <div className="flex items-center gap-4 text-sm text-white/70">
                      <span>Client: {viewingProject.client_id?.name} — {viewingProject.client_id?.business_name}</span>
                      <span>•</span>
                      <span>Status: <Badge className={`px-2 py-1 rounded-full ${projectStatusColors[viewingProject.status] || ''}`}>{viewingProject.status}</Badge></span>
                      <span>•</span>
                      <span>Priority: <Badge className="px-2 py-1 rounded-full bg-orange-100 text-orange-800">{viewingProject.priority}</Badge></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white/60">Progress</div>
                    <div className="text-2xl font-bold text-emerald-400">{viewingProject.progress || 0}%</div>
                  </div>
                </div>
                
                {viewingProject.description && (
                  <div className="mb-4">
                    <div className="text-sm text-white/60 mb-2">Description</div>
                    <div className="text-white/80 bg-white/5 rounded-lg p-3 border border-white/10">{viewingProject.description}</div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-xs text-white/60 mb-1">Start Date</div>
                    <div className="text-white/90">{viewingProject.start_date ? new Date(viewingProject.start_date).toLocaleDateString() : '—'}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-xs text-white/60 mb-1">Due Date</div>
                    <div className="text-white/90">{viewingProject.due_date ? new Date(viewingProject.due_date).toLocaleDateString() : '—'}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-xs text-white/60 mb-1">Assigned To</div>
                    <div className="text-white/90">{viewingProject.assigned_to || '—'}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-xs text-white/60 mb-1">Created</div>
                    <div className="text-white/90">{viewingProject.createdAt ? new Date(viewingProject.createdAt).toLocaleDateString() : '—'}</div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white/90">Documents</h3>
                  <div className="text-sm text-white/60">{viewingProject.documents?.length || 0} files</div>
                </div>
                
                {viewingProject.documents && viewingProject.documents.length > 0 ? (
                  <div className="space-y-3">
                    {viewingProject.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-sky-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-sky-400 text-lg">📄</span>
                          </div>
                          <div>
                            <div className="text-white/90 font-medium">{doc.originalName}</div>
                            <div className="text-white/60 text-sm">
                              {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-sky-400 hover:bg-sky-500/10 rounded-lg"
                            onClick={() => window.open(`http://localhost:5000/${doc.path}`, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:bg-red-400/10 rounded-lg"
                            onClick={async () => {
                              if (!window.confirm('Delete this document?')) return;
                              try {
                                await axios.delete(`${API}/projects/${viewingProject._id || viewingProject.id}/documents/${doc._id}`);
                                toast.success('Document deleted');
                                
                                // Update the viewing project immediately by removing the deleted document
                                setViewingProject(prev => ({
                                  ...prev,
                                  documents: prev.documents.filter(d => d._id !== doc._id)
                                }));
                                
                                // Refresh the projects list
                                fetchProjects();
                              } catch (e) {
                                console.error('Delete document error:', e);
                                toast.error('Failed to delete document');
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/60">
                    <div className="text-4xl mb-2">📁</div>
                    <div className="text-lg mb-1">No documents attached</div>
                    <div className="text-sm">Documents will appear here when uploaded</div>
                  </div>
                )}
              </div>

              {/* Upload New Documents */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white/90 mb-4">Upload New Documents</h3>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-4 hover:border-white/30 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                    className="hidden"
                    id="project-detail-files"
                  />
                  <label htmlFor="project-detail-files" className="cursor-pointer block text-center">
                    <div className="text-white/60 hover:text-white/80 transition-colors">
                      <div className="text-lg mb-2">📁 Click to upload files</div>
                      <div className="text-sm">PDF, Word, Excel, Images (Max 10MB each)</div>
                    </div>
                  </label>
                </div>
                
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="text-sm text-white/70">Files to upload:</div>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-sky-400 text-sm">📄</span>
                          </div>
                          <div>
                            <div className="text-white/90 text-sm font-medium">{file.name}</div>
                            <div className="text-white/60 text-xs">{formatFileSize(file.size)}</div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:bg-red-400/10 rounded-lg"
                          onClick={() => removeFile(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      className="w-full bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 rounded-xl"
                      onClick={async () => {
                        try {
                          const formData = new FormData();
                          selectedFiles.forEach(file => {
                            formData.append('documents', file);
                          });
                          
                          await axios.post(`${API}/projects/${viewingProject._id || viewingProject.id}/documents`, formData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                          });
                          
                          toast.success('Documents uploaded successfully');
                          setSelectedFiles([]);
                          fetchProjects();
                          
                          // Update the viewing project
                          const updatedProject = projects.find(p => p._id === viewingProject._id || p.id === viewingProject.id);
                          if (updatedProject) {
                            setViewingProject(updatedProject);
                          }
                        } catch (err) {
                          toast.error('Failed to upload documents');
                        }
                      }}
                    >
                      Upload Documents
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
          
          <div className="sticky bottom-0 bg-gradient-to-t from-white/5 to-transparent px-6 py-4 border-t border-white/10">
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 rounded-xl"
                onClick={() => {
                  setIsProjectDetailOpen(false);
                  setSelectedFiles([]);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Lead Dialog */}
      <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] p-0 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl text-white">
          <div className="relative h-24 bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-sky-500/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_40%)]" />
            <div className="relative px-4 pt-4">
              <h3 className="text-lg font-semibold text-white/90">Add New Lead</h3>
              <p className="text-xs text-white/60">Enter lead details to add them to your pipeline</p>
            </div>
          </div>
          <form onSubmit={handleAddLead} className="px-4 py-4 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Full Name *</Label>
                <Input
                  placeholder="John Doe"
                  value={newLead.fullName}
                                          onChange={(e) => handleNewLeadChange('fullName', e.target.value)}
                  required
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Email</Label>
                <Input
                  type="email"
                  placeholder="john@company.com"
                  value={newLead.email}
                                          onChange={(e) => handleNewLeadChange('email', e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Phone</Label>
                <Input
                  placeholder="+1 555 123 4567"
                  value={newLead.phone}
                                          onChange={(e) => handleNewLeadChange('phone', e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Company</Label>
                <Input
                  placeholder="Acme Inc."
                  value={newLead.company}
                                          onChange={(e) => handleNewLeadChange('company', e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Source</Label>
                <Select value={newLead.source} onValueChange={(v) => setNewLead({ ...newLead, source: v })}>
                  <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-xl text-sm">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl">
                    {leadSourceOptions.map((s) => (
                      <SelectItem key={s} value={s} className="text-white/90 hover:bg-white/15 focus:bg-white/15 capitalize">{s.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Priority</Label>
                <Select value={newLead.priority} onValueChange={(v) => setNewLead({ ...newLead, priority: v })}>
                  <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-xl text-sm">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl">
                    {leadPriorityOptions.map((s) => (
                      <SelectItem key={s} value={s} className="text-white/90 hover:bg-white/15 focus:bg-white/15 capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Estimated Value</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={newLead.estimated_value}
                                          onChange={(e) => handleNewLeadChange('estimated_value', e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Currency</Label>
                <Input
                  placeholder="USD"
                  value={newLead.currency}
                                          onChange={(e) => handleNewLeadChange('currency', e.target.value)}
                  maxLength={3}
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition text-sm"
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Notes</Label>
                <Textarea
                  rows={3}
                  placeholder="Additional information about the lead..."
                  value={newLead.notes}
                                          onChange={(e) => handleNewLeadChange('notes', e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" className="text-white hover:bg-white/10 rounded-xl text-sm" onClick={() => setIsAddLeadOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl px-4 text-sm">Save Lead</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog open={isEditLeadOpen} onOpenChange={setIsEditLeadOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] p-0 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl text-white">
          <div className="relative h-24 bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-sky-500/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_40%)]" />
            <div className="relative px-4 pt-4">
              <h3 className="text-lg font-semibold text-white/90">Edit Lead</h3>
              <p className="text-xs text-white/60">Update lead details</p>
            </div>
          </div>
          {editLead && (
            <form onSubmit={handleUpdateLead} className="px-4 py-4 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Full Name *</Label>
                  <Input
                    placeholder="John Doe"
                    value={editLead.fullName}
                                            onChange={(e) => handleEditLeadChange('fullName', e.target.value)}
                    required
                    className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Email</Label>
                  <Input
                    type="email"
                    placeholder="john@company.com"
                    value={editLead.email}
                                            onChange={(e) => handleEditLeadChange('email', e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Phone</Label>
                  <Input
                    placeholder="+1 555 123 4567"
                    value={editLead.phone}
                                            onChange={(e) => handleEditLeadChange('phone', e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Company</Label>
                  <Input
                    placeholder="Acme Inc."
                    value={editLead.company}
                                            onChange={(e) => handleEditLeadChange('company', e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Source</Label>
                  <Select value={editLead.source} onValueChange={(v) => setEditLead({ ...editLead, source: v })}>
                    <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-xl text-sm">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl">
                      {leadSourceOptions.map((s) => (
                        <SelectItem key={s} value={s} className="text-white/90 hover:bg-white/15 focus:bg-white/15 capitalize">{s.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Status</Label>
                  <Select value={editLead.status} onValueChange={(v) => setEditLead({ ...editLead, status: v })}>
                    <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-xl text-sm">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl">
                      {leadStatusOptions.map((s) => (
                        <SelectItem key={s} value={s} className="text-white/90 hover:bg-white/15 focus:bg-white/15 capitalize">{s.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Priority</Label>
                  <Select value={editLead.priority} onValueChange={(v) => setEditLead({ ...editLead, priority: v })}>
                    <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-xl text-sm">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl">
                      {leadPriorityOptions.map((s) => (
                        <SelectItem key={s} value={s} className="text-white/90 hover:bg-white/15 focus:bg-white/15 capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Estimated Value</Label>
                  <Input
                    type="number"
                    placeholder="50000"
                    value={editLead.estimated_value}
                                            onChange={(e) => handleEditLeadChange('estimated_value', e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Currency</Label>
                  <Input
                    placeholder="USD"
                    value={editLead.currency}
                                            onChange={(e) => handleEditLeadChange('currency', e.target.value)}
                    maxLength={3}
                    className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition text-sm"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Notes</Label>
                  <Textarea
                    rows={3}
                    placeholder="Additional information about the lead..."
                    value={editLead.notes}
                                            onChange={(e) => handleEditLeadChange('notes', e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" className="text-white hover:bg-white/10 rounded-xl text-sm" onClick={() => setIsEditLeadOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl px-4 text-sm">Update Lead</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Lead Dialog */}
      <Dialog open={isViewLeadOpen} onOpenChange={setIsViewLeadOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl text-white">
          {selectedLead && (
            <div>
              <div className="relative h-20 bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-sky-500/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_40%)]" />
                <div className="relative px-6 pt-4">
                  <h3 className="text-lg font-semibold text-white/90">{selectedLead.fullName}</h3>
                  <p className="text-sm text-white/70">{selectedLead.company || 'No company'}</p>
                </div>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedLead.email && (
                    <div className="space-y-1">
                      <div className="text-xs text-white/60 uppercase tracking-wider">Email</div>
                      <div className="text-white/90">{selectedLead.email}</div>
                    </div>
                  )}
                  {selectedLead.phone && (
                    <div className="space-y-1">
                      <div className="text-xs text-white/60 uppercase tracking-wider">Phone</div>
                      <div className="text-white/90">{selectedLead.phone}</div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="text-xs text-white/60 uppercase tracking-wider">Source</div>
                    <div className="text-white/90 capitalize">{selectedLead.source?.replace('_', ' ')}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-white/60 uppercase tracking-wider">Status</div>
                    <Badge className={`px-2 py-1 rounded-full ${leadStatusColors[selectedLead.status] || ''}`}>
                      {selectedLead.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-white/60 uppercase tracking-wider">Priority</div>
                    <Badge className={`px-2 py-1 rounded-full ${leadPriorityColors[selectedLead.priority] || ''}`}>
                      {selectedLead.priority}
                    </Badge>
                  </div>
                  {selectedLead.estimated_value && (
                    <div className="space-y-1">
                      <div className="text-xs text-white/60 uppercase tracking-wider">Estimated Value</div>
                      <div className="text-white/90">{selectedLead.currency} {selectedLead.estimated_value.toLocaleString()}</div>
                    </div>
                  )}
                </div>
                {selectedLead.notes && (
                  <div className="space-y-1">
                    <div className="text-xs text-white/60 uppercase tracking-wider">Notes</div>
                    <div className="text-white/90 bg-white/5 rounded-lg p-3 border border-white/10">{selectedLead.notes}</div>
                  </div>
                )}
                <div className="space-y-1">
                  <div className="text-xs text-white/60 uppercase tracking-wider">Created</div>
                  <div className="text-white/90">{selectedLead.createdAt ? new Date(selectedLead.createdAt).toLocaleDateString() : ''}</div>
                </div>
              </div>
              <div className="px-6 pb-6 flex items-center justify-end gap-3">
                <Button variant="ghost" className="text-white hover:bg-white/10 rounded-xl" onClick={() => setIsViewLeadOpen(false)}>Close</Button>
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl"
                  onClick={() => {
                    setIsViewLeadOpen(false);
                    setEditingLead(selectedLead);
                    setEditLead({
                      fullName: selectedLead.fullName || '',
                      email: selectedLead.email || '',
                      phone: selectedLead.phone || '',
                      company: selectedLead.company || '',
                      source: selectedLead.source || 'website',
                      status: selectedLead.status || 'new',
                      priority: selectedLead.priority || 'medium',
                      notes: selectedLead.notes || '',
                      estimated_value: selectedLead.estimated_value || '',
                      currency: selectedLead.currency || 'USD'
                    });
                    setIsEditLeadOpen(true);
                  }}>Edit</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Import Leads Dialog */}
      <Dialog open={isImportLeadsOpen} onOpenChange={setIsImportLeadsOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl text-white">
          <div className="relative h-20 bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-sky-500/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_40%)]" />
            <div className="relative px-6 pt-4">
              <h3 className="text-lg font-semibold text-white/90">Import Leads</h3>
              <p className="text-sm text-white/70">Upload CSV or Excel file to import multiple leads</p>
            </div>
          </div>
          <form onSubmit={handleImportLeads} className="px-6 py-5 space-y-5">
                          <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">File Upload</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                    onClick={() => {
                      const csvContent = 'fullname,email,phone,company,source,status,priority,notes,estimated_value,currency\nJohn Doe,john@example.com,+1234567890,Acme Inc.,website,new,medium,Interested in our services,50000,USD\nJane Smith,jane@company.com,+1987654321,Tech Corp,referral,contacted,high,Referred by existing client,75000,USD';
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', 'leads-template.csv');
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                      window.URL.revokeObjectURL(url);
                      toast.success('Template downloaded successfully');
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download Template
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">File Upload</Label>
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-4 hover:border-white/30 transition-colors">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => setImportFile(e.target.files[0])}
                      className="hidden"
                      id="import-leads-file"
                    />
                    <label htmlFor="import-leads-file" className="cursor-pointer block text-center">
                      <div className="text-white/60 hover:text-white/80 transition-colors">
                        <div className="text-lg mb-2">📁 Click to upload file</div>
                        <div className="text-sm">CSV or Excel files only (Max 10MB)</div>
                      </div>
                    </label>
                  </div>
                  {importFile && (
                    <div className="text-sm text-white/70">
                      Selected: {importFile.name} ({(importFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>
              
              {isImporting && (
                <div className="space-y-2">
                  <div className="text-sm text-white/70">Importing leads...</div>
                  <Progress value={importProgress} className="w-full" />
                </div>
              )}
              
              {importResults && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-sm text-white/70 mb-2">Import Results:</div>
                  <div className="space-y-1 text-sm">
                    <div className="text-emerald-400">✓ {importResults.imported} leads imported successfully</div>
                    <div className="text-yellow-400">⚠ {importResults.skipped} leads skipped</div>
                    <div className="text-red-400">✗ {importResults.errors.length} rows had errors</div>
                  </div>
                  {importResults.errors.length > 0 && (
                    <div className="mt-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="text-sm text-red-400 mb-2">Error Details:</div>
                      <div className="space-y-1 text-xs text-red-300 max-h-32 overflow-y-auto">
                        {importResults.errors.map((error, index) => (
                          <div key={index}>Row {error.row}: {error.error}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end gap-3 pt-1">
              <Button type="button" variant="ghost" className="text-white hover:bg-white/10 rounded-xl" onClick={() => setIsImportLeadsOpen(false)}>Cancel</Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl px-6"
                disabled={!importFile || isImporting}
              >
                {isImporting ? 'Importing...' : 'Import Leads'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/forgot" element={<ForgotPassword />} />
            <Route path="/auth/reset" element={<ResetPassword />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
                <ChatBot />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;