
import { Card, CardContent } from '@/components/ui/card';

export const ResetPasswordLoadingState = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600">Verificando link de recuperação...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
