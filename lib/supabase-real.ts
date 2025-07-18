import { createClient } from '@supabase/supabase-js';

// Environment variables (실제 값으로 교체 필요)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here';

// Supabase 클라이언트 생성
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

// 앱 → 데이터베이스 형식 변환
const convertToDatabase = (equipment: Partial<Equipment>): Partial<DatabaseEquipment> => {
  return {
    id: equipment.id,
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

// 모든 장비 조회
export async function fetchEquipment(): Promise<Equipment[]> {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching equipment:', error);
      throw new Error(`데이터 조회 실패: ${error.message}`);
    }

    return (data || []).map(convertFromDatabase);
  } catch (error) {
    console.error('fetchEquipment error:', error);
    throw error;
  }
}

// 새 장비 추가
export async function addEquipment(equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>): Promise<Equipment> {
  try {
    const dbEquipment = convertToDatabase(equipment);
    
    const { data, error } = await supabase
      .from('equipment')
      .insert([dbEquipment])
      .select()
      .single();

    if (error) {
      console.error('Error adding equipment:', error);
      throw new Error(`장비 추가 실패: ${error.message}`);
    }

    return convertFromDatabase(data);
  } catch (error) {
    console.error('addEquipment error:', error);
    throw error;
  }
}

// 장비 정보 수정
export async function updateEquipment(id: string, updates: Partial<Equipment>): Promise<Equipment> {
  try {
    const dbUpdates = convertToDatabase(updates);
    
    const { data, error } = await supabase
      .from('equipment')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating equipment:', error);
      throw new Error(`장비 수정 실패: ${error.message}`);
    }

    return convertFromDatabase(data);
  } catch (error) {
    console.error('updateEquipment error:', error);
    throw error;
  }
}

// 장비 삭제
export async function deleteEquipment(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting equipment:', error);
      throw new Error(`장비 삭제 실패: ${error.message}`);
    }
  } catch (error) {
    console.error('deleteEquipment error:', error);
    throw error;
  }
}

// 시리얼번호 중복 체크
export async function checkSerialNumberExists(serialNumber: string, excludeId?: string): Promise<boolean> {
  try {
    let query = supabase
      .from('equipment')
      .select('id')
      .eq('serial_number', serialNumber);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking serial number:', error);
      throw new Error(`시리얼번호 확인 실패: ${error.message}`);
    }

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('checkSerialNumberExists error:', error);
    throw error;
  }
}

// 연결 상태 확인
export async function testConnection(): Promise<boolean> {
  try {
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