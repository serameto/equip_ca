/**
 * Supabase 연동 전환을 위한 유틸리티 함수들
 */

interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

/**
 * 환경 변수 파일 내용 생성
 */
export function generateEnvFile(config: SupabaseConfig): string {
  return `# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=${config.url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${config.anonKey}
${config.serviceRoleKey ? `SUPABASE_SERVICE_ROLE_KEY=${config.serviceRoleKey}` : '# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here'}
`;
}

/**
 * 현재 사용 중인 데이터 타입 확인
 */
export function getCurrentDataSource(): 'mock' | 'supabase' | 'unknown' {
  try {
    // localStorage에 mock 데이터가 있는지 확인
    const mockData = localStorage.getItem('casino_equipment_data');
    const supabaseConfig = localStorage.getItem('supabase_config');
    
    if (mockData && !supabaseConfig) {
      return 'mock';
    } else if (supabaseConfig) {
      return 'supabase';
    } else {
      return 'unknown';
    }
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Mock 데이터를 Supabase 형식으로 변환
 */
export function convertMockDataToSupabase(): any[] {
  try {
    const mockData = localStorage.getItem('casino_equipment_data');
    if (!mockData) return [];
    
    const data = JSON.parse(mockData);
    
    // Mock 데이터를 Supabase 데이터베이스 형식으로 변환
    return data.map((item: any) => ({
      name: item.name,
      serial_number: item.serial_number,
      status: item.status,
      borrower: item.borrower || null,
      borrow_date: item.borrow_date || null,
      return_date: item.return_date || null,
      repair_receive_date: item.repair_receive_date || null,
      repair_complete_date: item.repair_complete_date || null,
      location: item.location,
      notes: item.notes || null,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Failed to convert mock data:', error);
    return [];
  }
}

/**
 * Supabase 설정 유효성 검사
 */
export function validateSupabaseConfig(config: SupabaseConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.url) {
    errors.push('Supabase URL이 필요합니다.');
  } else if (!config.url.startsWith('https://') || !config.url.includes('supabase.co')) {
    errors.push('올바른 Supabase URL 형식이 아닙니다. (예: https://your-project.supabase.co)');
  }
  
  if (!config.anonKey) {
    errors.push('Anon Key가 필요합니다.');
  } else if (config.anonKey.length < 50) {
    errors.push('올바른 Anon Key 형식이 아닙니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 데이터베이스 스키마 SQL 생성
 */
export function generateSchemaSQL(): string {
  return `-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- equipment 테이블 생성
CREATE TABLE IF NOT EXISTS equipment (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  serial_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('현장자산', '재고', '수리대기', '수리중', '수리완료')),
  borrower TEXT,
  borrow_date DATE,
  return_date DATE,
  repair_receive_date TIMESTAMPTZ,
  repair_complete_date TIMESTAMPTZ,
  location TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 업데이트 시간 자동 갱신을 위한 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거 생성
CREATE TRIGGER update_equipment_updated_at 
  BEFORE UPDATE ON equipment 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_serial_number ON equipment(serial_number);
CREATE INDEX IF NOT EXISTS idx_equipment_created_at ON equipment(created_at);

-- Row Level Security 활성화 (선택사항)
-- ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- 샘플 데이터 삽입 (선택사항)
-- INSERT INTO equipment (name, serial_number, status, location, notes) VALUES
-- ('게임 테이블 컴퓨터', 'GT-2024-001', '현장자산', '1층 블랙잭 테이블', '정상 작동'),
-- ('보안 모니터링 PC', 'SM-2024-002', '재고', '보안실', ''),
-- ('카운터 태블릿', 'CT-2024-003', '현장자산', '메인 카운터', '화면 보호필름 교체 필요')
-- ON CONFLICT (serial_number) DO NOTHING;`;
}

/**
 * 백업 생성
 */
export function createBackup(): { success: boolean; data?: any; error?: string } {
  try {
    const mockData = localStorage.getItem('casino_equipment_data');
    const supabaseConfig = localStorage.getItem('supabase_config');
    
    const backup = {
      timestamp: new Date().toISOString(),
      dataSource: getCurrentDataSource(),
      mockData: mockData ? JSON.parse(mockData) : null,
      supabaseConfig: supabaseConfig ? JSON.parse(supabaseConfig) : null,
      version: '1.0.0'
    };
    
    return { success: true, data: backup };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '백업 생성 실패' 
    };
  }
}

/**
 * 백업 복원
 */
export function restoreBackup(backupData: any): { success: boolean; error?: string } {
  try {
    if (backupData.mockData) {
      localStorage.setItem('casino_equipment_data', JSON.stringify(backupData.mockData));
    }
    
    if (backupData.supabaseConfig) {
      localStorage.setItem('supabase_config', JSON.stringify(backupData.supabaseConfig));
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '백업 복원 실패' 
    };
  }
}

/**
 * 설정 내보내기
 */
export function exportConfiguration(): void {
  const backup = createBackup();
  
  if (backup.success && backup.data) {
    const blob = new Blob([JSON.stringify(backup.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `casino-equipment-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

/**
 * Mock 데이터 정리
 */
export function cleanupMockData(): void {
  try {
    localStorage.removeItem('casino_equipment_data');
  } catch (error) {
    console.error('Failed to cleanup mock data:', error);
  }
}

/**
 * 전환 완료 후 정리 작업
 */
export function finalizeSupabaseSwitch(): void {
  try {
    // Mock 데이터 백업 생성
    const backup = createBackup();
    if (backup.success) {
      localStorage.setItem('mock_data_backup', JSON.stringify(backup.data));
    }
    
    // Mock 데이터 제거
    cleanupMockData();
    
    // Supabase 연결 플래그 설정
    localStorage.setItem('using_supabase', 'true');
    
    console.log('Supabase 전환이 완료되었습니다.');
  } catch (error) {
    console.error('전환 완료 처리 중 오류:', error);
  }
}