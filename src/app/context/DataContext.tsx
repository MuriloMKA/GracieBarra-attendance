import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'student' | 'admin';
export type Program = 'GBK' | 'GB1' | 'GB2' | 'GB3';
export type BeltColor = 'White' | 'Grey' | 'Yellow' | 'Orange' | 'Green' | 'Blue' | 'Purple' | 'Brown' | 'Black';

export interface SpecialDate {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'graduation' | 'grade';
  notes?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  program: Program;
  belt: BeltColor;
  degrees: number; // 0-4 stripes
  lastGraduationDate: string; // YYYY-MM-DD
  nextDegreeDate: string; // YYYY-MM-DD estimated
  birthDate: string;
  specialDates: SpecialDate[];
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string; // ISO datetime
  classId: string;
  className: string;
  classTime: string;
  confirmed: boolean;
}

export interface JJClass {
  id: string;
  name: string;
  time: string;
  instructor: string;
  daysOfWeek: number[]; // 0=Sun, 1=Mon ... 6=Sat
}

export interface UserAccount {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  studentId?: string;
}

interface DataContextType {
  currentUser: UserAccount | null;
  students: Student[];
  attendance: Attendance[];
  classes: JJClass[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  checkIn: (studentId: string, classId: string, className: string, classTime: string) => void;
  confirmAttendance: (attendanceId: string) => void;
  rejectAttendance: (attendanceId: string) => void;
  updateStudent: (student: Student) => void;
  addStudent: (student: Omit<Student, 'id'>, email: string, password: string) => void;
  addSpecialDate: (studentId: string, date: string, type: 'graduation' | 'grade', notes?: string) => void;
  removeSpecialDate: (studentId: string, specialDateId: string) => void;
  updateSpecialDates: (studentId: string, specialDates: SpecialDate[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Gera datas de presença para 2026 (Jan e Fev)
function makeDates(studentId: string, datesArray: string[], classPattern: Array<{ id: string; name: string; time: string }>): Attendance[] {
  return datesArray.map((d, i) => ({
    id: `att-${studentId}-${i}`,
    studentId,
    date: new Date(`${d}T20:10:00.000Z`).toISOString(),
    classId: classPattern[i % classPattern.length].id,
    className: classPattern[i % classPattern.length].name,
    classTime: classPattern[i % classPattern.length].time,
    confirmed: true,
  }));
}

const CLS = [
  { id: 'c1', name: 'Fundamentos', time: '20:10' },
  { id: 'c3', name: 'Fundamentos', time: '19:00' },
  { id: 'c2', name: 'Avançado', time: '21:00' },
];

const INITIAL_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    program: 'GB1',
    belt: 'White',
    degrees: 1,
    lastGraduationDate: '2025-08-20',
    nextDegreeDate: '2026-05-20',
    birthDate: '1995-02-15',
    specialDates: [
      { id: 'sd1-1', date: '2025-08-20', type: 'graduation', notes: 'Faixa Branca — 1º Grau' },
    ],
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    email: 'maria@example.com',
    program: 'GB1',
    belt: 'White',
    degrees: 3,
    lastGraduationDate: '2025-11-10',
    nextDegreeDate: '2026-04-15',
    birthDate: '1998-06-22',
    specialDates: [
      { id: 'sd2-1', date: '2025-02-15', type: 'graduation', notes: 'Faixa Branca — 1º Grau' },
      { id: 'sd2-2', date: '2025-06-20', type: 'graduation', notes: 'Faixa Branca — 2º Grau' },
      { id: 'sd2-3', date: '2025-11-10', type: 'graduation', notes: 'Faixa Branca — 3º Grau' },
    ],
  },
  {
    id: '3',
    name: 'Carlos Santos',
    email: 'carlos@example.com',
    program: 'GB2',
    belt: 'Blue',
    degrees: 2,
    lastGraduationDate: '2025-06-15',
    nextDegreeDate: '2026-08-15',
    birthDate: '1990-11-30',
    specialDates: [
      { id: 'sd3-1', date: '2023-03-10', type: 'graduation', notes: 'Faixa Azul — 0 Grau' },
      { id: 'sd3-2', date: '2024-01-20', type: 'graduation', notes: 'Faixa Azul — 1º Grau' },
      { id: 'sd3-3', date: '2025-06-15', type: 'graduation', notes: 'Faixa Azul — 2º Grau' },
    ],
  },
  {
    id: '4',
    name: 'Pedro Costa',
    email: 'pedro@example.com',
    program: 'GBK',
    belt: 'Grey',
    degrees: 2,
    lastGraduationDate: '2025-09-05',
    nextDegreeDate: '2026-03-05',
    birthDate: '2014-04-10',
    specialDates: [
      { id: 'sd4-1', date: '2025-03-10', type: 'graduation', notes: 'Faixa Cinza — 1º Grau' },
      { id: 'sd4-2', date: '2025-09-05', type: 'graduation', notes: 'Faixa Cinza — 2º Grau' },
    ],
  },
  {
    id: '5',
    name: 'Ana Pereira',
    email: 'ana@example.com',
    program: 'GB3',
    belt: 'Purple',
    degrees: 1,
    lastGraduationDate: '2024-12-20',
    nextDegreeDate: '2026-12-20',
    birthDate: '1988-07-22',
    specialDates: [
      { id: 'sd5-1', date: '2022-05-10', type: 'graduation', notes: 'Faixa Azul — 0 Grau' },
      { id: 'sd5-2', date: '2023-11-15', type: 'graduation', notes: 'Faixa Roxa — 0 Grau' },
      { id: 'sd5-3', date: '2024-12-20', type: 'graduation', notes: 'Faixa Roxa — 1º Grau' },
    ],
  },
];

const INITIAL_ACCOUNTS: UserAccount[] = [
  { id: 'admin1', email: 'admin@graciebarra.com', password: 'admin123', role: 'admin', name: 'Professor Carlos' },
  { id: 'u1', email: 'joao@example.com', password: 'aluno123', role: 'student', name: 'João Silva', studentId: '1' },
  { id: 'u2', email: 'maria@example.com', password: 'aluno123', role: 'student', name: 'Maria Oliveira', studentId: '2' },
  { id: 'u3', email: 'carlos@example.com', password: 'aluno123', role: 'student', name: 'Carlos Santos', studentId: '3' },
  { id: 'u4', email: 'pedro@example.com', password: 'aluno123', role: 'student', name: 'Pedro Costa', studentId: '4' },
  { id: 'u5', email: 'ana@example.com', password: 'aluno123', role: 'student', name: 'Ana Pereira', studentId: '5' },
];

const INITIAL_CLASSES: JJClass[] = [
  { id: 'c1', name: 'Fundamentos', time: '06:00', instructor: 'Prof. Carlos', daysOfWeek: [1, 2, 3, 4, 5, 6] },
  { id: 'c2', name: 'Open Mat', time: '10:00', instructor: 'Prof. Carlos', daysOfWeek: [6, 0] },
  { id: 'c3', name: 'Fundamentos', time: '19:00', instructor: 'Prof. Carlos', daysOfWeek: [1, 2, 3, 4, 5] },
  { id: 'c4', name: 'Fundamentos', time: '20:10', instructor: 'Prof. Carlos', daysOfWeek: [1, 2, 3, 4, 5] },
  { id: 'c5', name: 'Avançado', time: '21:00', instructor: 'Prof. Carlos', daysOfWeek: [1, 2, 3, 4, 5] },
  { id: 'c6', name: 'GBK — Crianças', time: '09:30', instructor: 'Prof. Carlos', daysOfWeek: [6] },
  { id: 'c7', name: 'GBK — Crianças', time: '18:30', instructor: 'Prof. Carlos', daysOfWeek: [2, 4] },
];

const INITIAL_ATTENDANCE: Attendance[] = [
  // João Silva (1) - White 1 stripe
  ...makeDates('1', [
    '2026-01-03', '2026-01-06', '2026-01-08', '2026-01-10', '2026-01-13',
    '2026-01-15', '2026-01-17', '2026-01-20', '2026-01-22', '2026-01-24',
    '2026-01-27', '2026-01-29', '2026-01-31',
    '2026-02-03', '2026-02-05', '2026-02-10', '2026-02-12', '2026-02-17',
    '2026-02-19', '2026-02-24',
  ], CLS),
  // Maria Oliveira (2) - White 3 stripes
  ...makeDates('2', [
    '2026-01-02', '2026-01-05', '2026-01-07', '2026-01-09', '2026-01-12',
    '2026-01-14', '2026-01-16', '2026-01-19', '2026-01-21', '2026-01-23',
    '2026-01-26', '2026-01-28', '2026-01-30',
    '2026-02-02', '2026-02-04', '2026-02-09', '2026-02-11', '2026-02-16',
    '2026-02-18', '2026-02-23', '2026-02-25',
  ], CLS),
  // Carlos Santos (3) - Blue 2
  ...makeDates('3', [
    '2026-01-06', '2026-01-13', '2026-01-20', '2026-01-27',
    '2026-02-03', '2026-02-10', '2026-02-17', '2026-02-24',
  ], CLS),
  // Pedro Costa (4) - GBK
  ...makeDates('4', [
    '2026-01-03', '2026-01-10', '2026-01-17', '2026-01-24', '2026-01-31',
    '2026-02-07', '2026-02-14', '2026-02-21',
  ], CLS),
  // Ana Pereira (5) - Purple
  ...makeDates('5', [
    '2026-01-07', '2026-01-14', '2026-01-21', '2026-01-28',
    '2026-02-04', '2026-02-11', '2026-02-18',
  ], CLS),
  // Pending check-ins de hoje (Feb 27, 2026)
  {
    id: 'pending-1',
    studentId: '1',
    date: '2026-02-27T20:10:00.000Z',
    classId: 'c4',
    className: 'Fundamentos',
    classTime: '20:10',
    confirmed: false,
  },
  {
    id: 'pending-2',
    studentId: '3',
    date: '2026-02-27T21:00:00.000Z',
    classId: 'c5',
    className: 'Avançado',
    classTime: '21:00',
    confirmed: false,
  },
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts] = useState<UserAccount[]>(INITIAL_ACCOUNTS);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('gb_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('gb_students');
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch { return INITIAL_STUDENTS; }
  });
  const [attendance, setAttendance] = useState<Attendance[]>(() => {
    try {
      const saved = localStorage.getItem('gb_attendance');
      return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
    } catch { return INITIAL_ATTENDANCE; }
  });
  const [classes] = useState<JJClass[]>(INITIAL_CLASSES);

