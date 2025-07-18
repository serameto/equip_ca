#!/usr/bin/env node

/**
 * Supabase 연동 전환 스크립트
 * 
 * 이 스크립트는 현재 localStorage mock 구현을 
 * 실제 Supabase 연동으로 자동 전환합니다.
 * 
 * 사용법: node scripts/switch-to-supabase.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('🚀 Supabase 연동 전환 스크립트');
  console.log('================================\n');

  // 1. 사용자 입력 받기
  const supabaseUrl = await question('Supabase URL을 입력하세요: ');
  const supabaseAnonKey = await question('Supabase Anon Key를 입력하세요: ');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ URL과 API Key는 필수입니다.');
    process.exit(1);
  }

  // 2. 환경 변수 파일 생성
  const envContent = `# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
`;

  fs.writeFileSync('.env.local', envContent);
  console.log('✅ .env.local 파일이 생성되었습니다.');

  // 3. 백업 생성
  const backupDir = 'backup';
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  const currentSupabaseFile = 'lib/supabase.ts';
  const backupFile = `backup/supabase-mock-${Date.now()}.ts`;
  
  if (fs.existsSync(currentSupabaseFile)) {
    fs.copyFileSync(currentSupabaseFile, backupFile);
    console.log(`✅ 기존 파일이 ${backupFile}로 백업되었습니다.`);
  }

  // 4. 실제 Supabase 파일로 교체
  const realSupabaseFile = 'lib/supabase-real.ts';
  if (fs.existsSync(realSupabaseFile)) {
    fs.copyFileSync(realSupabaseFile, currentSupabaseFile);
    console.log('✅ 실제 Supabase 연동 파일로 교체되었습니다.');
  } else {
    console.log('⚠️  supabase-real.ts 파일이 없습니다. 수동으로 교체해 주세요.');
  }

  // 5. package.json 확인
  const packageJsonPath = 'package.json';
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = packageJson.dependencies || {};
    
    if (!dependencies['@supabase/supabase-js']) {
      console.log('⚠️  @supabase/supabase-js 패키지가 설치되지 않았습니다.');
      console.log('다음 명령어를 실행하세요: npm install @supabase/supabase-js');
    } else {
      console.log('✅ @supabase/supabase-js 패키지가 이미 설치되어 있습니다.');
    }
  }

  // 6. .gitignore 업데이트
  const gitignorePath = '.gitignore';
  let gitignoreContent = '';
  
  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  }
  
  if (!gitignoreContent.includes('.env.local')) {
    gitignoreContent += '\n# Environment variables\n.env.local\n.env\n';
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log('✅ .gitignore 파일이 업데이트되었습니다.');
  }

  // 7. 완료 메시지
  console.log('\n🎉 전환이 완료되었습니다!');
  console.log('\n다음 단계를 진행하세요:');
  console.log('1. Supabase 대시보드에서 데이터베이스 스키마 생성');
  console.log('2. npm install @supabase/supabase-js (필요한 경우)');
  console.log('3. 애플리케이션 실행 및 테스트');
  console.log('4. 문제가 있으면 백업 파일로 복원 가능');
  
  rl.close();
}

// 에러 핸들링
main().catch(error => {
  console.error('❌ 오류 발생:', error.message);
  rl.close();
  process.exit(1);
});