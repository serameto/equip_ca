import { createClient } from '@supabase/supabase-js';

// 환경 변수 안전하게 가져오기 (브라우저 환경 고려)
const getEnvVar = (key: string, defaultValue: string = '') => {
  if (typeof window !== 'undefined') {
    // 브라우저 환경에서는 빌드 시에 주입된 환경 변수 사용
    return (window as any).__ENV__?.[key] || defaultValue;
  }
  // 서버 환경에서는 process.env 사용
  return typeof process !== 'undefined' ? process.env[key] || defaultValue : defaultValue;
};

// Supabase 설정 - 로컬 스토리지에서 설정 확인 후 환경 변수 사용
const getSupabaseConfig = () => {
  let url = 'https://your-project-id.supabase.co';
  let anonKey = 'your-anon-key-here';

  // 로컬 스토리지에서 설정 확인 (브라우저에서만)
  if (typeof window !== 'undefined') {
    try {
      const savedConfig = localStorage.getItem('supabase_config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        if (config.url && config.anonKey) {
          url = config.url;
          anonKey = config.anonKey;
        }
      }
    } catch (error) {
      console.warn('Failed to load Supabase config from localStorage:', error);
    }
  }

  // 환경 변수 확인
  const envUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const envKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (envUrl && envUrl !== 'https://your-project-id.supabase.co') {
    url = envUrl;
  }
  if (envKey && envKey !== 'your-anon-key-here') {
    anonKey = envKey;
  }

  return { url, anonKey };
};