  useEffect(() => {
    if (currentUser) localStorage.setItem('gb_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('gb_current_user');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('gb_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('gb_attendance', JSON.stringify(attendance));
  }, [attendance]);

  const login = (email: string, password: string): boolean => {
    const account = accounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
    if (account) {
      setCurrentUser(account);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const checkIn = (studentId: string, classId: string, className: string, classTime: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    // Prevent duplicate check-in for same class today
    const alreadyCheckedIn = attendance.some(
      a => a.studentId === studentId && a.classId === classId && a.date.startsWith(todayStr)
    );
    if (alreadyCheckedIn) return;

    const newRecord: Attendance = {
      id: `att-${Date.now()}`,
      studentId,
      date: new Date().toISOString(),
      classId,
      className,
      classTime,
      confirmed: false,
    };
    setAttendance(prev => [newRecord, ...prev]);
  };

  const confirmAttendance = (attendanceId: string) => {
    setAttendance(prev => prev.map(a => a.id === attendanceId ? { ...a, confirmed: true } : a));
  };

  const rejectAttendance = (attendanceId: string) => {
    setAttendance(prev => prev.filter(a => a.id !== attendanceId));
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const addStudent = (studentData: Omit<Student, 'id'>, _email: string, _password: string) => {
    const newStudent: Student = { ...studentData, id: `s-${Date.now()}` };
    setStudents(prev => [...prev, newStudent]);
  };

  const addSpecialDate = (studentId: string, date: string, type: 'graduation' | 'grade', notes?: string) => {
    const newSpecialDate: SpecialDate = {
      id: `sd-${Date.now()}`,
      date,
      type,
      notes,
    };
    setStudents(prev => prev.map(s =>
      s.id === studentId
        ? { ...s, specialDates: [...s.specialDates, newSpecialDate] }
        : s
    ));
  };

  const removeSpecialDate = (studentId: string, specialDateId: string) => {
    setStudents(prev => prev.map(s =>
      s.id === studentId
        ? { ...s, specialDates: s.specialDates.filter(sd => sd.id !== specialDateId) }
        : s
    ));
  };

  const updateSpecialDates = (studentId: string, specialDates: SpecialDate[]) => {
    setStudents(prev => prev.map(s =>
      s.id === studentId ? { ...s, specialDates } : s
    ));
  };

  return (
    <DataContext.Provider value={{
      currentUser,
      students,
      attendance,
      classes,
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
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
