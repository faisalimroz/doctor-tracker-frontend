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
import {
  Search,
  Users,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  Mail,
  User,
  Heart,
  Stethoscope,
  Activity,
  AlertCircle,
} from 'lucide-react';

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
}

interface Patient {
  _id: string;
  name: string;
  condition: string;
  contactInfo: string;
  admissionDate: string;
  doctorId: Doctor | string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const CONDITIONS = [
  { value: 'all', label: 'All Conditions' },
  { value: 'Chronic Migraine', label: 'Chronic Migraine' },
  { value: 'Epilepsy', label: 'Epilepsy' },
  { value: 'Acute Appendicitis', label: 'Acute Appendicitis' },
  { value: 'Asthma Exacerbation', label: 'Asthma Exacerbation' },
  { value: 'Heart Failure', label: 'Heart Failure' },
  { value: 'Pneumonia', label: 'Pneumonia' },
];

function PatientsPageContent() {
  const { token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get('search') || '';
  const conditionQuery = searchParams.get('condition') || 'all';
  const pageQuery = parseInt(searchParams.get('page') || '1', 10);


  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);


  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  
  const [editForm, setEditForm] = useState({
    name: '',
    condition: '',
    contactInfo: '',
    admissionDate: '',
    doctorId: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Fetch patients list
  const fetchPatients = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (conditionQuery && conditionQuery !== 'all') params.set('condition', conditionQuery);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      params.set('page', pageQuery.toString());
      params.set('limit', '8');

      const res = await fetch(`${API_URL}/patients?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPatients(data.data);
        setTotal(data.total);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctors for the dropdown
  const fetchDoctorsDropdown = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/doctors?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDoctorsList(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [token, searchQuery, conditionQuery, pageQuery, startDate, endDate]);

  useEffect(() => {
    if (token) {
      fetchDoctorsDropdown();
    }
  }, [token]);

  
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


  const handleDeletePatient = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this patient record?')) return;

    try {
      const res = await fetch(`${API_URL}/patients/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchPatients();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormError(null);
    
    const docId = typeof patient.doctorId === 'object' ? patient.doctorId._id : patient.doctorId;
    
    const dateStr = patient.admissionDate ? new Date(patient.admissionDate).toISOString().split('T')[0] : '';

    setEditForm({
      name: patient.name,
      condition: patient.condition,
      contactInfo: patient.contactInfo,
      admissionDate: dateStr,
      doctorId: docId || '',
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;
    setFormError(null);
    setSubmittingEdit(true);

    try {
      const res = await fetch(`${API_URL}/patients/${editingPatient._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editForm,
          admissionDate: editForm.admissionDate ? new Date(editForm.admissionDate).toISOString() : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditOpen(false);
        fetchPatients();
      } else {
        setFormError(data.message || 'Failed to update patient');
      }
    } catch (err) {
      setFormError('Network connection failed');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const totalPages = Math.ceil(total / 8) || 1;

  
  const doctorOptions = doctorsList.map((doc) => ({
    value: doc._id,
    label: `${doc.name} (${doc.specialization})`,
  }));

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Clinical Registry</h1>
        <p className="text-muted-foreground text-sm mt-1">Master list of admitted patients, diagnosis logs, and doctor assignments.</p>
      </div>


      <Card className="border-border">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients, contact info..."
                value={searchQuery}
                onChange={(e) => updateURL({ search: e.target.value })}
                className="pl-9"
              />
            </div>
            
            
            <Select
              options={CONDITIONS}
              value={conditionQuery}
              onChange={(e) => updateURL({ condition: e.target.value })}
            />

            
            <div className="flex gap-2">
              <div className="grid grid-cols-2 gap-2 flex-1">
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-[10px] font-bold text-muted-foreground uppercase">From</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); updateURL({ startDate: e.target.value }); }}
                    className="w-full h-10 border border-input rounded-md pl-12 pr-2 text-xs bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-[10px] font-bold text-muted-foreground uppercase">To</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); updateURL({ endDate: e.target.value }); }}
                    className="w-full h-10 border border-input rounded-md pl-10 pr-2 text-xs bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
              {(startDate || endDate || searchQuery || conditionQuery !== 'all') && (
                <Button variant="outline" size="sm" onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  router.push(pathname);
                }} className="text-xs">
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

    
      <Card className="border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient Name</TableHead>
              <TableHead>Diagnosis / Condition</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Admission Date</TableHead>
              <TableHead>Assigned Physician</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                  <Activity className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                  <span>Loading patient records...</span>
                </TableCell>
              </TableRow>
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No patient logs found matching the query.
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => {
                const doc = typeof patient.doctorId === 'object' ? patient.doctorId : null;
                return (
                  <TableRow key={patient._id}>
                    {/* Name */}
                    <TableCell className="font-semibold text-foreground flex items-center gap-2.5">
                      <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500">
                        <User className="h-4 w-4" />
                      </div>
                      <span>{patient.name}</span>
                    </TableCell>

              
                    <TableCell>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Heart className="h-3.5 w-3.5 shrink-0" />
                        {patient.condition}
                      </span>
                    </TableCell>

          
                    <TableCell className="text-xs text-muted-foreground font-medium space-y-0.5">
                      {patient.contactInfo.includes('@') ? (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span>{patient.contactInfo}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 font-sans">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>{patient.contactInfo}</span>
                        </div>
                      )}
                    </TableCell>

                
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        {new Date(patient.admissionDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          timeZone: 'UTC', 
                        })}
                      </span>
                    </TableCell>

                    <TableCell>
                      {doc ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                            <Stethoscope className="h-3.5 w-3.5 text-primary shrink-0" />
                            {doc.name}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5 pl-4.5">{doc.specialization}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-destructive font-semibold">Unassigned</span>
                      )}
                    </TableCell>

            
                    <TableCell className="text-right space-x-1.5">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(patient)} className="p-2 cursor-pointer" title="Edit Patient">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeletePatient(patient._id)} className="p-2 text-destructive hover:bg-destructive/10 cursor-pointer" title="Delete Patient">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination  */}
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-muted/20">
            <span className="text-xs text-muted-foreground font-medium">
              Page {pageQuery} of {totalPages} (Total {total} patients)
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

      {/* Modal: Edit Patient */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modify Patient Information">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Patient Name</label>
            <Input
              placeholder="John Doe"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Diagnosis / Condition</label>
            <Input
              placeholder="Chronic Migraine"
              value={editForm.condition}
              onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Contact Info</label>
            <Input
              placeholder="johndoe@example.com / 555-0100"
              value={editForm.contactInfo}
              onChange={(e) => setEditForm({ ...editForm, contactInfo: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Admission Date</label>
            <Input
              type="date"
              value={editForm.admissionDate}
              onChange={(e) => setEditForm({ ...editForm, admissionDate: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Assigned Practitioner</label>
            {doctorOptions.length === 0 ? (
              <p className="text-xs text-destructive">No doctors registered to assign.</p>
            ) : (
              <Select
                options={doctorOptions}
                value={editForm.doctorId}
                onChange={(e) => setEditForm({ ...editForm, doctorId: e.target.value })}
              />
            )}
          </div>
          <div className="pt-2 border-t border-border flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submittingEdit}>
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export default function PatientsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Activity className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Loading clinical registry...</p>
        </div>
      </div>
    }>
      <PatientsPageContent />
    </Suspense>
  );
}