// Supabase 클라이언트 생성
const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig();
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Equipment 타입 정의
export interface Equipment {
  id: string;
  name: string;
  serial_number: string;
  status: '현장자산' | '재고' | '수리대기' | '수리중' | '수리완료';
  borrower?: string;
  borrow_date?: string;
  return_date?: string;
  repair_receive_date?: string;
  repair_complete_date?: string;
  location: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// 데이터베이스 타입 (snake_case)
interface DatabaseEquipment {
  id: string;
  name: string;
  serial_number: string;
  status: '현장자산' | '재고' | '수리대기' | '수리중' | '수리완료';
  borrower?: string;
  borrow_date?: string;
  return_date?: string;
  repair_receive_date?: string;
  repair_complete_date?: string;
  location: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Mock 데이터 (Supabase 연결이 안될 때 사용)
const mockEquipmentData: Equipment[] = [
  {
    id: '1',
    name: '게임 테이블 컴퓨터',
    serial_number: 'GT-2024-001',
    status: '현장자산',
    borrower: '김철수',
    borrow_date: '2024-07-10',
    return_date: '2024-07-20',
    location: '1층 블랙잭 테이블',
    notes: '정상 작동',
    created_at: '2024-07-01T09:00:00Z'
  },
  {
    id: '2',
    name: '보안 모니터링 PC',
    serial_number: 'SM-2024-002',
    status: '재고',
    location: '보안실',
    notes: '',
    repair_receive_date: '2024-07-14 15:30',
    created_at: '2024-07-02T09:00:00Z'
  },
  {
    id: '3',
    name: '카운터 태블릿',
    serial_number: 'CT-2024-003',
    status: '현장자산',
    borrower: '이영희',
    borrow_date: '2024-07-12',
    return_date: '2024-07-25',
    location: '메인 카운터',
    notes: '화면 보호필름 교체 필요',
    created_at: '2024-07-03T09:00:00Z'
  },
  {
    id: '4',
    name: 'POS 시스템',
    serial_number: 'POS-2024-004',
    status: '수리중',
    location: '카페테리아',
    notes: '프린터 오류',
    repair_receive_date: '2024-07-13 10:15',
    created_at: '2024-07-04T09:00:00Z'
  },
  {
    id: '5',
    name: '슬롯머신 제어 PC',
    serial_number: 'SL-2024-005',
    status: '수리완료',
    location: '2층 슬롯 구역',
    notes: '하드웨어 교체 완료',
    repair_complete_date: '2024-07-15 14:30',
    created_at: '2024-07-05T09:00:00Z'
  },
  {
    id: '6',
    name: '네트워크 스위치',
    serial_number: 'NS-2024-006',
    status: '수리대기',
    location: '서버실',
    notes: '포트 불량',
    created_at: '2024-07-06T09:00:00Z'
  },
  {
    id: '7',
    name: '바카라 테이블 PC',
    serial_number: 'BC-2024-007',
    status: '수리대기',
    location: '2층 바카라 구역',
    notes: '화면 깜빡임',
    created_at: '2024-07-07T09:00:00Z'
  },
  {
    id: '8',
    name: '카지노 프린터',
    serial_number: 'PR-2024-008',
    status: '수리중',
    location: '카운터',
    notes: '용지 걸림',
    repair_receive_date: '2024-07-14 11:20',
    created_at: '2024-07-08T09:00:00Z'
  },
  {
    id: '9',
    name: '보안 카메라 PC',
    serial_number: 'SC-2024-009',
    status: '수리완료',
    location: '보안실',
    notes: '하드웨어 교체 완료',
    repair_complete_date: '2024-07-13 16:45',
    created_at: '2024-07-09T09:00:00Z'
  }
];

// 데이터베이스 → 앱 형식 변환
const convertFromDatabase = (dbEquipment: DatabaseEquipment): Equipment => {
  return {
    id: dbEquipment.id,
    name: dbEquipment.name,
    serial_number: dbEquipment.serial_number,
    status: dbEquipment.status,
    borrower: dbEquipment.borrower,
    borrow_date: dbEquipment.borrow_date,
    return_date: dbEquipment.return_date,
    repair_receive_date: dbEquipment.repair_receive_date,
    repair_complete_date: dbEquipment.repair_complete_date,
    location: dbEquipment.location,
    notes: dbEquipment.notes,
    created_at: dbEquipment.created_at,
    updated_at: dbEquipment.updated_at
  };
};

// 앱 → 데이터베이스 형식 변환 (ID 제외)
const convertToDatabaseInsert = (equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>): Omit<DatabaseEquipment, 'id' | 'created_at' | 'updated_at'> => {
  return {
    name: equipment.name,
    serial_number: equipment.serial_number,
    status: equipment.status,
    borrower: equipment.borrower,
    borrow_date: equipment.borrow_date,
    return_date: equipment.return_date,
    repair_receive_date: equipment.repair_receive_date,
    repair_complete_date: equipment.repair_complete_date,
    location: equipment.location,
    notes: equipment.notes
  };
};

// 앱 → 데이터베이스 형식 변환 (업데이트용)
const convertToDatabaseUpdate = (equipment: Partial<Equipment>): Partial<DatabaseEquipment> => {
  const result: Partial<DatabaseEquipment> = {};
  
  if (equipment.name !== undefined) result.name = equipment.name;
  if (equipment.serial_number !== undefined) result.serial_number = equipment.serial_number;
  if (equipment.status !== undefined) result.status = equipment.status;
  if (equipment.borrower !== undefined) result.borrower = equipment.borrower;
  if (equipment.borrow_date !== undefined) result.borrow_date = equipment.borrow_date;
  if (equipment.return_date !== undefined) result.return_date = equipment.return_date;
  if (equipment.repair_receive_date !== undefined) result.repair_receive_date = equipment.repair_receive_date;
  if (equipment.repair_complete_date !== undefined) result.repair_complete_date = equipment.repair_complete_date;
  if (equipment.location !== undefined) result.location = equipment.location;
  if (equipment.notes !== undefined) result.notes = equipment.notes;
  
  return result;
};

// Supabase 연결 상태 확인
const isSupabaseConfigured = () => {
  const { url, anonKey } = getSupabaseConfig();
  return url !== 'https://your-project-id.supabase.co' && 
         anonKey !== 'your-anon-key-here' &&
         url.includes('supabase.co') &&
         anonKey.length > 50;
};

// localStorage를 사용한 Mock 구현
const useMockImplementation = () => {
  if (typeof window === 'undefined') return false;
  
  // localStorage에서 데이터 확인
  const mockData = localStorage.getItem('casino_equipment_data');
  return mockData !== null;
};

// Mock 데이터 초기화
const initializeMockData = () => {
  if (typeof window === 'undefined') return;
  
  const existingData = localStorage.getItem('casino_equipment_data');
  if (!existingData) {
    localStorage.setItem('casino_equipment_data', JSON.stringify(mockEquipmentData));
  }
};

// 모든 장비 조회
export async function fetchEquipment(): Promise<Equipment[]> {
  try {
    // Supabase 설정이 올바르면 실제 DB 사용
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase query failed, falling back to mock data:', error);
        throw error;
      }

      return (data || []).map(convertFromDatabase);
    }
    
    // Mock 구현 사용
    if (typeof window !== 'undefined') {
      initializeMockData();
      const mockData = localStorage.getItem('casino_equipment_data');
      if (mockData) {
        return JSON.parse(mockData);
      }
    }
    
