import { useRef, useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp, TrendingDown, DollarSign, Car, ClipboardCheck, Users, Loader2, FileSpreadsheet, CalendarDays, User, Trophy, Medal, Target, Award, Star, AlertTriangle, CheckCircle2, TrendingDown as TrendingDownIcon } from 'lucide-react';
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
import { mockMonthlyStats, mockInspections, mockVehicles, Inspection } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Reports() {
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');

  // Mapeamento de meses para números
  const monthToNumber: Record<string, number> = {
    'Jan': 1, 'Fev': 2, 'Mar': 3, 'Abr': 4, 'Mai': 5, 'Jun': 6,
    'Jul': 7, 'Ago': 8, 'Set': 9, 'Out': 10, 'Nov': 11, 'Dez': 12
  };

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

  // Extrair lista única de vistoriadores
  const employees = useMemo(() => {
    const uniqueEmployees = new Map<string, { id: string; name: string }>();
    mockInspections.forEach(i => {
      if (!uniqueEmployees.has(i.employeeId)) {
        uniqueEmployees.set(i.employeeId, { 
          id: i.employeeId, 
          name: i.employeeName 
        });
      }
    });
    return Array.from(uniqueEmployees.values());
  }, []);

  // Filtrar vistorias por data e vistoriador
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
      
      // Filtro por vistoriador
      if (selectedEmployee !== 'all' && inspection.employeeId !== selectedEmployee) return false;
      
      return true;
    });
  }, [selectedYear, selectedPeriod, selectedEmployee]);

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

  // Dados de desempenho por vistoriador (para gráfico comparativo)
  const employeePerformanceData = useMemo(() => {
    // Usar vistorias filtradas por ano e período, mas ignorar filtro de funcionário
    const inspectionsForComparison = mockInspections.filter(inspection => {
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

    return employees.map(emp => {
      const empInspections = inspectionsForComparison.filter(i => i.employeeId === emp.id);
      const approved = empInspections.filter(i => i.status === 'approved').length;
      const total = empInspections.length;
      const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
      
      return {
        id: emp.id,
        name: emp.name.split(' ')[0],
        fullName: emp.name,
        total,
        aprovadas: approved,
        pendentes: empInspections.filter(i => i.status === 'pending' || i.status === 'in_progress').length,
        rejeitadas: empInspections.filter(i => i.status === 'rejected').length,
        approvalRate,
      };
    });
  }, [employees, selectedYear, selectedPeriod]);

  // Metas por período
  const goals = useMemo(() => {
    const periodMultiplier = selectedPeriod === 'all' ? 12 : 3; // meses
    return {
      minInspections: 5 * periodMultiplier, // 5 vistorias/mês
      targetInspections: 8 * periodMultiplier, // 8 vistorias/mês
      minApprovalRate: 70, // 70% mínimo
      targetApprovalRate: 85, // 85% meta
    };
  }, [selectedPeriod]);

  // Ranking ordenado por desempenho (aprovações + taxa)
  const employeeRanking = useMemo(() => {
    return [...employeePerformanceData]
      .map(emp => ({
        ...emp,
        score: emp.aprovadas * 10 + emp.approvalRate, // Pontuação combinada
        metInspectionGoal: emp.total >= goals.minInspections,
        exceededInspectionGoal: emp.total >= goals.targetInspections,
        metApprovalGoal: emp.approvalRate >= goals.minApprovalRate,
        exceededApprovalGoal: emp.approvalRate >= goals.targetApprovalRate,
      }))
      .sort((a, b) => b.score - a.score);
  }, [employeePerformanceData, goals]);

  // ========== SISTEMA DE RANKING DE VISTORIAS ==========

  // Função para calcular pontuação de cada vistoria
  const calculateInspectionScore = (inspection: Inspection) => {
    let score = 0;
    
    // 1. Status (máx 40 pontos)
    if (inspection.status === 'approved') score += 40;
    else if (inspection.status === 'in_progress') score += 20;
    else if (inspection.status === 'pending') score += 10;
    // rejected = 0 pontos
    
    // 2. Checklist completo (máx 60 pontos - 10 por item)
    const checklistItems = ['exterior', 'interior', 'engine', 'tires', 'documents', 'lights'] as const;
    checklistItems.forEach(item => {
      if (inspection.checklist[item]) score += 10;
    });
    
    return score; // Máximo: 100 pontos
  };

  // Definir rating baseado na pontuação
  const getQualityInfo = (score: number) => {
    if (score >= 90) return { rating: 5, label: 'Excelente', color: 'text-success' };
    if (score >= 70) return { rating: 4, label: 'Bom', color: 'text-lime-500' };
    if (score >= 50) return { rating: 3, label: 'Regular', color: 'text-warning' };
    if (score >= 30) return { rating: 2, label: 'Ruim', color: 'text-orange-500' };
    return { rating: 1, label: 'Crítico', color: 'text-destructive' };
  };

  // Ranking de vistorias
  const inspectionRanking = useMemo(() => {
    return filteredInspections
      .map(inspection => {
        const score = calculateInspectionScore(inspection);
        const checklistComplete = Object.values(inspection.checklist).filter(Boolean).length;
        const qualityInfo = getQualityInfo(score);
        
        return {
          ...inspection,
          score,
          checklistComplete,
          checklistTotal: 6,
          ...qualityInfo,
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [filteredInspections]);

  // Estatísticas do ranking
  const rankingStats = useMemo(() => {
    if (inspectionRanking.length === 0) {
      return { averageScore: 0, excellent: 0, good: 0, regular: 0, bad: 0, critical: 0, maxScore: 0 };
    }
    
    const averageScore = Math.round(
      inspectionRanking.reduce((acc, i) => acc + i.score, 0) / inspectionRanking.length
    );
    
    return {
      averageScore,
      excellent: inspectionRanking.filter(i => i.rating === 5).length,
      good: inspectionRanking.filter(i => i.rating === 4).length,
      regular: inspectionRanking.filter(i => i.rating === 3).length,
      bad: inspectionRanking.filter(i => i.rating === 2).length,
      critical: inspectionRanking.filter(i => i.rating === 1).length,
      maxScore: inspectionRanking.filter(i => i.score === 100).length,
    };
  }, [inspectionRanking]);

  // Distribuição de qualidade para gráfico
  const qualityDistribution = useMemo(() => [
    { name: 'Excelente', value: rankingStats.excellent, fill: 'hsl(var(--success))' },
    { name: 'Bom', value: rankingStats.good, fill: 'hsl(142 71% 45%)' },
    { name: 'Regular', value: rankingStats.regular, fill: 'hsl(var(--warning))' },
    { name: 'Ruim', value: rankingStats.bad, fill: 'hsl(25 95% 53%)' },
    { name: 'Crítico', value: rankingStats.critical, fill: 'hsl(var(--destructive))' },
  ], [rankingStats]);

  // Componente de estrelas
  const RatingStars = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4",
            star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );

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

  const getEmployeeLabel = () => {
    if (selectedEmployee === 'all') return null;
    return employees.find(e => e.id === selectedEmployee)?.name;
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

      // Função auxiliar para criar planilha com largura de colunas
      const createSheet = (data: (string | number | undefined)[][], colWidths: number[]) => {
        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = colWidths.map(w => ({ wch: w }));
        return ws;
      };

      // ===== ABA 1: RESUMO EXECUTIVO =====
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

      // ===== ABA 2: ESTATÍSTICAS MENSAIS =====
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

      // ===== ABA 3: VISTORIAS DETALHADAS =====
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

      // ===== ABA 4: VEÍCULOS CADASTRADOS =====
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

      // ===== ABA 5: ANÁLISE CHECKLIST =====
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

      // ===== ABA 6: DESEMPENHO POR VISTORIADOR =====
      const vistoriadoresData: (string | number | undefined)[][] = [
        [`DESEMPENHO POR VISTORIADOR - ${selectedYear} - ${getPeriodLabel()}`],
        [],
        ['Vistoriador', 'Total', 'Aprovadas', 'Pendentes', 'Rejeitadas', 'Taxa Aprovação'],
        ...employeePerformanceData.map(emp => {
          const rate = emp.total > 0 ? Math.round((emp.aprovadas / emp.total) * 100) : 0;
          return [emp.fullName, emp.total, emp.aprovadas, emp.pendentes, emp.rejeitadas, rate + '%'];
        })
      ];

      // ===== ABA 7: RANKING DE VISTORIAS =====
      const rankingVistoriasData: (string | number | undefined)[][] = [
        [`RANKING DE VISTORIAS - ${selectedYear} - ${getPeriodLabel()}`],
        [],
        ['Posição', 'Placa', 'Veículo', 'Vistoriador', 'Data', 'Pontuação', 'Classificação', 'Checklist'],
        ...inspectionRanking.map((insp, idx) => [
          idx + 1,
          insp.vehicle.plate,
          insp.vehicle.brand + ' ' + insp.vehicle.model,
          insp.employeeName,
          formatDate(insp.date),
          insp.score + '/100',
          insp.label,
          insp.checklistComplete + '/' + insp.checklistTotal
        ]),
        [],
        ['RESUMO DE QUALIDADE', '', '', '', '', '', '', ''],
        ['Média de Pontuação', rankingStats.averageScore + '/100', '', '', '', '', '', ''],
        ['Vistorias Excelentes (90+)', rankingStats.excellent, '', '', '', '', '', ''],
        ['Vistorias Boas (70-89)', rankingStats.good, '', '', '', '', '', ''],
        ['Vistorias Regulares (50-69)', rankingStats.regular, '', '', '', '', '', ''],
        ['Vistorias Ruins (30-49)', rankingStats.bad, '', '', '', '', '', ''],
        ['Vistorias Críticas (0-29)', rankingStats.critical, '', '', '', '', '', ''],
      ];

      // Criar abas com largura de colunas otimizada
      XLSX.utils.book_append_sheet(wb, createSheet(resumoData, [25, 22, 32]), 'Resumo');
      XLSX.utils.book_append_sheet(wb, createSheet(mensalData, [10, 12, 10, 12, 10, 18, 18, 12]), 'Mensal');
      XLSX.utils.book_append_sheet(wb, createSheet(vistoriasData, [6, 12, 12, 22, 8, 12, 22, 18, 15, 40]), 'Vistorias');
      XLSX.utils.book_append_sheet(wb, createSheet(veiculosData, [12, 15, 18, 8, 12, 22, 14, 15]), 'Veículos');
      XLSX.utils.book_append_sheet(wb, createSheet(checklistData, [20, 15, 15, 20]), 'Checklist');
      XLSX.utils.book_append_sheet(wb, createSheet(vistoriadoresData, [25, 10, 12, 12, 12, 18]), 'Vistoriadores');
      XLSX.utils.book_append_sheet(wb, createSheet(rankingVistoriasData, [10, 12, 22, 20, 12, 12, 14, 10]), 'Ranking Vistorias');

      const periodLabel = selectedPeriod === 'all' ? 'completo' : selectedPeriod;
      const employeeName = selectedEmployee !== 'all' 
        ? `-${employees.find(e => e.id === selectedEmployee)?.name.replace(' ', '_')}`
        : '';
      XLSX.writeFile(wb, `relatorio-protectedcar-${selectedYear}-${periodLabel}${employeeName}-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Excel exportado com sucesso!",
        description: `Relatório de ${selectedYear} - ${getPeriodLabel()} com 7 abas detalhadas.`
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
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-48">
                <User className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Vistoriador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os vistoriadores</SelectItem>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="gap-1.5 py-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {selectedYear} - {getPeriodLabel()}
              {getEmployeeLabel() && <> | {getEmployeeLabel()}</>}
            </Badge>
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

        {/* Card de Estatísticas do Vistoriador Selecionado */}
        {selectedEmployee !== 'all' && (
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Estatísticas de</p>
                  <p className="text-lg font-bold text-foreground">
                    {getEmployeeLabel()}
                  </p>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total de Vistorias</p>
                      <p className="text-xl font-semibold">{filteredInspections.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Aprovadas</p>
                      <p className="text-xl font-semibold text-success">{approvedInspections}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pendentes</p>
                      <p className="text-xl font-semibold text-warning">{pendingInspections}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rejeitadas</p>
                      <p className="text-xl font-semibold text-destructive">{rejectedInspections}</p>
                    </div>
                  </div>
                </div>
                <User className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Gráfico Comparativo de Vistoriadores */}
        {selectedEmployee === 'all' && employeePerformanceData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Desempenho por Vistoriador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={employeePerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [value, name]}
                  />
                  <Legend />
                  <Bar dataKey="aprovadas" stackId="a" fill="hsl(var(--success))" name="Aprovadas" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pendentes" stackId="a" fill="hsl(var(--warning))" name="Pendentes" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="rejeitadas" stackId="a" fill="hsl(var(--destructive))" name="Rejeitadas" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Ranking de Vistoriadores */}
        {selectedEmployee === 'all' && employeeRanking.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Ranking de Vistoriadores
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Metas do período: {goals.targetInspections} vistorias | {goals.targetApprovalRate}% aprovação
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employeeRanking.map((emp, index) => {
                  const isFirst = index === 0;
                  const isSecond = index === 1;
                  const isThird = index === 2;
                  
                  return (
                    <div 
                      key={emp.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                        isFirst 
                          ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 border-amber-500/30' 
                          : isSecond 
                            ? 'bg-gradient-to-r from-slate-400/10 to-slate-400/5 border-slate-400/30'
                            : isThird
                              ? 'bg-gradient-to-r from-orange-600/10 to-orange-600/5 border-orange-600/30'
                              : 'bg-muted/30 border-border'
                      }`}
                    >
                      {/* Posição */}
                      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                        {isFirst ? (
                          <Trophy className="h-8 w-8 text-amber-500" />
                        ) : isSecond ? (
                          <Medal className="h-8 w-8 text-slate-400" />
                        ) : isThird ? (
                          <Medal className="h-8 w-8 text-orange-600" />
                        ) : (
                          <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                        )}
                      </div>

                      {/* Info do vistoriador */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground truncate">{emp.fullName}</p>
                          {isFirst && (
                            <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                              <Star className="h-3 w-3 mr-1" />
                              Top Performer
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 mt-1 text-sm">
                          <span className="text-muted-foreground">
                            {emp.total} vistorias
                          </span>
                          <span className="text-success">
                            {emp.aprovadas} aprovadas
                          </span>
                          <span className={`font-medium ${
                            emp.approvalRate >= goals.targetApprovalRate 
                              ? 'text-success' 
                              : emp.approvalRate >= goals.minApprovalRate 
                                ? 'text-warning' 
                                : 'text-destructive'
                          }`}>
                            {emp.approvalRate}% aprovação
                          </span>
                        </div>
                      </div>

                      {/* Indicadores de metas */}
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {emp.exceededInspectionGoal ? (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-xs">
                            <Target className="h-3 w-3" />
                            Meta Vistorias
                          </div>
                        ) : emp.metInspectionGoal ? (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-warning/10 text-warning text-xs">
                            <Target className="h-3 w-3" />
                            Mínimo
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs">
                            <Target className="h-3 w-3" />
                            Abaixo
                          </div>
                        )}
                        
                        {emp.exceededApprovalGoal ? (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-xs">
                            <Award className="h-3 w-3" />
                            Meta Qualidade
                          </div>
                        ) : emp.metApprovalGoal ? (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-warning/10 text-warning text-xs">
                            <Award className="h-3 w-3" />
                            Mínimo
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs">
                            <Award className="h-3 w-3" />
                            Abaixo
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legenda de Metas */}
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-2">Legenda de Metas</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                    <span className="text-muted-foreground">Meta atingida ({goals.targetInspections}+ vistorias, {goals.targetApprovalRate}%+ aprovação)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-warning"></div>
                    <span className="text-muted-foreground">Mínimo atingido ({goals.minInspections}+ vistorias, {goals.minApprovalRate}%+ aprovação)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                    <span className="text-muted-foreground">Abaixo do mínimo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-3 w-3 text-amber-500" />
                    <span className="text-muted-foreground">Melhor desempenho do período</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========== RANKING DE VISTORIAS ========== */}
        {inspectionRanking.length > 0 && (
          <>
            {/* Cards de Estatísticas do Ranking */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pontuação Média</p>
                      <p className="text-3xl font-bold text-foreground">
                        {rankingStats.averageScore}<span className="text-lg text-muted-foreground">/100</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {inspectionRanking.length} vistorias analisadas
                      </p>
                    </div>
                    <ClipboardCheck className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-success/10 to-success/5">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Top Performers</p>
                      <p className="text-3xl font-bold text-foreground">{rankingStats.excellent + rankingStats.good}</p>
                      <p className="text-sm text-success mt-1">
                        Vistorias Excelentes/Boas
                      </p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Precisam Atenção</p>
                      <p className="text-3xl font-bold text-foreground">{rankingStats.bad + rankingStats.critical}</p>
                      <p className="text-sm text-destructive mt-1">
                        Vistorias Ruins/Críticas
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top 5 e Atenção */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top 5 Melhores */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    Top 5 Melhores Vistorias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inspectionRanking.slice(0, 5).map((insp, index) => (
                      <div 
                        key={insp.id}
                        className={cn(
                          "flex items-center gap-4 p-3 rounded-lg border",
                          index === 0 && "bg-gradient-to-r from-amber-500/10 to-amber-500/5 border-amber-500/30",
                          index === 1 && "bg-gradient-to-r from-slate-400/10 to-slate-400/5 border-slate-400/30",
                          index === 2 && "bg-gradient-to-r from-orange-600/10 to-orange-600/5 border-orange-600/30",
                          index > 2 && "bg-muted/30"
                        )}
                      >
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                          {index === 0 ? (
                            <Trophy className="h-6 w-6 text-amber-500" />
                          ) : index === 1 ? (
                            <Medal className="h-6 w-6 text-slate-400" />
                          ) : index === 2 ? (
                            <Medal className="h-6 w-6 text-orange-600" />
                          ) : (
                            <span className="text-xl font-bold text-muted-foreground">#{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold truncate">{insp.vehicle.plate}</p>
                            <Badge variant="outline" className="text-xs">
                              {insp.vehicle.brand} {insp.vehicle.model}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span>{insp.employeeName}</span>
                            <span>•</span>
                            <span>{new Date(insp.date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="font-bold text-lg">{insp.score}<span className="text-sm text-muted-foreground">/100</span></p>
                          <RatingStars rating={insp.rating} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Precisam de Atenção */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Vistorias que Precisam de Atenção
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inspectionRanking
                      .filter(i => i.rating <= 2)
                      .slice(0, 5)
                      .map((insp) => {
                        const missingItems = Object.entries(insp.checklist)
                          .filter(([_, value]) => !value)
                          .map(([key]) => translateChecklistItem(key));
                        
                        return (
                          <div 
                            key={insp.id}
                            className="flex items-center gap-4 p-3 rounded-lg border border-destructive/20 bg-destructive/5"
                          >
                            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-destructive/10">
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold truncate">{insp.vehicle.plate}</p>
                                <Badge variant="destructive" className="text-xs">
                                  {insp.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {missingItems.length > 0 
                                  ? `Faltam: ${missingItems.join(', ')}`
                                  : `Status: ${translateStatus(insp.status)}`
                                }
                              </p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <p className="font-bold text-lg text-destructive">{insp.score}<span className="text-sm">/100</span></p>
                              <RatingStars rating={insp.rating} />
                            </div>
                          </div>
                        );
                      })}
                    {inspectionRanking.filter(i => i.rating <= 2).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-success" />
                        <p>Nenhuma vistoria crítica neste período!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Distribuição de Qualidade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400" />
                  Distribuição de Qualidade das Vistorias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={qualityDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value} vistorias`, 'Quantidade']}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[0, 4, 4, 0]}
                    >
                      {qualityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Legenda de classificação */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-2">Critérios de Pontuação</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-muted-foreground">Status aprovado: 40 pts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-muted-foreground">Cada item checklist: 10 pts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-muted-foreground">Pontuação máxima: 100 pts</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        </div>
      </div>
    </AppLayout>
  );
}
