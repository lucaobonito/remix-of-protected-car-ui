import { History, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useNavigationHistory, NavigationEntry } from '@/contexts/NavigationHistoryContext';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HistoryItemProps {
  entry: NavigationEntry;
  onNavigate: (path: string) => void;
}

const HistoryItem = ({ entry, onNavigate }: HistoryItemProps) => {
  const Icon = entry.icon;
  const timeAgo = formatDistanceToNow(entry.timestamp, { 
    addSuffix: true, 
    locale: ptBR 
  });

  return (
    <DropdownMenuItem
      className="flex items-start gap-3 p-3 cursor-pointer"
      onClick={() => onNavigate(entry.path)}
    >
      <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{entry.title}</p>
        <p className="text-xs text-muted-foreground">
          Visitado {timeAgo}
        </p>
      </div>
    </DropdownMenuItem>
  );
};

export const NavigationHistoryDropdown = () => {
  const { history, clearHistory } = useNavigationHistory();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <History className="h-5 w-5" />
          {history.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
              {history.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-popover">
        <DropdownMenuLabel className="flex items-center gap-2">
          <History className="h-4 w-4" />
          Histórico de Navegação
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {history.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Nenhuma página visitada ainda
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[300px]">
              {history.map((entry, index) => (
                <HistoryItem
                  key={`${entry.path}-${index}`}
                  entry={entry}
                  onNavigate={handleNavigate}
                />
              ))}
            </ScrollArea>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center justify-center gap-2 text-destructive cursor-pointer"
              onClick={clearHistory}
            >
              <Trash2 className="h-4 w-4" />
              Limpar Histórico
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