    return mockEquipmentData;
  } catch (error) {
    console.warn('Falling back to mock data due to error:', error);
    
    // 에러 발생 시 Mock 데이터 사용
    if (typeof window !== 'undefined') {
      initializeMockData();
      const mockData = localStorage.getItem('casino_equipment_data');
      if (mockData) {
        return JSON.parse(mockData);
      }
    }
    
    return mockEquipmentData;
  }
}

// 새 장비 추가
export async function addEquipment(equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>): Promise<Equipment> {
  try {
    if (isSupabaseConfigured()) {
      // ID, created_at, updated_at 제외하고 insert
      const dbEquipment = convertToDatabaseInsert(equipment);
      
      const { data, error } = await supabase
        .from('equipment')
        .insert([dbEquipment])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      return convertFromDatabase(data);
    }
    
    // Mock 구현
    if (typeof window !== 'undefined') {
      const mockData = localStorage.getItem('casino_equipment_data');
      const existingData = mockData ? JSON.parse(mockData) : [];
      
      const newEquipment: Equipment = {
        ...equipment,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const updatedData = [newEquipment, ...existingData];
      localStorage.setItem('casino_equipment_data', JSON.stringify(updatedData));
      
      return newEquipment;
    }
    
    throw new Error('Unable to add equipment');
  } catch (error) {
    console.error('addEquipment error:', error);
    throw error;
  }
}

// 장비 정보 수정
export async function updateEquipment(id: string, updates: Partial<Equipment>): Promise<Equipment> {
  try {
    if (isSupabaseConfigured()) {
      const dbUpdates = convertToDatabaseUpdate(updates);
      
      const { data, error } = await supabase
        .from('equipment')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      return convertFromDatabase(data);
    }
    
    // Mock 구현
    if (typeof window !== 'undefined') {
      const mockData = localStorage.getItem('casino_equipment_data');
      const existingData = mockData ? JSON.parse(mockData) : [];
      
      const updatedData = existingData.map((item: Equipment) => 
        item.id === id 
          ? { ...item, ...updates, updated_at: new Date().toISOString() }
          : item
      );
      
      localStorage.setItem('casino_equipment_data', JSON.stringify(updatedData));
      
      const updatedItem = updatedData.find((item: Equipment) => item.id === id);
      if (!updatedItem) {
        throw new Error('Equipment not found');
      }
      
      return updatedItem;
    }
    
    throw new Error('Unable to update equipment');
  } catch (error) {
    console.error('updateEquipment error:', error);
    throw error;
  }
}

// 장비 삭제
export async function deleteEquipment(id: string): Promise<void> {
  try {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }
      return;
    }
    
    // Mock 구현
    if (typeof window !== 'undefined') {
      const mockData = localStorage.getItem('casino_equipment_data');
      const existingData = mockData ? JSON.parse(mockData) : [];
      
      const updatedData = existingData.filter((item: Equipment) => item.id !== id);
      localStorage.setItem('casino_equipment_data', JSON.stringify(updatedData));
    }
  } catch (error) {
    console.error('deleteEquipment error:', error);
    throw error;
  }
}

// 시리얼번호 중복 체크
export async function checkSerialNumberExists(serialNumber: string, excludeId?: string): Promise<boolean> {
  try {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('equipment')
        .select('id')
        .eq('serial_number', serialNumber);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase serial check error:', error);
        throw error;
      }

      return (data?.length || 0) > 0;
    }
    
    // Mock 구현
    if (typeof window !== 'undefined') {
      const mockData = localStorage.getItem('casino_equipment_data');
      const existingData = mockData ? JSON.parse(mockData) : [];
      
      const found = existingData.find((item: Equipment) => 
        item.serial_number === serialNumber && 
        (excludeId ? item.id !== excludeId : true)
      );
      
      return !!found;
    }
    
    return false;
  } catch (error) {
    console.error('checkSerialNumberExists error:', error);
    return false;
  }
}

// 연결 상태 확인
export async function testConnection(): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const { data, error } = await supabase
      .from('equipment')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Connection test failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('testConnection error:', error);
    return false;
  }
}

// 실시간 구독 설정 (선택사항)
export function subscribeToEquipmentChanges(callback: (payload: any) => void) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, real-time updates not available');
    return { unsubscribe: () => {} };
  }

  const subscription = supabase
    .channel('equipment-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'equipment'
      },
      callback
    )
    .subscribe();

  return subscription;
}

// 현재 사용 중인 구현 타입 확인
export function getCurrentImplementationType(): 'supabase' | 'mock' {
  return isSupabaseConfigured() ? 'supabase' : 'mock';
}