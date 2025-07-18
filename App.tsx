import { useState, useEffect } from 'react';
import { EquipmentManagement } from './components/EquipmentManagement';
import { SupabaseSetup } from './components/SupabaseSetup';
import { Button } from './components/ui/button';
import { Database, Settings } from 'lucide-react';
import { testConnection, getCurrentImplementationType } from './lib/supabase';

export default function App() {
  const [currentView, setCurrentView] = useState<'main' | 'setup'>('main');
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [connectionLoading, setConnectionLoading] = useState(true);
  const [implementationType, setImplementationType] = useState<'supabase' | 'mock'>('mock');

  useEffect(() => {
    // Supabase 연결 상태 확인
    checkSupabaseConnection();
  }, []);

  const checkSupabaseConnection = async () => {
    setConnectionLoading(true);
    try {
      // 현재 구현 타입 확인
      const currentType = getCurrentImplementationType();
      setImplementationType(currentType);
      
      if (currentType === 'supabase') {
        // 실제 연결 테스트
        const isConnected = await testConnection();
        setIsSupabaseConnected(isConnected);
      } else {
        // Mock 구현 사용 중
        setIsSupabaseConnected(false);
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsSupabaseConnected(false);
      setImplementationType('mock');
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setIsSupabaseConnected(true);
    setImplementationType('supabase');
    setCurrentView('main');
    // 연결 상태 재확인
    checkSupabaseConnection();
  };

  if (currentView === 'setup') {
    return (
      <SupabaseSetup 
        onBack={() => setCurrentView('main')}
        onSetupComplete={handleSetupComplete}
      />
    );
  }

  const getConnectionStatus = () => {
    if (connectionLoading) {
      return {
        text: '연결 확인 중...',
        className: 'bg-gray-100 text-gray-600'
      };
    }
    
    if (implementationType === 'supabase' && isSupabaseConnected) {
      return {
        text: 'Supabase 연결됨',
        className: 'bg-green-100 text-green-800'
      };
    }
    
    if (implementationType === 'supabase' && !isSupabaseConnected) {
      return {
        text: 'Supabase 연결 오류',
        className: 'bg-red-100 text-red-800'
      };
    }
    
    return {
      text: '로컬 데이터 사용 중',
      className: 'bg-orange-100 text-orange-800'
    };
  };

  const connectionStatus = getConnectionStatus();
  const shouldShowSetupWarning = implementationType === 'mock' && !connectionLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 - Supabase 설정 버튼 */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <span className="font-medium">카지노 장비 관리 시스템</span>
            <span className={`text-xs px-2 py-1 rounded-full ${connectionStatus.className}`}>
              {connectionStatus.text}
            </span>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('setup')}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {isSupabaseConnected ? 'DB 설정 관리' : 'Supabase 연동 설정'}
          </Button>
        </div>
      </div>

      {/* 연결 안내 메시지 */}
      {shouldShowSetupWarning && (
        <div className="bg-orange-50 border-b border-orange-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-orange-800">
              <Database className="h-4 w-4" />
              <span className="text-sm">
                현재 로컬 데이터를 사용하고 있습니다. Supabase 데이터베이스와 연결하면 데이터가 영구적으로 저장됩니다.
              </span>
            </div>
            <Button 
              size="sm" 
              onClick={() => setCurrentView('setup')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              지금 설정하기
            </Button>
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <EquipmentManagement />
    </div>
  );
}