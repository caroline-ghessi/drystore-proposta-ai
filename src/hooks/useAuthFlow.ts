
import { useSignUp } from './useSignUp';
import { useResetPassword } from './useResetPassword';
import { useUpdatePassword } from './useUpdatePassword';

export const useAuthFlow = () => {
  const { signUp, loading: signUpLoading } = useSignUp();
  const { resetPassword, loading: resetLoading } = useResetPassword();
  const { updatePassword, loading: updateLoading } = useUpdatePassword();

  const loading = signUpLoading || resetLoading || updateLoading;

  return {
    signUp,
    resetPassword,
    updatePassword,
    loading
  };
};
