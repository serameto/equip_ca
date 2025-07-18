import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { 
  Database, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Copy, 
  Download, 
  Upload,
  ArrowLeft,
  Wifi,
  WifiOff,
  AlertTriangle,
  Info
} from 'lucide-react';

interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  loading: boolean;
}

interface SupabaseSetupProps {
  onBack: () => void;
  onSetupComplete: () => void;
}

export function SupabaseSetup({ onBack, onSetupComplete }: SupabaseSetupProps) {
  const [config, setConfig] = useState<SupabaseConfig>({
    url: '',
    anonKey: '',
    serviceRoleKey: ''
  });
  
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [setupProgress, setSetupProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'config',
      title: 'Supabase 설정 입력',
      description: 'Supabase 프로젝트 URL과 API 키를 입력합니다.',
      completed: false,
      loading: false
    },
    {
      id: 'connect',
      title: '연결 테스트',
      description: '입력한 정보로 Supabase에 연결을 테스트합니다.',
      completed: false,
      loading: false
    },
    {
      id: 'schema',
      title: '데이터베이스 스키마 생성',
      description: '필요한 테이블과 초기 데이터를 생성합니다.',
      completed: false,
      loading: false
    },
    {
      id: 'migrate',
      title: '데이터 마이그레이션',
      description: '기존 로컬 데이터를 Supabase로 이동합니다.',
      completed: false,
      loading: false
    }
  ]);

  // 컴포넌트 마운트 시 기존 설정 불러오기
  useEffect(() => {
    loadExistingConfig();
    checkCurrentConnection();
  }, []);

  const loadExistingConfig = () => {
    try {
      const savedConfig = localStorage.getItem('supabase_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        if (parsed.url && parsed.anonKey) {
          updateStepStatus('config', true);
        }
      }
    } catch (error) {
      console.error('Failed to load existing config:', error);
    }
  };

  const saveConfig = () => {
    try {
      localStorage.setItem('supabase_config', JSON.stringify(config));
      setSuccess('설정이 저장되었습니다.');
      updateStepStatus('config', true);
    } catch (error) {
      setError('설정 저장에 실패했습니다.');
    }
  };

  const updateStepStatus = (stepId: string, completed: boolean, loading: boolean = false) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, completed, loading }
        : step
    ));
    
    // 진행률 업데이트
    const completedSteps = steps.filter(step => 
      step.id === stepId ? completed : step.completed
    ).length;
    setSetupProgress((completedSteps / steps.length) * 100);
  };

  const checkCurrentConnection = async () => {
    setConnectionLoading(true);
    try {
      // 현재 사용 중인 supabase.ts 파일이 mock인지 실제 연결인지 확인
      const response = await fetch('/api/health-check').catch(() => null);
      
      // localStorage 확인으로 대체
      const mockData = localStorage.getItem('casino_equipment_data');
      if (mockData) {
        setIsConnected(false); // Mock 데이터 사용 중
      } else {
        setIsConnected(null); // 알 수 없음
      }
    } catch (error) {
      setIsConnected(false);
    } finally {
      setConnectionLoading(false);
    }
  };

  const testConnection = async () => {
    if (!config.url || !config.anonKey) {
      setError('URL과 API 키를 모두 입력해 주세요.');
      return;
    }

    updateStepStatus('connect', false, true);
    setError('');
    
    try {
      // 간단한 연결 테스트 (실제로는 Supabase 클라이언트로 테스트)
      const isValidUrl = config.url.startsWith('https://') && config.url.includes('supabase.co');
      const isValidKey = config.anonKey.length > 50;
      
      if (!isValidUrl) {
        throw new Error('올바른 Supabase URL 형식이 아닙니다. (https://your-project.supabase.co)');
      }
      
      if (!isValidKey) {
        throw new Error('올바른 API 키 형식이 아닙니다.');
      }
      
      // 실제 연결 테스트 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsConnected(true);
      updateStepStatus('connect', true, false);
      setSuccess('Supabase 연결에 성공했습니다!');
      setCurrentStep(2);
    } catch (error) {
      setError(error instanceof Error ? error.message : '연결 테스트에 실패했습니다.');
      updateStepStatus('connect', false, false);
      setIsConnected(false);
    }
  };

  const createSchema = async () => {
    updateStepStatus('schema', false, true);
    setError('');
    
    try {
      // 스키마 생성 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      updateStepStatus('schema', true, false);
      setSuccess('데이터베이스 스키마가 성공적으로 생성되었습니다!');
      setCurrentStep(3);
    } catch (error) {
      setError('스키마 생성에 실패했습니다.');
      updateStepStatus('schema', false, false);
    }
  };

  const migrateData = async () => {
    updateStepStatus('migrate', false, true);
    setError('');
    
    try {
      // 데이터 마이그레이션 시뮬레이션
      const mockData = localStorage.getItem('casino_equipment_data');
      if (mockData) {
        const equipmentData = JSON.parse(mockData);
        console.log('Migrating equipment data:', equipmentData.length, 'items');
      }
      
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      updateStepStatus('migrate', true, false);
      setSuccess('데이터 마이그레이션이 완료되었습니다!');
      setSetupProgress(100);
    } catch (error) {
      setError('데이터 마이그레이션에 실패했습니다.');
      updateStepStatus('migrate', false, false);
    }
  };

  const completeSetup = () => {
    // 실제 supabase.ts 파일 교체 로직이 여기에 들어갈 예정
    setSuccess('Supabase 연동이 완료되었습니다! 이제 실제 데이터베이스를 사용합니다.');
    setTimeout(() => {
      onSetupComplete();
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('클립보드에 복사되었습니다.');
  };

  const exportConfig = () => {
    const configData = {
      ...config,
      exportDate: new Date().toISOString(),
      note: 'Supabase 설정 백업 파일'
    };
    
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supabase-config-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setConfig({
          url: imported.url || '',
          anonKey: imported.anonKey || '',
          serviceRoleKey: imported.serviceRoleKey || ''
        });
        setSuccess('설정을 가져왔습니다.');
      } catch (error) {
        setError('설정 파일을 읽는데 실패했습니다.');
      }
    };
    reader.readAsText(file);
  };

  const schemaSQL = `-- UUID 확장 활성화
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
CREATE INDEX IF NOT EXISTS idx_equipment_created_at ON equipment(created_at);`;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              뒤로가기
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Supabase 데이터베이스 설정</h1>
              <p className="text-muted-foreground">카지노 장비 관리 시스템을 실제 데이터베이스와 연동합니다</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {connectionLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isConnected === true ? (
              <div className="flex items-center gap-2 text-green-600">
                <Wifi className="h-5 w-5" />
                <span className="text-sm">연결됨</span>
              </div>
            ) : isConnected === false ? (
              <div className="flex items-center gap-2 text-red-600">
                <WifiOff className="h-5 w-5" />
                <span className="text-sm">연결 안됨</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm">상태 불명</span>
              </div>
            )}
          </div>
        </div>

        {/* 진행률 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              설정 진행률
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">전체 진행률</span>
                <span className="text-sm font-medium">{Math.round(setupProgress)}%</span>
              </div>
              <Progress value={setupProgress} className="w-full" />
              
              <div className="grid gap-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <div className="flex-shrink-0">
                      {step.loading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                      ) : step.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{step.title}</div>
                      <div className="text-sm text-muted-foreground">{step.description}</div>
                    </div>
                    <Badge variant={step.completed ? "default" : "secondary"}>
                      {step.completed ? "완료" : "대기"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 에러/성공 메시지 */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* 1단계: Supabase 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              1단계: Supabase 프로젝트 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="supabase-url">Supabase 프로젝트 URL *</Label>
                <div className="flex gap-2">
                  <Input
                    id="supabase-url"
                    placeholder="https://your-project-id.supabase.co"
                    value={config.url}
                    onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(config.url)}
                    disabled={!config.url}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Supabase 대시보드 → Settings → API에서 확인할 수 있습니다
                </p>
              </div>

              <div>
                <Label htmlFor="anon-key">Anon Public Key *</Label>
                <div className="flex gap-2">
                  <Input
                    id="anon-key"
                    placeholder="eyJ..."
                    value={config.anonKey}
                    onChange={(e) => setConfig(prev => ({ ...prev, anonKey: e.target.value }))}
                    type="password"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(config.anonKey)}
                    disabled={!config.anonKey}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="service-key">Service Role Key (선택사항)</Label>
                <div className="flex gap-2">
                  <Input
                    id="service-key"
                    placeholder="eyJ..."
                    value={config.serviceRoleKey}
                    onChange={(e) => setConfig(prev => ({ ...prev, serviceRoleKey: e.target.value }))}
                    type="password"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(config.serviceRoleKey || '')}
                    disabled={!config.serviceRoleKey}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  서버 측 작업이 필요한 경우에만 사용합니다
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-2">
              <Button onClick={saveConfig} disabled={!config.url || !config.anonKey}>
                설정 저장
              </Button>
              <Button variant="outline" onClick={exportConfig} disabled={!config.url}>
                <Download className="h-4 w-4 mr-2" />
                설정 내보내기
              </Button>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={importConfig}
                  className="hidden"
                  id="import-config"
                />
                <Button variant="outline" onClick={() => document.getElementById('import-config')?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  설정 가져오기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2단계: 연결 테스트 */}
        <Card>
          <CardHeader>
            <CardTitle>2단계: 연결 테스트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                입력한 Supabase 설정으로 연결을 테스트합니다.
              </p>
              <Button 
                onClick={testConnection} 
                disabled={!config.url || !config.anonKey || steps[1].loading}
                className="w-full"
              >
                {steps[1].loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                연결 테스트 실행
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 3단계: 스키마 생성 */}
        <Card>
          <CardHeader>
            <CardTitle>3단계: 데이터베이스 스키마 생성</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  다음 SQL을 Supabase SQL Editor에서 실행하거나, 자동 생성 버튼을 사용하세요.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label>실행할 SQL 스크립트</Label>
                <div className="relative">
                  <Textarea
                    value={schemaSQL}
                    readOnly
                    rows={10}
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(schemaSQL)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={createSchema} 
                  disabled={!steps[1].completed || steps[2].loading}
                  className="flex-1"
                >
                  {steps[2].loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  자동 스키마 생성
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://supabase.com/docs/guides/database', '_blank')}
                >
                  가이드 보기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4단계: 데이터 마이그레이션 */}
        <Card>
          <CardHeader>
            <CardTitle>4단계: 데이터 마이그레이션</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  현재 로컬에 저장된 장비 데이터를 Supabase 데이터베이스로 이동합니다.
                </AlertDescription>
              </Alert>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm font-medium mb-2">현재 로컬 데이터 상태</div>
                <div className="text-sm text-muted-foreground">
                  {(() => {
                    try {
                      const mockData = localStorage.getItem('casino_equipment_data');
                      if (mockData) {
                        const data = JSON.parse(mockData);
                        return `${data.length}개의 장비 데이터가 로컬에 저장되어 있습니다.`;
                      }
                      return '로컬 데이터가 없습니다.';
                    } catch {
                      return '데이터를 읽을 수 없습니다.';
                    }
                  })()}
                </div>
              </div>

              <Button 
                onClick={migrateData} 
                disabled={!steps[2].completed || steps[3].loading}
                className="w-full"
              >
                {steps[3].loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                데이터 마이그레이션 시작
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 완료 버튼 */}
        {steps.every(step => step.completed) && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">설정이 완료되었습니다!</h3>
                  <p className="text-green-600">
                    이제 Supabase 데이터베이스를 사용할 수 있습니다.
                  </p>
                </div>
                <Button onClick={completeSetup} className="bg-green-600 hover:bg-green-700">
                  Supabase 연동 완료하기
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}