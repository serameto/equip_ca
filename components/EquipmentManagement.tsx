import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, FileText, Plus, Loader2 } from 'lucide-react';
import { 
  Equipment, 
  fetchEquipment, 
  addEquipment, 
  updateEquipment, 
  checkSerialNumberExists 
} from '../lib/supabase';

export function EquipmentManagement() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('전체');
  const [isStatusChangeDialogOpen, setIsStatusChangeDialogOpen] = useState(false);
  const [isAddEquipmentDialogOpen, setIsAddEquipmentDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowDate, setBorrowDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // 새로운 장비 등록용 상태
  const [newEquipmentName, setNewEquipmentName] = useState('');
  const [newEquipmentSerial, setNewEquipmentSerial] = useState('');
  const [newEquipmentStatus, setNewEquipmentStatus] = useState<string>('재고');
  const [newEquipmentLocation, setNewEquipmentLocation] = useState('');
  const [newEquipmentNotes, setNewEquipmentNotes] = useState('');

  // 컴포넌트 마운트시 데이터 로드
  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const data = await fetchEquipment();
      setEquipment(data);
    } catch (error) {
      console.error('Failed to load equipment:', error);
      alert('장비 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEquipment = (status?: string) => {
    let filtered = equipment;
    
    if (status && status !== '전체') {
      filtered = equipment.filter(item => item.status === status);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.borrower && item.borrower.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case '재고': 
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case '현장자산': 
        return 'bg-green-100 text-green-800 border-green-200';
      case '수리대기': 
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case '수리중': 
        return 'bg-red-100 text-red-800 border-red-200';
      case '수리완료': 
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  // 날짜 포맷팅 함수 (날짜만 표시)
  const formatDateOnly = (dateString?: string) => {
    if (!dateString) return '-';
    
    try {
      // 이미 YYYY-MM-DD 형식이면 그대로 반환
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // YYYY-MM-DD HH:mm 형식에서 날짜 부분만 추출
      if (dateString.includes(' ')) {
        return dateString.split(' ')[0];
      }
      
      // ISO 8601 형식이면 날짜 부분만 추출
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      
      return dateString;
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString || '-';
    }
  };

  const openStatusChangeDialog = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setNewStatus(equipment.status);
    setBorrowerName(equipment.borrower || '');
    setBorrowDate(equipment.borrow_date || '');
    setReturnDate(equipment.return_date || '');
    setLocation(equipment.location);
    setNotes(equipment.notes || '');
    setIsStatusChangeDialogOpen(true);
  };

  const openAddEquipmentDialog = () => {
    setNewEquipmentName('');
    setNewEquipmentSerial('');
    setNewEquipmentStatus('재고');
    setNewEquipmentLocation('');
    setNewEquipmentNotes('');
    setIsAddEquipmentDialogOpen(true);
  };

  const handleAddEquipment = async () => {
    if (!newEquipmentName || !newEquipmentSerial || !newEquipmentLocation) {
      alert('장비명, 시리얼번호, 위치는 필수 입력 항목입니다.');
      return;
    }

    try {
      setSaving(true);
      
      // 시리얼번호 중복 체크
      const serialExists = await checkSerialNumberExists(newEquipmentSerial);
      if (serialExists) {
        alert('이미 존재하는 시리얼번호입니다.');
        return;
      }

      const newEquipment = {
        name: newEquipmentName,
        serial_number: newEquipmentSerial,
        status: newEquipmentStatus as Equipment['status'],
        location: newEquipmentLocation,
        notes: newEquipmentNotes || undefined
      };

      const savedEquipment = await addEquipment(newEquipment);
      setEquipment(prev => [savedEquipment, ...prev]);
      setIsAddEquipmentDialogOpen(false);
      alert('장비가 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('Failed to add equipment:', error);
      alert('장비 등록에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedEquipment || !newStatus) return;

    try {
      setSaving(true);
      const currentDateTime = getCurrentDateTime();
      const currentDate = getCurrentDate();

      const updates: Partial<Equipment> = {
        status: newStatus as Equipment['status'],
        location: location,
        borrower: (newStatus === '현장자산' && borrowerName) ? borrowerName : undefined,
        borrow_date: (newStatus === '현장자산' && borrowDate) ? borrowDate : (newStatus === '현장자산' ? currentDate : undefined),
        return_date: (newStatus === '현장자산' && returnDate) ? returnDate : undefined,
        notes: notes || undefined,
      };

      // 수리입고 날짜 설정 로직
      if ((selectedEquipment.status === '현장자산' && newStatus !== '현장자산') || 
          (newStatus === '수리중' && selectedEquipment.status !== '수리중')) {
        updates.repair_receive_date = currentDateTime;
      }

      // 수리완료 날짜 설정 로직
      if (newStatus === '수리완료' && selectedEquipment.status !== '수리완료') {
        updates.repair_complete_date = currentDateTime;
      }

      const updatedEquipment = await updateEquipment(selectedEquipment.id, updates);
      
      setEquipment(prev => prev.map(item => 
        item.id === selectedEquipment.id ? updatedEquipment : item
      ));

      resetDialogFields();
      alert('장비 상태가 성공적으로 변경되었습니다.');
    } catch (error) {
      console.error('Failed to update equipment:', error);
      alert('장비 상태 변경에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const resetDialogFields = () => {
    setSelectedEquipment(null);
    setNewStatus('');
    setBorrowerName('');
    setBorrowDate('');
    setReturnDate('');
    setLocation('');
    setNotes('');
    setIsStatusChangeDialogOpen(false);
  };

  const isCurrentFieldsStatus = (status: string): boolean => {
    return status === '현장자산';
  };

  const renderEquipmentTable = (filteredEquipment: Equipment[]) => (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>장비명</TableHead>
            <TableHead>시리얼번호</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>불출일</TableHead>
            <TableHead>수리입고</TableHead>
            <TableHead>수리완료입고</TableHead>
            <TableHead>위치</TableHead>
            <TableHead>작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEquipment.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                해당 조건에 맞는 장비가 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            filteredEquipment.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell className="font-mono text-sm">{item.serial_number}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeStyle(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>{item.borrow_date || '-'}</TableCell>
                <TableCell>{formatDateOnly(item.repair_receive_date)}</TableCell>
                <TableCell>{formatDateOnly(item.repair_complete_date)}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => openStatusChangeDialog(item)}
                    disabled={saving}
                  >
                    상태변경
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>장비 데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              카지노 전산장비 불출현황
            </div>
            <Button 
              onClick={openAddEquipmentDialog} 
              className="flex items-center gap-2"
              disabled={saving}
            >
              <Plus className="h-4 w-4" />
              새로운 장비 등록
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 검색 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="장비명, 시리얼번호, 대여자명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 text-[24px]">
                {equipment.filter(e => e.status === '재고').length}
              </div>
              <div className="text-sm text-purple-600 text-[14px]">재고</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 text-[24px]">
                {equipment.filter(e => e.status === '현장자산').length}
              </div>
              <div className="text-sm text-green-600 text-[13px]">현장자산</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {equipment.filter(e => e.status === '수리대기').length}
              </div>
              <div className="text-sm text-orange-600 text-[13px]">수리대기</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600 text-[21px]">
                {equipment.filter(e => e.status === '수리중').length}
              </div>
              <div className="text-sm text-red-600">수리중</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {equipment.filter(e => e.status === '수리완료').length}
              </div>
              <div className="text-sm text-gray-600">수리완료</div>
            </div>
          </div>

          {/* 탭으로 분류된 테이블 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 text-lg h-12">
              <TabsTrigger value="전체" className="text-lg">전체 ({equipment.length})</TabsTrigger>
              <TabsTrigger value="수리대기" className="text-lg">수리대기 ({equipment.filter(e => e.status === '수리대기').length})</TabsTrigger>
              <TabsTrigger value="수리중" className="text-lg">수리중 ({equipment.filter(e => e.status === '수리중').length})</TabsTrigger>
              <TabsTrigger value="수리완료" className="text-lg">수리완료 ({equipment.filter(e => e.status === '수리완료').length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="전체" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">전체 장비</h3>
                <div className="text-sm text-muted-foreground">
                  총 {getFilteredEquipment().length}개 장비
                </div>
              </div>
              {renderEquipmentTable(getFilteredEquipment())}
            </TabsContent>
            
            <TabsContent value="수리대기" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">수리대기 장비</h3>
                <div className="text-sm text-muted-foreground">
                  총 {getFilteredEquipment('수리대기').length}개 장비
                </div>
              </div>
              {renderEquipmentTable(getFilteredEquipment('수리대기'))}
            </TabsContent>
            
            <TabsContent value="수리중" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">수리중 장비</h3>
                <div className="text-sm text-muted-foreground">
                  총 {getFilteredEquipment('수리중').length}개 장비
                </div>
              </div>
              {renderEquipmentTable(getFilteredEquipment('수리중'))}
            </TabsContent>
            
            <TabsContent value="수리완료" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">수리완료 장비</h3>
                <div className="text-sm text-muted-foreground">
                  총 {getFilteredEquipment('수리완료').length}개 장비
                </div>
              </div>
              {renderEquipmentTable(getFilteredEquipment('수리완료'))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 새로운 장비 등록 다이얼로그 */}
      <Dialog open={isAddEquipmentDialogOpen} onOpenChange={setIsAddEquipmentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>새로운 장비 등록</DialogTitle>
            <DialogDescription>
              새로운 장비의 정보를 입력해 주세요. (* 필수 입력)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="equipmentName">장비명 *</Label>
              <Input
                id="equipmentName"
                value={newEquipmentName}
                onChange={(e) => setNewEquipmentName(e.target.value)}
                placeholder="장비명을 입력하세요"
                disabled={saving}
              />
            </div>
            <div>
              <Label htmlFor="serialNumber">시리얼번호 *</Label>
              <Input
                id="serialNumber"
                value={newEquipmentSerial}
                onChange={(e) => setNewEquipmentSerial(e.target.value)}
                placeholder="시리얼번호를 입력하세요"
                disabled={saving}
              />
            </div>
            <div>
              <Label htmlFor="initialStatus">초기 상태 *</Label>
              <Select value={newEquipmentStatus} onValueChange={setNewEquipmentStatus} disabled={saving}>
                <SelectTrigger>
                  <SelectValue placeholder="초기 상태를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="재고">재고</SelectItem>
                  <SelectItem value="현장자산">현장자산</SelectItem>
                  <SelectItem value="수리대기">수리대기</SelectItem>
                  <SelectItem value="수리중">수리중</SelectItem>
                  <SelectItem value="수리완료">수리완료</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="equipmentLocation">위치 *</Label>
              <Input
                id="equipmentLocation"
                value={newEquipmentLocation}
                onChange={(e) => setNewEquipmentLocation(e.target.value)}
                placeholder="장비 위치를 입력하세요"
                disabled={saving}
              />
            </div>
            <div>
              <Label htmlFor="equipmentNotes">비고</Label>
              <Textarea
                id="equipmentNotes"
                value={newEquipmentNotes}
                onChange={(e) => setNewEquipmentNotes(e.target.value)}
                placeholder="특이사항이나 비고를 입력하세요"
                rows={3}
                disabled={saving}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setIsAddEquipmentDialogOpen(false)}
                disabled={saving}
              >
                취소
              </Button>
              <Button 
                onClick={handleAddEquipment}
                disabled={saving}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                등록
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 상태 변경 다이얼로그 */}
      <Dialog open={isStatusChangeDialogOpen} onOpenChange={setIsStatusChangeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>장비 상태 변경</DialogTitle>
            <DialogDescription>
              장비의 상태를 변경하고 필요한 정보를 입력해 주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>장비명</Label>
              <Input value={selectedEquipment?.name || ''} disabled />
            </div>
            <div>
              <Label>시리얼번호</Label>
              <Input value={selectedEquipment?.serial_number || ''} disabled />
            </div>
            <div>
              <Label>현재 상태</Label>
              <Input value={selectedEquipment?.status || ''} disabled />
            </div>
            <div>
              <Label htmlFor="newStatus">변경할 상태 *</Label>
              <Select value={newStatus} onValueChange={setNewStatus} disabled={saving}>
                <SelectTrigger>
                  <SelectValue placeholder="새로운 상태를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="현장자산">현장자산</SelectItem>
                  <SelectItem value="재고">재고</SelectItem>
                  <SelectItem value="수리대기">수리대기</SelectItem>
                  <SelectItem value="수리중">수리중</SelectItem>
                  <SelectItem value="수리완료">수리완료</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">위치</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="장비 위치를 입력하세요"
                disabled={saving}
              />
            </div>

            {/* 현장자산으로 변경할 때만 표시되는 필드들 */}
            {isCurrentFieldsStatus(newStatus) && (
              <>
                <div>
                  <Label htmlFor="borrower">사용자명</Label>
                  <Input
                    id="borrower"
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    placeholder="사용자 이름을 입력하세요"
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor="borrowDate">불출일</Label>
                  <Input
                    id="borrowDate"
                    type="date"
                    value={borrowDate}
                    onChange={(e) => setBorrowDate(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor="returnDate">수리완료일</Label>
                  <Input
                    id="returnDate"
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="notes">비고</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="특이사항이나 비고를 입력하세요"
                rows={3}
                disabled={saving}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={resetDialogFields}
                disabled={saving}
              >
                취소
              </Button>
              <Button 
                onClick={handleStatusChange}
                disabled={!newStatus || saving}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                상태 변경
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}