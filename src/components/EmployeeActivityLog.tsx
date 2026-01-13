import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, ExternalLink } from 'lucide-react';
import { useAudit } from '@/contexts/AuditContext';
import { useAuth } from '@/contexts/AuthContext';
import { AuditTimeline } from './AuditTimeline';
import { useState } from 'react';
import { EmployeeActivityDialog } from './EmployeeActivityDialog';

export function EmployeeActivityLog() {
  const { user } = useAuth();
  const { getLogsByUser } = useAudit();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const userId = user?.id || '';
  const userLogs = getLogsByUser(userId);
  
  if (!user) return null;

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Minhas Atividades
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1 text-xs"
              onClick={() => setDialogOpen(true)}
            >
              Ver Todas
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {userLogs.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              Nenhuma atividade registrada ainda.
            </div>
          ) : (
            <AuditTimeline 
              logs={userLogs} 
              maxItems={5} 
              showEntity={true}
              personalizedView
            />
          )}
        </CardContent>
      </Card>
      
      <EmployeeActivityDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        userId={userId}
      />
    </>
  );
}
