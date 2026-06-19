// In-memory mock database to replace Firebase

export const db = {} as any;

let idCounter = 100;
const generateId = () => (++idCounter).toString();

// Initialize initial mock data
let mockData: Record<string, any[]> = {
  users: [
    { id: 'u1', username: 'student1', password: '123', role: 'student', fullName: 'Asadbek Rustamov', groupId: 'g1', subject: 'Matematika' },
    { id: 'u2', username: 'student2', password: '123', role: 'student', fullName: 'Zilola Mansurova', groupId: 'g2', subject: 'English' },
    { id: 't1', username: 'teacher1', password: '123', role: 'teacher', fullName: 'Olimov B.' }
  ],
  groups: [
    { id: 'g1', name: 'G-24', teacherName: 'Olimov B.', subject: 'Matematika', createdAt: new Date().toISOString() },
    { id: 'g2', name: 'IELTS 7.0', teacherName: 'Karimova M.', subject: 'English', createdAt: new Date().toISOString() }
  ],
  payments: [
    { id: 'p1', studentId: 'u1', amount: 450000, date: new Date().toISOString(), status: 'paid' },
    { id: 'p2', studentId: 'u2', amount: 500000, date: new Date().toISOString(), status: 'unpaid' }
  ],
  attendance: [
    { id: 'a1', studentId: 'u1', date: new Date().toISOString(), present: true },
    { id: 'a2', studentId: 'u2', date: new Date().toISOString(), present: false }
  ],
  subjects: [
    { id: 's1', name: 'Matematika', createdAt: new Date().toISOString() },
    { id: 's2', name: 'English', createdAt: new Date().toISOString() }
  ]
};

type Listener = (snapshot: any) => void;
const listeners: Record<string, Listener[]> = {};

function notifyListeners(collectionName: string) {
  if (listeners[collectionName]) {
    const defaultSnap = createSnapshot(mockData[collectionName]);
    listeners[collectionName].forEach(l => l(defaultSnap));
  }
}

function createSnapshot(items: any[]) {
  return {
    empty: items.length === 0,
    docs: items.map(item => ({
      id: item.id,
      data: () => item
    }))
  };
}

// Mock functions
export const collection = (db: any, path: string) => {
  if (!mockData[path]) mockData[path] = [];
  return { path };
};

export const query = (col: any, ...constraints: any[]) => {
  return {
    ...col,
    constraints
  };
};

export const onSnapshot = (q: any, callback: Listener) => {
  const collectionName = q.path;
  const constraintFilters = q.constraints || [];

  const filterData = () => {
    let data = mockData[collectionName] || [];
    constraintFilters.forEach((c: any) => {
      if (c.type === 'where') {
        data = data.filter(d => d[c.field] === c.value);
      } else if (c.type === 'orderBy') {
        data = [...data].sort((a, b) => {
          if (c.dir === 'desc') return typeof b[c.field] === 'string' ? b[c.field].localeCompare(a[c.field]) : b[c.field] - a[c.field];
          return typeof a[c.field] === 'string' ? a[c.field].localeCompare(b[c.field]) : a[c.field] - b[c.field];
        });
      }
    });
    return data;
  };

  const listener = () => {
    callback(createSnapshot(filterData()));
  };

  if (!listeners[collectionName]) listeners[collectionName] = [];
  listeners[collectionName].push(listener);

  // Initial call
  listener();

  return () => {
    listeners[collectionName] = listeners[collectionName].filter(l => l !== listener);
  };
};

export const where = (field: string, op: string, value: any) => {
  return { type: 'where', field, op, value };
};

export const orderBy = (field: string, dir: string = 'asc') => {
  return { type: 'orderBy', field, dir };
};

export const addDoc = async (col: any, data: any) => {
  const collectionName = col.path;
  const newItem = { id: generateId(), ...data };
  mockData[collectionName].push(newItem);
  notifyListeners(collectionName);
  return { id: newItem.id };
};

export const deleteDoc = async (docRef: any) => {
  const { path, id } = docRef;
  if (mockData[path]) {
    mockData[path] = mockData[path].filter(item => item.id !== id);
    notifyListeners(path);
  }
};

export const doc = (db: any, path: string, id: string) => {
  return { path, id };
};

export const getDocs = async (q: any) => {
  const collectionName = q.path;
  const constraintFilters = q.constraints || [];
  
  let data = mockData[collectionName] || [];
  constraintFilters.forEach((c: any) => {
    if (c.type === 'where') {
      data = data.filter(d => d[c.field] === c.value);
    }
  });

  return createSnapshot(data);
};
