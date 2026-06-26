import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Student {
  id: string;
  name: string;
  created_at: string;
}

export interface Teacher {
  id: string;
  name: string;
  picture_url: string;
  created_at: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  created_at: string;
  created_by_admin: boolean;
}

// Student operations
export async function getStudents() {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Student[];
}

export async function addStudent(name: string) {
  const { data, error } = await supabase
    .from('students')
    .insert([{ name }])
    .select();
  
  if (error) throw error;
  return data[0] as Student;
}

export async function deleteStudent(id: string) {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Teacher operations
export async function getTeachers() {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Teacher[];
}

export async function addTeacher(name: string, pictureUrl: string) {
  const { data, error } = await supabase
    .from('teachers')
    .insert([{ name, picture_url: pictureUrl }])
    .select();
  
  if (error) throw error;
  return data[0] as Teacher;
}

export async function deleteTeacher(id: string) {
  const { error } = await supabase
    .from('teachers')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Assignment operations
export async function getAssignments() {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Assignment[];
}

export async function addAssignment(title: string, description: string) {
  const { data, error } = await supabase
    .from('assignments')
    .insert([{ title, description, created_by_admin: true }])
    .select();
  
  if (error) throw error;
  return data[0] as Assignment;
}

export async function deleteAssignment(id: string) {
  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Upload teacher picture to storage
export async function uploadTeacherPicture(file: File, teacherId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${teacherId}-${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('teacher-pictures')
    .upload(fileName, file, { upsert: true });
  
  if (uploadError) throw uploadError;
  
  const { data } = supabase.storage
    .from('teacher-pictures')
    .getPublicUrl(fileName);
  
  return data.publicUrl;
}
