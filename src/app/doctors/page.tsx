'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Search, Plus, Eye, Stethoscope, Phone, Mail, Building, Trash2, Calendar, AlertCircle, Activity } from 'lucide-react';

interface Patient {
  _id: string;
  name: string;
  condition: string;
  contactInfo: string;
  admissionDate: string;
}

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  patientCount: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const SPECIALIZATIONS = [
  { value: 'all', label: 'All Specializations' },
  { value: 'Cardiology', label: 'Cardiology' },
  { value: 'General Surgery', label: 'General Surgery' },
  { value: 'Neurology', label: 'Neurology' },
  { value: 'Oncology', label: 'Oncology' },
  { value: 'Pediatrics', label: 'Pediatrics' },
];

function DoctorsPageContent() {
  const { token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();


  const searchQuery = searchParams.get('search') || '';
  const specQuery = searchParams.get('specialization') || 'all';
  const pageQuery = parseInt(searchParams.get('page') || '1', 10);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [specializations, setSpecializations] = useState(SPECIALIZATIONS);

  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctorPatients, setDoctorPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  const [newDoc, setNewDoc] = useState({ name: '', specialization: 'Cardiology', hospital: '', phone: '', email: '' });
  const [newPatient, setNewPatient] = useState({ name: '', condition: '', contactInfo: '', admissionDate: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [submittingDoc, setSubmittingDoc] = useState(false);
  const [submittingPatient, setSubmittingPatient] = useState(false);

  // Fetch doctors list
  const fetchDoctors = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (specQuery && specQuery !== 'all') params.set('specialization', specQuery);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      params.set('page', pageQuery.toString());
      params.set('limit', '8');

      const res = await fetch(`${API_URL}/doctors?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDoctors(data.data);
        setTotal(data.total);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [token, searchQuery, specQuery, pageQuery, startDate, endDate]);


  const updateURL = (newParams: Record<string, string | number | null>) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value.toString());
      }
    });

    if (!newParams.page && newParams.page !== 0) {
      nextParams.set('page', '1');
    }
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  // Add new doctor
  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmittingDoc(true);

    try {
      const res = await fetch(`${API_URL}/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newDoc),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddOpen(false);
        setNewDoc({ name: '', specialization: 'Cardiology', hospital: '', phone: '', email: '' });
        fetchDoctors();
      } else {
        setFormError(data.message || 'Failed to create doctor');
      }
    } catch (err) {
      setFormError('Network connection failed');
    } finally {
      setSubmittingDoc(false);
    }
  };

  // Open doctor patients modal
  const handleOpenPatients = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setLoadingPatients(true);
    setDoctorPatients([]);
    try {
      const res = await fetch(`${API_URL}/doctors/${doctor._id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDoctorPatients(data.data.patients || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPatients(false);
    }
  };

 
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    setFormError(null);
    setSubmittingPatient(true);

    try {
      const res = await fetch(`${API_URL}/doctors/${selectedDoctor._id}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newPatient,
          admissionDate: newPatient.admissionDate ? new Date(newPatient.admissionDate).toISOString() : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewPatient({ name: '', condition: '', contactInfo: '', admissionDate: '' });

        handleOpenPatients(selectedDoctor);
   
        fetchDoctors();
      } else {
        setFormError(data.message || 'Failed to add patient');
      }
    } catch (err) {
      setFormError('Network connection failed');
    } finally {
      setSubmittingPatient(false);
    }
  };

  // Delete patient in modal
  const handleDeletePatient = async (patientId: string) => {
    if (!selectedDoctor) return;
    if (!confirm('Are you sure you want to delete this patient?')) return;

    try {
      const res = await fetch(`${API_URL}/doctors/patients/${patientId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        handleOpenPatients(selectedDoctor);
        fetchDoctors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(total / 8) || 1;

  return (
    <div className="space-y-6">
 
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Doctor Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage doctor profiles and assign corresponding patients.</p>
        </div>
        <Button onClick={() => { setFormError(null); setIsAddOpen(true); }} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Add New Doctor</span>
        </Button>
      </div>

      {/* Filters section */}
      <Card className="border-border">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors, hospitals..."
                value={searchQuery}
                onChange={(e) => updateURL({ search: e.target.value })}
                className="pl-9"
              />
            </div>

          
            <Select
              options={specializations}
              value={specQuery}
              onChange={(e) => updateURL({ specialization: e.target.value })}
            />

            
         {/* Date Filters & Clear Button */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 md:col-span-3 lg:col-span-1">
              
              
              <div className="flex items-center gap-1.5 px-2.5 h-10 border border-input rounded-md bg-transparent flex-1 min-w-[140px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <span className="text-[8px] font-bold text-muted-foreground uppercase shrink-0">From</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); updateURL({ startDate: e.target.value }); }}
                  className="w-full text-xs bg-transparent focus:outline-none border-none p-0 cursor-pointer"
                />
              </div>

     
              <div className="flex items-center gap-1.5 px-2.5 h-10 border border-input rounded-md bg-transparent flex-1 min-w-[140px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <span className="text-[8px] font-bold text-muted-foreground uppercase shrink-0">To</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); updateURL({ endDate: e.target.value }); }}
                  className="w-full text-xs bg-transparent focus:outline-none border-none p-0 cursor-pointer"
                />
              </div>

             
              {(startDate || endDate || searchQuery || specQuery !== 'all') && (
                <Button variant="outline" size="sm" onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  router.push(pathname);
                }} className="text-xs h-10 shrink-0">
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctor list table */}
      <Card className="border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor Name</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Hospital Affiliation</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead className="text-center">Assigned Patients</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                  <Activity className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                  <span>Loading doctors directory...</span>
                </TableCell>
              </TableRow>
            ) : doctors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No doctors found matching the query.
                </TableCell>
              </TableRow>
            ) : (
              doctors.map((doctor) => (
                <TableRow key={doctor._id}>
                  <TableCell className="font-semibold text-foreground flex items-center gap-2.5">
                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    <span>{doctor.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground">
                      {doctor.specialization}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs font-medium">
                    <span className="flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 shrink-0" />
                      {doctor.hospital}
                    </span>
                  </TableCell>
                  <TableCell className="space-y-0.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span>{doctor.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{doctor.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold text-sm text-foreground">
                    {doctor.patientCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleOpenPatients(doctor)} className="inline-flex items-center gap-1.5 cursor-pointer">
                      <Eye className="h-3.5 w-3.5" />
                      <span>Patients</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination  */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-muted/20">
            <span className="text-xs text-muted-foreground font-medium">
              Page {pageQuery} of {totalPages} (Total {total} doctors)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pageQuery <= 1}
                onClick={() => updateURL({ page: pageQuery - 1 })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pageQuery >= totalPages}
                onClick={() => updateURL({ page: pageQuery + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal 1: Add Doctor */}
      <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Doctor">
        <form onSubmit={handleAddDoctor} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Doctor Name</label>
            <Input
              placeholder="Dr. Gregory House"
              value={newDoc.name}
              onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Specialization</label>
            <Select
              options={specializations.filter(s => s.value !== 'all')}
              value={newDoc.specialization}
              onChange={(e) => setNewDoc({ ...newDoc, specialization: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Hospital Affiliation</label>
            <Input
              placeholder="Princeton-Plainsboro Teaching Hospital"
              value={newDoc.hospital}
              onChange={(e) => setNewDoc({ ...newDoc, hospital: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Contact Email</label>
            <Input
              type="email"
              placeholder="house@hospital.org"
              value={newDoc.email}
              onChange={(e) => setNewDoc({ ...newDoc, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Phone Number</label>
            <Input
              placeholder="555-0100"
              value={newDoc.phone}
              onChange={(e) => setNewDoc({ ...newDoc, phone: e.target.value })}
              required
            />
          </div>
          <div className="pt-2 border-t border-border flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submittingDoc}>
              Register Doctor
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal 2: View Patients */}
      <Dialog
        isOpen={!!selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
        title={selectedDoctor ? `Patients of ${selectedDoctor.name}` : 'Doctor Patients'}
      >
        <div className="space-y-6">
         
          {selectedDoctor && (
            <div className="bg-secondary/40 p-4 rounded-lg flex flex-col gap-1 text-xs text-muted-foreground">
              <span className="font-bold text-foreground text-sm">{selectedDoctor.hospital}</span>
              <span>Specialization: <strong className="text-foreground">{selectedDoctor.specialization}</strong></span>
              <span>Contact: {selectedDoctor.email} / {selectedDoctor.phone}</span>
            </div>
          )}

 
          <div className="border-t border-border pt-4">
            <h3 className="font-semibold text-sm mb-3">Add Patient under this Doctor</h3>
            <form onSubmit={handleAddPatient} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Patient Name"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                required
                className="h-9 text-xs"
              />
              <Input
                placeholder="Diagnosis / Condition"
                value={newPatient.condition}
                onChange={(e) => setNewPatient({ ...newPatient, condition: e.target.value })}
                required
                className="h-9 text-xs"
              />
              <Input
                placeholder="Email or Phone Number"
                value={newPatient.contactInfo}
                onChange={(e) => setNewPatient({ ...newPatient, contactInfo: e.target.value })}
                required
                className="h-9 text-xs font-sans"
              />
              <Input
                type="date"
                value={newPatient.admissionDate}
                onChange={(e) => setNewPatient({ ...newPatient, admissionDate: e.target.value })}
                className="h-9 text-xs"
              />
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" size="sm" isLoading={submittingPatient} className="w-full sm:w-auto text-xs py-1.5 h-9">
                  Add Patient
                </Button>
              </div>
            </form>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="font-semibold text-sm mb-3">Currently Admitted</h3>
            {loadingPatients ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                <Activity className="h-4 w-4 animate-spin mx-auto mb-2 text-primary" />
                <span>Loading patient listing...</span>
              </div>
            ) : doctorPatients.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                No patients currently assigned. Use the form above to add.
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto border border-border rounded-lg divide-y divide-border">
                {doctorPatients.map((patient) => (
                  <div key={patient._id} className="flex justify-between items-center p-3 text-xs bg-card hover:bg-muted/30 transition-all">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{patient.name}</p>
                      <p className="text-primary font-medium mt-0.5">{patient.condition}</p>
                      <div className="flex gap-2 text-[10px] text-muted-foreground mt-1 items-center">
                        <span className="truncate max-w-[150px]">{patient.contactInfo}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(patient.admissionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePatient(patient._id)}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all cursor-pointer shrink-0"
                      title="Remove Patient"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Activity className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Loading staff registry...</p>
        </div>
      </div>
    }>
      <DoctorsPageContent />
    </Suspense>
  );
}
