import { ReactNode, useState, DragEvent } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KanbanColumnProps {
  title: string;
  count: number;
  colorClass: string;
  status: string;
  onDrop: (inspectionId: string, newStatus: string) => void;
  children: ReactNode;
}

export function KanbanColumn({ title, count, colorClass, status, onDrop, children }: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const inspectionId = e.dataTransfer.getData('inspectionId');
    if (inspectionId) {
      onDrop(inspectionId, status);
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col bg-muted/30 rounded-lg min-w-[280px] w-full max-w-[350px] transition-all duration-200",
        isDragOver && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 rounded-t-lg",
        colorClass
      )}>
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-background/20 text-xs font-bold">
          {count}
        </span>
      </div>

      {/* Column Content */}
      <ScrollArea className="flex-1 h-[calc(100vh-320px)] min-h-[400px]">
        <div className="p-3 space-y-3">
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}
