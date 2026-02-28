import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, studentService, attendanceService, classService } from '../services/api';
import { toast } from 'sonner';

export type UserRole = 'student' | 'admin';
export type Program = 'GBK' | 'GB1' | 'GB2' | 'GB3';
export type BeltColor = 'White' | 'Grey' | 'Yellow' | 'Orange' | 'Green' | 'Blue' | 'Purple' | 'Brown' | 'Black';

export interface SpecialDate {
  id?: string;
  _id?: string;
  date: string;
  type: 'graduation' | 'grade';
  notes?: string;
}

export interface Student {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  program: Program;
  belt: BeltColor;
  degrees: number;
  lastGraduationDate: string;
  nextDegreeDate: string;
  birthDate: string;
  specialDates: SpecialDate[];
}

export interface Attendance {
  id?: string;
  _id?: string;
  studentId: string;
  date: string;
  classId: string;
  className: string;
  classTime: string;
  confirmed: boolean;
}

export interface JJClass {
  id?: string;
  _id?: string;
  name: string;
  time: string;
  instructor: string;
  daysOfWeek: number[];
}

export interface UserAccount {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  studentId?: string;
}

interface DataContextType {
  currentUser: UserAccount | null;
  students: Student[];
  attendance: Attendance[];
  classes: JJClass[];
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkIn: (studentId: string, classId: string, className: string, classTime: string) => Promise<void>;
  confirmAttendance: (attendanceId: string) => Promise<void>;
  rejectAttendance: (attendanceId: string) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  addStudent: (student: Omit<Student, 'id'>, email: string, password: string) => Promise<void>;
  addSpecialDate: (studentId: string, date: string, type: 'graduation' | 'grade', notes?: string) => Promise<void>;
  removeSpecialDate: (studentId: string, specialDateId: string) => Promise<void>;
  updateSpecialDates: (studentId: string, specialDates: SpecialDate[]) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [classes, setClasses] = useState<JJClass[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar dados quando autenticado
  const loadData = async () => {
    const token = localStorage.getItem('gb_auth_token');
    if (!token) return;

    try {
      setLoading(true);
      const [studentsData, attendanceData, classesData] = await Promise.all([
        studentService.getAll(),
        attendanceService.getAll(),
        classService.getAll(),
      ]);

      // Normalizar IDs
      setStudents(studentsData.map((s: any) => ({ ...s, id: s._id || s.id })));
      setAttendance(attendanceData.map((a: any) => ({ ...a, id: a._id || a.id })));
      setClasses(classesData.map((c: any) => ({ ...c, id: c._id || c.id })));
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      if (error.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Restaurar usuário ao carregar página
  useEffect(() => {
    const savedUser = localStorage.getItem('gb_current_user');
    const token = localStorage.getItem('gb_auth_token');
    
    if (savedUser && token) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        loadData();
      } catch (error) {
        console.error('Erro ao restaurar usuário:', error);
        localStorage.removeItem('gb_current_user');
        localStorage.removeItem('gb_auth_token');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      
      localStorage.setItem('gb_auth_token', response.token);
      localStorage.setItem('gb_current_user', JSON.stringify(response.user));
      setCurrentUser(response.user);
      
      await loadData();
      toast.success(`Bem-vindo, ${response.user.name}!`);
      return true;
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast.error(error.response?.data?.error || 'Erro ao fazer login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('gb_auth_token');
    localStorage.removeItem('gb_current_user');
    setCurrentUser(null);
    setStudents([]);
    setAttendance([]);
    setClasses([]);
  };

  const checkIn = async (studentId: string, classId: string, className: string, classTime: string) => {
    try {
      const newAttendance = await attendanceService.create({
        studentId,
        classId,
        className,
        classTime,
        date: new Date().toISOString(),
        confirmed: false,
      });
      
      setAttendance([...attendance, { ...newAttendance, id: newAttendance._id || newAttendance.id }]);
      toast.success('Check-in realizado! Aguarde confirmação do professor.');
    } catch (error: any) {
      console.error('Erro no check-in:', error);
      toast.error(error.response?.data?.error || 'Erro ao fazer check-in');
    }
  };

  const confirmAttendance = async (attendanceId: string) => {
    try {
      await attendanceService.update(attendanceId, { confirmed: true });
      setAttendance(attendance.map(a => 
        (a.id === attendanceId || a._id === attendanceId) ? { ...a, confirmed: true } : a
      ));
      toast.success('Presença confirmada!');
    } catch (error: any) {
      console.error('Erro ao confirmar presença:', error);
      toast.error(error.response?.data?.error || 'Erro ao confirmar presença');
    }
  };

  const rejectAttendance = async (attendanceId: string) => {
    try {
      // Por enquanto, vamos remover localmente
      // TODO: Adicionar endpoint DELETE no backend
      setAttendance(attendance.filter(a => a.id !== attendanceId && a._id !== attendanceId));
      toast.info('Check-in removido.');
    } catch (error: any) {
      console.error('Erro ao rejeitar presença:', error);
      toast.error('Erro ao remover check-in');
    }
  };

  const updateStudent = async (student: Student) => {
    try {
      const studentId = student.id || student._id;
      if (!studentId) throw new Error('ID do aluno não encontrado');
      
      const updated = await studentService.update(studentId, student);
      setStudents(students.map(s => 
        (s.id === studentId || s._id === studentId) ? { ...updated, id: updated._id || updated.id } : s
      ));
      toast.success('Aluno atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar aluno:', error);
      toast.error(error.response?.data?.error || 'Erro ao atualizar aluno');
    }
  };

  const addStudent = async (student: Omit<Student, 'id'>, email: string, password: string) => {
    try {
      const newStudent = await studentService.create(student);
      setStudents([...students, { ...newStudent, id: newStudent._id || newStudent.id }]);
      toast.success('Aluno adicionado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao adicionar aluno:', error);
      toast.error(error.response?.data?.error || 'Erro ao adicionar aluno');
    }
  };

  const addSpecialDate = async (studentId: string, date: string, type: 'graduation' | 'grade', notes?: string) => {
    try {
      const student = students.find(s => s.id === studentId || s._id === studentId);
      if (!student) throw new Error('Aluno não encontrado');
      
      const newSpecialDate: SpecialDate = {
        id: `sd-${Date.now()}`,
        date,
        type,
        notes,
      };
      
      const updatedStudent = {
        ...student,
        specialDates: [...student.specialDates, newSpecialDate],
      };
      
      await updateStudent(updatedStudent);
    } catch (error: any) {
      console.error('Erro ao adicionar data especial:', error);
      toast.error('Erro ao adicionar data especial');
    }
  };

  const removeSpecialDate = async (studentId: string, specialDateId: string) => {
    try {
      const student = students.find(s => s.id === studentId || s._id === studentId);
      if (!student) throw new Error('Aluno não encontrado');
      
      const updatedStudent = {
        ...student,
        specialDates: student.specialDates.filter(sd => sd.id !== specialDateId && sd._id !== specialDateId),
      };
      
      await updateStudent(updatedStudent);
    } catch (error: any) {
      console.error('Erro ao remover data especial:', error);
      toast.error('Erro ao remover data especial');
    }
  };

  const updateSpecialDates = async (studentId: string, specialDates: SpecialDate[]) => {
    try {
      const student = students.find(s => s.id === studentId || s._id === studentId);
      if (!student) throw new Error('Aluno não encontrado');
      
      const updatedStudent = {
        ...student,
        specialDates,
      };
      
      await updateStudent(updatedStudent);
    } catch (error: any) {
      console.error('Erro ao atualizar datas especiais:', error);
      toast.error('Erro ao atualizar datas especiais');
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  return (
    <DataContext.Provider
      value={{
        currentUser,
        students,
        attendance,
        classes,
        loading,
        login,
        logout,
        checkIn,
        confirmAttendance,
        rejectAttendance,
        updateStudent,
        addStudent,
        addSpecialDate,
        removeSpecialDate,
        updateSpecialDates,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
