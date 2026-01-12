import { useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp, DollarSign, Car, ClipboardCheck, Loader2, FileSpreadsheet, CalendarDays, Trophy } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { mockMonthlyStats, mockInspections, mockVehicles } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Reports() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  // Filtrar estatísticas mensais
  const filteredMonthlyStats = useMemo(() => {
    let filtered = mockMonthlyStats;
    
    if (selectedPeriod === 'q1') {
      filtered = filtered.filter(m => ['Jan', 'Fev', 'Mar'].includes(m.month));
    } else if (selectedPeriod === 'q2') {
      filtered = filtered.filter(m => ['Abr', 'Mai', 'Jun'].includes(m.month));
    } else if (selectedPeriod === 'q3') {
      filtered = filtered.filter(m => ['Jul', 'Ago', 'Set'].includes(m.month));
    } else if (selectedPeriod === 'q4') {
      filtered = filtered.filter(m => ['Out', 'Nov', 'Dez'].includes(m.month));
    }
    
    return filtered;
  }, [selectedPeriod]);

  // Filtrar vistorias por data
  const filteredInspections = useMemo(() => {
    return mockInspections.filter(inspection => {
      const inspDate = new Date(inspection.date);
      const inspYear = inspDate.getFullYear().toString();
      const inspMonth = inspDate.getMonth() + 1;
      
      if (inspYear !== selectedYear) return false;
      
      if (selectedPeriod === 'q1' && (inspMonth < 1 || inspMonth > 3)) return false;
      if (selectedPeriod === 'q2' && (inspMonth < 4 || inspMonth > 6)) return false;
      if (selectedPeriod === 'q3' && (inspMonth < 7 || inspMonth > 9)) return false;
      if (selectedPeriod === 'q4' && (inspMonth < 10 || inspMonth > 12)) return false;
      
      return true;
    });
  }, [selectedYear, selectedPeriod]);

  // Filtrar veículos por data de cadastro
  const filteredVehicles = useMemo(() => {
    return mockVehicles.filter(vehicle => {
      const vDate = new Date(vehicle.createdAt);
      const vYear = vDate.getFullYear().toString();
      const vMonth = vDate.getMonth() + 1;
      
      if (vYear !== selectedYear) return false;
      
      if (selectedPeriod === 'q1' && (vMonth < 1 || vMonth > 3)) return false;
      if (selectedPeriod === 'q2' && (vMonth < 4 || vMonth > 6)) return false;
      if (selectedPeriod === 'q3' && (vMonth < 7 || vMonth > 9)) return false;
      if (selectedPeriod === 'q4' && (vMonth < 10 || vMonth > 12)) return false;
      
      return true;
    });
  }, [selectedYear, selectedPeriod]);

  // KPIs calculados com dados filtrados
  const totalRevenue = filteredMonthlyStats.reduce((acc, m) => acc + m.revenue, 0);
  const totalProfit = filteredMonthlyStats.reduce((acc, m) => acc + m.profit, 0);
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';

  const approvedInspections = filteredInspections.filter(i => i.status === 'approved').length;
  const pendingInspections = filteredInspections.filter(i => i.status === 'pending' || i.status === 'in_progress').length;
  const rejectedInspections = filteredInspections.filter(i => i.status === 'rejected').length;
  const approvalRate = filteredInspections.length > 0 
    ? Math.round((approvedInspections / filteredInspections.length) * 100) 
    : 0;

  const activeVehicles = filteredVehicles.filter(v => v.status === 'protected').length;
  const pendingVehicles = filteredVehicles.filter(v => v.status === 'pending').length;
  const expiredVehicles = filteredVehicles.filter(v => v.status === 'expired').length;

  // Dados para gráficos de pizza
  const pieData = [
    { name: 'Aprovadas', value: approvedInspections, color: 'hsl(var(--success))' },
    { name: 'Pendentes', value: pendingInspections, color: 'hsl(var(--warning))' },
    { name: 'Rejeitadas', value: rejectedInspections, color: 'hsl(var(--destructive))' },
  ];

  const vehicleStatusData = [
    { name: 'Protegidos', value: activeVehicles, color: 'hsl(var(--success))' },
    { name: 'Pendentes', value: pendingVehicles, color: 'hsl(var(--warning))' },
    { name: 'Expirados', value: expiredVehicles, color: 'hsl(var(--destructive))' },
  ];

  // Label do período selecionado
  const getPeriodLabel = () => {
    const periodLabels: Record<string, string> = {
      'all': 'Ano completo',
      'q1': '1º Trimestre (Jan-Mar)',
      'q2': '2º Trimestre (Abr-Jun)',
      'q3': '3º Trimestre (Jul-Set)',
      'q4': '4º Trimestre (Out-Dez)',
    };
    return periodLabels[selectedPeriod] || 'Ano completo';
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;
      
      let heightLeft = scaledHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
      heightLeft -= pdfHeight;
      
      while (heightLeft > 0) {
        position = -pdfHeight + (scaledHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, scaledHeight);
        heightLeft -= pdfHeight;
      }
      
      const periodLabel = selectedPeriod === 'all' ? 'completo' : selectedPeriod;
      pdf.save(`relatorio-${selectedYear}-${periodLabel}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF exportado",
        description: `Relatório de ${selectedYear} - ${getPeriodLabel()} baixado com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o PDF.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Funções auxiliares para formatação
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateStr: string) => 
    new Date(dateStr).toLocaleDateString('pt-BR');

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      'approved': 'Aprovada',
      'pending': 'Pendente',
      'in_progress': 'Em Andamento',
      'rejected': 'Rejeitada'
    };
    return map[status] || status;
  };

  const translateVehicleStatus = (status: string) => {
    const map: Record<string, string> = {
      'protected': 'Protegido',
      'pending': 'Pendente',
      'expired': 'Expirado'
    };
    return map[status] || status;
  };

  const translateChecklistItem = (item: string) => {
    const map: Record<string, string> = {
      'exterior': 'Exterior',
      'interior': 'Interior',
      'engine': 'Motor',
      'tires': 'Pneus',
      'documents': 'Documentos',
      'lights': 'Iluminação'
    };
    return map[item] || item;
  };

  const handleExportExcel = () => {
    setIsExportingExcel(true);
    
    try {
      const wb = XLSX.utils.book_new();
      const dataAtual = new Date().toLocaleDateString('pt-BR');
      const taxaAprovacao = filteredInspections.length > 0 
        ? Math.round((approvedInspections / filteredInspections.length) * 100)
        : 0;

      const createSheet = (data: (string | number | undefined)[][], colWidths: number[]) => {
        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = colWidths.map(w => ({ wch: w }));
        return ws;
      };

      // Aba 1: Resumo Executivo
      const resumoData: (string | number | undefined)[][] = [
        ['RELATÓRIO GERENCIAL - PROTECTED CAR'],
        [`Período: ${selectedYear} - ${getPeriodLabel()}`],
        ['Gerado em: ' + dataAtual],
        [],
        ['INDICADORES PRINCIPAIS', '', ''],
        ['Indicador', 'Valor', 'Observação'],
        ['Receita Total', formatCurrency(totalRevenue), ''],
        ['Lucro Líquido', formatCurrency(totalProfit), ''],
        ['Margem de Lucro', profitMargin + '%', 'Meta: 30%'],
        [],
        ['FROTA (no período)', '', ''],
        ['Total de Veículos', filteredVehicles.length, ''],
        ['Veículos Protegidos', activeVehicles, 'Status ativo'],
        ['Veículos Pendentes', pendingVehicles, 'Aguardando vistoria'],
        ['Veículos Expirados', expiredVehicles, 'Requer renovação'],
        [],
        ['VISTORIAS (no período)', '', ''],
        ['Total de Vistorias', filteredInspections.length, ''],
        ['Aprovadas', approvedInspections, ''],
        ['Pendentes', pendingInspections, ''],
        ['Rejeitadas', rejectedInspections, ''],
        ['Taxa de Aprovação', taxaAprovacao + '%', ''],
      ];

      // Aba 2: Estatísticas Mensais
      const mensalData: (string | number | undefined)[][] = [
        [`ESTATÍSTICAS MENSAIS - ${selectedYear} - ${getPeriodLabel()}`],
        [],
        ['Mês', 'Veículos', 'Var %', 'Vistorias', 'Var %', 'Receita (R$)', 'Lucro (R$)', 'Margem %'],
        ...filteredMonthlyStats.map((m, idx) => {
          const prevVehicles = idx > 0 ? filteredMonthlyStats[idx - 1].vehicles : m.vehicles;
          const prevInsp = idx > 0 ? filteredMonthlyStats[idx - 1].inspections : m.inspections;
          const varVehicles = idx > 0 ? ((m.vehicles - prevVehicles) / prevVehicles * 100).toFixed(1) + '%' : '-';
          const varInsp = idx > 0 ? ((m.inspections - prevInsp) / prevInsp * 100).toFixed(1) + '%' : '-';
          return [
            m.month,
            m.vehicles,
            varVehicles,
            m.inspections,
            varInsp,
            formatCurrency(m.revenue),
            formatCurrency(m.profit),
            ((m.profit / m.revenue) * 100).toFixed(1) + '%'
          ];
        }),
        [],
        ['TOTAIS', '', '', '', '', formatCurrency(totalRevenue), formatCurrency(totalProfit), profitMargin + '%']
      ];

      // Aba 3: Vistorias Detalhadas
      const vistoriasData: (string | number | undefined)[][] = [
        [`LISTA DE VISTORIAS - ${selectedYear} - ${getPeriodLabel()}`],
        [],
        ['ID', 'Data', 'Placa', 'Veículo', 'Ano', 'Cor', 'Proprietário', 'Vistoriador', 'Status', 'Observações'],
        ...filteredInspections.map(i => [
          i.id,
          formatDate(i.date),
          i.vehicle.plate,
          i.vehicle.brand + ' ' + i.vehicle.model,
          i.vehicle.year,
          i.vehicle.color,
          i.vehicle.ownerName,
          i.employeeName,
          translateStatus(i.status),
          i.notes || '-'
        ])
      ];

      // Aba 4: Veículos Cadastrados
      const veiculosData: (string | number | undefined)[][] = [
        [`CADASTRO DE VEÍCULOS - ${selectedYear} - ${getPeriodLabel()}`],
        [],
        ['Placa', 'Marca', 'Modelo', 'Ano', 'Cor', 'Proprietário', 'Status', 'Data Cadastro'],
        ...filteredVehicles.map(v => [
          v.plate,
          v.brand,
          v.model,
          v.year,
          v.color,
          v.ownerName,
          translateVehicleStatus(v.status),
          formatDate(v.createdAt)
        ])
      ];

      // Aba 5: Análise Checklist
      const checklistItems: (keyof typeof filteredInspections[0]['checklist'])[] = ['exterior', 'interior', 'engine', 'tires', 'documents', 'lights'];
      const checklistData: (string | number | undefined)[][] = [
        [`ANÁLISE DE CHECKLIST - ${selectedYear} - ${getPeriodLabel()}`],
        [],
        ['Item Verificado', 'Aprovados', 'Reprovados', 'Taxa de Aprovação'],
        ...checklistItems.map(item => {
          const approved = filteredInspections.filter(i => i.checklist[item]).length;
          const total = filteredInspections.length;
          const rejected = total - approved;
          return [
            translateChecklistItem(item),
            approved,
            rejected,
            total > 0 ? ((approved / total) * 100).toFixed(0) + '%' : '0%'
          ];
        }),
        [],
        ['RESUMO', '', '', ''],
        ['Total de Itens Analisados', filteredInspections.length * checklistItems.length, '', ''],
        ['Média de Aprovação por Item', '', '', filteredInspections.length > 0 ? (checklistItems.reduce((acc, item) => {
          return acc + filteredInspections.filter(i => i.checklist[item]).length;
        }, 0) / (filteredInspections.length * checklistItems.length) * 100).toFixed(1) + '%' : '0%']
      ];

      XLSX.utils.book_append_sheet(wb, createSheet(resumoData, [25, 22, 32]), 'Resumo');
      XLSX.utils.book_append_sheet(wb, createSheet(mensalData, [10, 12, 10, 12, 10, 18, 18, 12]), 'Mensal');
      XLSX.utils.book_append_sheet(wb, createSheet(vistoriasData, [6, 12, 12, 22, 8, 12, 22, 18, 15, 40]), 'Vistorias');
      XLSX.utils.book_append_sheet(wb, createSheet(veiculosData, [12, 15, 18, 8, 12, 22, 14, 15]), 'Veículos');
      XLSX.utils.book_append_sheet(wb, createSheet(checklistData, [20, 15, 15, 20]), 'Checklist');

      const periodLabel = selectedPeriod === 'all' ? 'completo' : selectedPeriod;
      XLSX.writeFile(wb, `relatorio-protectedcar-${selectedYear}-${periodLabel}-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Excel exportado com sucesso!",
        description: `Relatório de ${selectedYear} - ${getPeriodLabel()} com 5 abas detalhadas.`
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o Excel.",
        variant: "destructive"
      });
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <AppLayout title="Relatórios">
      <div className="space-y-6 animate-fade-in">
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                <SelectItem value="q1">1º Trimestre</SelectItem>
                <SelectItem value="q2">2º Trimestre</SelectItem>
                <SelectItem value="q3">3º Trimestre</SelectItem>
                <SelectItem value="q4">4º Trimestre</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="gap-1.5 py-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {selectedYear} - {getPeriodLabel()}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => navigate('/rankings')}
            >
              <Trophy className="h-4 w-4" />
              Ver Rankings
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleExportExcel}
              disabled={isExportingExcel}
            >
              {isExportingExcel ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4" />
                  Exportar Excel
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exportar PDF
                </>
              )}
            </Button>
          </div>
        </div>

        <div ref={reportRef} className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Receita Total</p>
                    <p className="text-2xl font-bold text-foreground">
                      {totalRevenue > 0 ? `R$ ${(totalRevenue / 1000).toFixed(0)}k` : 'R$ 0'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {filteredMonthlyStats.length} meses
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-success/10 to-success/5">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                    <p className="text-2xl font-bold text-foreground">
                      {totalProfit > 0 ? `R$ ${(totalProfit / 1000).toFixed(0)}k` : 'R$ 0'}
                    </p>
                    <p className="text-sm text-success flex items-center gap-1 mt-1">
                      <TrendingUp className="h-4 w-4" /> Margem: {profitMargin}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Veículos Ativos</p>
                    <p className="text-2xl font-bold text-foreground">{activeVehicles}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      de {filteredVehicles.length} no período
                    </p>
                  </div>
                  <Car className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Aprovação</p>
                    <p className="text-2xl font-bold text-foreground">{approvalRate}%</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {filteredInspections.length} vistorias
                    </p>
                  </div>
                  <ClipboardCheck className="h-8 w-8 text-warning" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Receita vs Lucro Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={filteredMonthlyStats}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => `R$ ${(value / 1000).toFixed(1)}k`}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Receita"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      name="Lucro"
                      stroke="hsl(var(--success))"
                      fillOpacity={1}
                      fill="url(#colorProfit)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Veículos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredMonthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar
                      dataKey="vehicles"
                      name="Veículos"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="inspections"
                      name="Vistorias"
                      fill="hsl(var(--accent))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 - Pie Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status das Vistorias</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status dos Veículos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={vehicleStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {vehicleStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
