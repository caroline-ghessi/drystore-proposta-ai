
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const StatusTab = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Status da Configuração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Badge variant="default">SMTP Resend: Configurado</Badge>
          <Badge variant="secondary">Template: Supabase Padrão</Badge>
          <Badge variant="outline">Configuração: Simplificada</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">URLs Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div>
            <strong>Supabase Auth:</strong><br />
            <code>https://mlzgeceiinjwpffgsxuy.supabase.co</code>
          </div>
          <div>
            <strong>Reset URL:</strong><br />
            <code>{window.location.origin}/reset-password</code>
          </div>
          <div>
            <strong>Resend Dashboard:</strong><br />
            <code>https://resend.com/domains</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
