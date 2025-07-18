-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- equipment 테이블 삭제 (기존 테이블이 있다면)
DROP TABLE IF EXISTS equipment CASCADE;

-- equipment 테이블 생성
CREATE TABLE equipment (
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
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
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
DROP TRIGGER IF EXISTS update_equipment_updated_at ON equipment;
CREATE TRIGGER update_equipment_updated_at 
  BEFORE UPDATE ON equipment 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_serial_number ON equipment(serial_number);
CREATE INDEX IF NOT EXISTS idx_equipment_created_at ON equipment(created_at);
CREATE INDEX IF NOT EXISTS idx_equipment_location ON equipment(location);
CREATE INDEX IF NOT EXISTS idx_equipment_borrower ON equipment(borrower);

-- 샘플 데이터 삽입 (ID는 자동 생성)
INSERT INTO equipment (name, serial_number, status, borrower, borrow_date, return_date, location, notes, repair_receive_date, repair_complete_date) VALUES
('게임 테이블 컴퓨터', 'GT-2024-001', '현장자산', '김철수', '2024-07-10', '2024-07-20', '1층 블랙잭 테이블', '정상 작동', NULL, NULL),
('보안 모니터링 PC', 'SM-2024-002', '재고', NULL, NULL, NULL, '보안실', '', '2024-07-14 15:30:00', NULL),
('카운터 태블릿', 'CT-2024-003', '현장자산', '이영희', '2024-07-12', '2024-07-25', '메인 카운터', '화면 보호필름 교체 필요', NULL, NULL),
('POS 시스템', 'POS-2024-004', '수리중', NULL, NULL, NULL, '카페테리아', '프린터 오류', '2024-07-13 10:15:00', NULL),
('슬롯머신 제어 PC', 'SL-2024-005', '수리완료', NULL, NULL, NULL, '2층 슬롯 구역', '하드웨어 교체 완료', NULL, '2024-07-15 14:30:00'),
('네트워크 스위치', 'NS-2024-006', '수리대기', NULL, NULL, NULL, '서버실', '포트 불량', NULL, NULL),
('바카라 테이블 PC', 'BC-2024-007', '수리대기', NULL, NULL, NULL, '2층 바카라 구역', '화면 깜빡임', NULL, NULL),
('카지노 프린터', 'PR-2024-008', '수리중', NULL, NULL, NULL, '카운터', '용지 걸림', '2024-07-14 11:20:00', NULL),
('보안 카메라 PC', 'SC-2024-009', '수리완료', NULL, NULL, NULL, '보안실', '하드웨어 교체 완료', NULL, '2024-07-13 16:45:00')
ON CONFLICT (serial_number) DO NOTHING;

-- Row Level Security 설정 (보안 강화)
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Enable read access for all users" ON equipment;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON equipment;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON equipment;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON equipment;

-- 모든 사용자가 읽기 가능한 정책
CREATE POLICY "Enable read access for all users" ON equipment
  FOR SELECT USING (true);

-- 인증된 사용자만 삽입/수정/삭제 가능한 정책
CREATE POLICY "Enable insert for authenticated users only" ON equipment
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON equipment
  FOR UPDATE USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" ON equipment
  FOR DELETE USING (true);

-- 테이블 권한 설정
GRANT ALL ON equipment TO anon;
GRANT ALL ON equipment TO authenticated;

-- 시퀀스 권한 설정 (만약 있다면)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 테스트: UUID 생성 확인
SELECT uuid_generate_v4() as test_uuid;

-- 테스트: 샘플 데이터 입력 (ID 자동 생성 확인)
DO $$
DECLARE
    test_id UUID;
BEGIN
    INSERT INTO equipment (name, serial_number, status, location) 
    VALUES ('테스트 장비', 'TEST-001', '재고', '테스트 위치')
    RETURNING id INTO test_id;
    
    RAISE NOTICE 'Test equipment created with ID: %', test_id;
    
    -- 테스트 데이터 삭제
    DELETE FROM equipment WHERE id = test_id;
    
    RAISE NOTICE 'Test equipment deleted successfully';
END $$;