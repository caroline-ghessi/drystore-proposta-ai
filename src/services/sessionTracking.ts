
interface SessionLog {
  id: string;
  userId: string;
  userEmail: string;
  loginTime: string;
  ipAddress: string;
  userAgent: string;
  lastActivity: string;
}

class SessionTrackingService {
  private logs: SessionLog[] = [];

  async trackLogin(userId: string, userEmail: string): Promise<void> {
    const sessionLog: SessionLog = {
      id: Date.now().toString(),
      userId,
      userEmail,
      loginTime: new Date().toISOString(),
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      lastActivity: new Date().toISOString()
    };

    this.logs.push(sessionLog);
    localStorage.setItem('drystore_session_logs', JSON.stringify(this.logs));
    console.log('Session tracked:', sessionLog);
  }

  async trackActivity(userId: string): Promise<void> {
    const existingLogIndex = this.logs.findIndex(log => log.userId === userId);
    if (existingLogIndex !== -1) {
      this.logs[existingLogIndex].lastActivity = new Date().toISOString();
      localStorage.setItem('drystore_session_logs', JSON.stringify(this.logs));
    }
  }

  getSessionLogs(): SessionLog[] {
    const stored = localStorage.getItem('drystore_session_logs');
    if (stored) {
      this.logs = JSON.parse(stored);
    }
    return this.logs;
  }

  private async getClientIP(): Promise<string> {
    try {
      // Em produção, isso seria feito pelo backend
      return '192.168.1.1'; // IP simulado
    } catch {
      return 'Unknown';
    }
  }
}

export const sessionTracker = new SessionTrackingService();
