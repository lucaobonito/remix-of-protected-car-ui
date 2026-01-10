import { useRef, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, TrendingUp, TrendingDown, DollarSign, Car, ClipboardCheck, Users, Loader2, FileSpreadsheet } from 'lucide-react';
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
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const pieData = [
    { name: 'Aprovadas', value: mockInspections.filter(i => i.status === 'approved').length, color: 'hsl(var(--success))' },
    { name: 'Pendentes', value: mockInspections.filter(i => i.status === 'pending' || i.status === 'in_progress').length, color: 'hsl(var(--warning))' },
    { name: 'Rejeitadas', value: mockInspections.filter(i => i.status === 'rejected').length, color: 'hsl(var(--destructive))' },
  ];

  const vehicleStatusData = [
    { name: 'Protegidos', value: mockVehicles.filter(v => v.status === 'protected').length, color: 'hsl(var(--success))' },
    { name: 'Pendentes', value: mockVehicles.filter(v => v.status === 'pending').length, color: 'hsl(var(--warning))' },
    { name: 'Expirados', value: mockVehicles.filter(v => v.status === 'expired').length, color: 'hsl(var(--destructive))' },
  ];

  const totalRevenue = mockMonthlyStats.reduce((acc, m) => acc + m.revenue, 0);
  const totalProfit = mockMonthlyStats.reduce((acc, m) => acc + m.profit, 0);
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);

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
      
      pdf.save(`relatorio-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF exportado",
        description: "O relatório foi baixado com sucesso."
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
      const taxaAprovacao = Math.round((mockInspections.filter(i => i.status === 'approved').length / mockInspections.length) * 100);

      // Função auxiliar para criar planilha com largura de colunas
      const createSheet = (data: (string | number | undefined)[][], colWidths: number[]) => {
        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = colWidths.map(w => ({ wch: w }));
        return ws;
      };

      // ===== ABA 1: RESUMO EXECUTIVO =====
      const resumoData: (string | number | undefined)[][] = [
        ['RELATÓRIO GERENCIAL - PROTECTED CAR'],
        ['Gerado em: ' + dataAtual],
        [],
        ['INDICADORES PRINCIPAIS', '', ''],
        ['Indicador', 'Valor', 'Observação'],
        ['Receita Total', formatCurrency(totalRevenue), '+15.3% vs período anterior'],
        ['Lucro Líquido', formatCurrency(totalProfit), '+12.1% vs período anterior'],
        ['Margem de Lucro', profitMargin + '%', 'Meta: 30%'],
        [],
        ['FROTA', '', ''],
        ['Total de Veículos', mockVehicles.length, ''],
        ['Veículos Protegidos', mockVehicles.filter(v => v.status === 'protected').length, 'Status ativo'],
        ['Veículos Pendentes', mockVehicles.filter(v => v.status === 'pending').length, 'Aguardando vistoria'],
        ['Veículos Expirados', mockVehicles.filter(v => v.status === 'expired').length, 'Requer renovação'],
        [],
        ['VISTORIAS', '', ''],
        ['Total de Vistorias', mockInspections.length, ''],
        ['Aprovadas', mockInspections.filter(i => i.status === 'approved').length, ''],
        ['Pendentes', mockInspections.filter(i => i.status === 'pending' || i.status === 'in_progress').length, ''],
        ['Rejeitadas', mockInspections.filter(i => i.status === 'rejected').length, ''],
        ['Taxa de Aprovação', taxaAprovacao + '%', ''],
      ];

      // ===== ABA 2: ESTATÍSTICAS MENSAIS =====
      const mensalData: (string | number | undefined)[][] = [
        ['ESTATÍSTICAS MENSAIS - ' + new Date().getFullYear()],
        [],
        ['Mês', 'Veículos', 'Var %', 'Vistorias', 'Var %', 'Receita (R$)', 'Lucro (R$)', 'Margem %'],
        ...mockMonthlyStats.map((m, idx) => {
          const prevVehicles = idx > 0 ? mockMonthlyStats[idx - 1].vehicles : m.vehicles;
          const prevInsp = idx > 0 ? mockMonthlyStats[idx - 1].inspections : m.inspections;
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

      // ===== ABA 3: VISTORIAS DETALHADAS =====
      const vistoriasData: (string | number | undefined)[][] = [
        ['LISTA DE VISTORIAS'],
        [],
        ['ID', 'Data', 'Placa', 'Veículo', 'Ano', 'Cor', 'Proprietário', 'Vistoriador', 'Status', 'Observações'],
        ...mockInspections.map(i => [
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

      // ===== ABA 4: VEÍCULOS CADASTRADOS =====
      const veiculosData: (string | number | undefined)[][] = [
        ['CADASTRO DE VEÍCULOS'],
        [],
        ['Placa', 'Marca', 'Modelo', 'Ano', 'Cor', 'Proprietário', 'Status', 'Data Cadastro'],
        ...mockVehicles.map(v => [
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

      // ===== ABA 5: ANÁLISE CHECKLIST =====
      const checklistItems: (keyof typeof mockInspections[0]['checklist'])[] = ['exterior', 'interior', 'engine', 'tires', 'documents', 'lights'];
      const checklistData: (string | number | undefined)[][] = [
        ['ANÁLISE DE CHECKLIST'],
        [],
        ['Item Verificado', 'Aprovados', 'Reprovados', 'Taxa de Aprovação'],
        ...checklistItems.map(item => {
          const approved = mockInspections.filter(i => i.checklist[item]).length;
          const total = mockInspections.length;
          const rejected = total - approved;
          return [
            translateChecklistItem(item),
            approved,
            rejected,
            ((approved / total) * 100).toFixed(0) + '%'
          ];
        }),
        [],
        ['RESUMO', '', '', ''],
        ['Total de Itens Analisados', mockInspections.length * checklistItems.length, '', ''],
        ['Média de Aprovação por Item', '', '', (checklistItems.reduce((acc, item) => {
          return acc + mockInspections.filter(i => i.checklist[item]).length;
        }, 0) / (mockInspections.length * checklistItems.length) * 100).toFixed(1) + '%']
      ];

      // Criar abas com largura de colunas otimizada
      XLSX.utils.book_append_sheet(wb, createSheet(resumoData, [25, 22, 32]), 'Resumo');
      XLSX.utils.book_append_sheet(wb, createSheet(mensalData, [10, 12, 10, 12, 10, 18, 18, 12]), 'Mensal');
      XLSX.utils.book_append_sheet(wb, createSheet(vistoriasData, [6, 12, 12, 22, 8, 12, 22, 18, 15, 40]), 'Vistorias');
      XLSX.utils.book_append_sheet(wb, createSheet(veiculosData, [12, 15, 18, 8, 12, 22, 14, 15]), 'Veículos');
      XLSX.utils.book_append_sheet(wb, createSheet(checklistData, [20, 15, 15, 20]), 'Checklist');

      XLSX.writeFile(wb, `relatorio-protectedcar-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Excel exportado com sucesso!",
        description: "Relatório completo com 5 abas detalhadas."
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
          <div className="flex gap-4">
            <Select defaultValue="2024">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                <SelectItem value="q1">1º Trimestre</SelectItem>
                <SelectItem value="q2">2º Trimestre</SelectItem>
              </SelectContent>
          </Select>
          </div>
          <div className="flex gap-2">
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
                  <p className="text-2xl font-bold text-foreground">R$ {(totalRevenue / 1000).toFixed(0)}k</p>
                  <p className="text-sm text-success flex items-center gap-1 mt-1">
                    <TrendingUp className="h-4 w-4" /> +15.3%
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
                  <p className="text-2xl font-bold text-foreground">R$ {(totalProfit / 1000).toFixed(0)}k</p>
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
                  <p className="text-2xl font-bold text-foreground">{mockVehicles.filter(v => v.status === 'protected').length}</p>
                  <p className="text-sm text-success flex items-center gap-1 mt-1">
                    <TrendingUp className="h-4 w-4" /> +8 este mês
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
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round((mockInspections.filter(i => i.status === 'approved').length / mockInspections.length) * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {mockInspections.length} vistorias
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
                <AreaChart data={mockMonthlyStats}>
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
                <BarChart data={mockMonthlyStats}>
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
                  <Legend />
                  <Bar dataKey="vehicles" name="Veículos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="inspections" name="Vistorias" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
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
