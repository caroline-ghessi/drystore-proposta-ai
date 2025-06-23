
import { supabase } from '@/integrations/supabase/client';

export const useRateLimit = () => {
  const checkRateLimit = async (identifier: string): Promise<boolean> => {
    try {
      // Simplified rate limiting - only check if blocked
      const { data: rateLimit } = await supabase
        .from('auth_rate_limits')
        .select('blocked_until')
        .eq('identifier', identifier)
        .single();

      if (rateLimit?.blocked_until) {
        const blockedUntil = new Date(rateLimit.blocked_until);
        const now = new Date();
        return blockedUntil <= now; // Not blocked if time has passed
      }
      
      return true; // Allow if no rate limit record
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return true; // Allow on error
    }
  };

  const updateRateLimit = async (identifier: string, success: boolean) => {
    // Move to background - don't block login flow
    setTimeout(async () => {
      try {
        const now = new Date();
        
        if (success) {
          // Reset rate limit on successful login
          await supabase
            .from('auth_rate_limits')
            .delete()
            .eq('identifier', identifier);
        } else {
          // Increment failed attempts
          const { data: existing } = await supabase
            .from('auth_rate_limits')
            .select('*')
            .eq('identifier', identifier)
            .single();

          if (existing) {
            const newCount = existing.attempt_count + 1;
            const updateData: any = {
              attempt_count: newCount,
              last_attempt: now.toISOString()
            };

            // Block after 5 attempts
            if (newCount >= 5) {
              updateData.blocked_until = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
            }

            await supabase
              .from('auth_rate_limits')
              .update(updateData)
              .eq('identifier', identifier);
          } else {
            await supabase
              .from('auth_rate_limits')
              .insert({
                identifier,
                attempt_count: 1,
                first_attempt: now.toISOString(),
                last_attempt: now.toISOString()
              });
          }
        }
      } catch (error) {
        console.error('Error updating rate limit:', error);
      }
    }, 0);
  };

  return { checkRateLimit, updateRateLimit };
};
