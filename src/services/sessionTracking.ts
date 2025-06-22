
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
    try {
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
      
      // Use setTimeout to make this async and not block login
      setTimeout(() => {
        try {
          localStorage.setItem('drystore_session_logs', JSON.stringify(this.logs));
          console.log('Session tracked:', sessionLog);
        } catch (error) {
          console.error('Error saving session log:', error);
        }
      }, 0);
    } catch (error) {
      console.error('Error tracking login:', error);
      // Don't throw error to avoid blocking login
    }
  }

  async trackActivity(userId: string): Promise<void> {
    try {
      // Use setTimeout to make this async
      setTimeout(() => {
        try {
          const existingLogIndex = this.logs.findIndex(log => log.userId === userId);
          if (existingLogIndex !== -1) {
            this.logs[existingLogIndex].lastActivity = new Date().toISOString();
            localStorage.setItem('drystore_session_logs', JSON.stringify(this.logs));
          }
        } catch (error) {
          console.error('Error tracking activity:', error);
        }
      }, 0);
    } catch (error) {
      console.error('Error in trackActivity:', error);
      // Don't throw error to avoid blocking UI
    }
  }

  getSessionLogs(): SessionLog[] {
    try {
      const stored = localStorage.getItem('drystore_session_logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
      return this.logs;
    } catch (error) {
      console.error('Error getting session logs:', error);
      return [];
    }
  }

  private async getClientIP(): Promise<string> {
    try {
      // Simplified IP detection - don't make external calls that could slow down login
      return '127.0.0.1'; // Local fallback
    } catch {
      return 'Unknown';
    }
  }
}

export const sessionTracker = new SessionTrackingService();
