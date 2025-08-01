import { useForm } from 'react-hook-form';
import { useLogin } from '../../hooks/auth/useLogin';
import { useRegister } from '../../hooks/auth/useRegister';
import { toast } from 'react-toastify';
import styles from './auth-form.module.css';
import { useContext } from 'react';
import { UserContext } from '../../providers/UserContext';

interface AuthFormProps {
  mode: 'login' | 'register';
}

interface FormValues {
  email: string;
  password: string;
  username?: string;
  githubKey?: string;
}

const AuthForm = ({ mode }: AuthFormProps) => {
  const { register: formRegister, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>();
  const login = useLogin();
  const registerUser = useRegister();
  const { setUser } = useContext(UserContext);

  const onSubmit = async (data: FormValues) => {
    try {
      let user;
      if (mode === 'login') {
        const res = await login({ email: data.email, password: data.password });
        user = res.user;
      } else {
        const res = await registerUser({
          email: data.email,
          password: data.password,
          username: data.username!,
          githubKey: data.githubKey!,
        });
        user = res.user;
      }
      setUser(user);
    } catch (error: unknown) {
      let message = 'Authentication failed';
      if (error && typeof error === 'object') {
        if ('response' in error && typeof error.response === 'object' && error.response && 'data' in error.response && typeof error.response.data === 'object' && error.response.data && 'message' in error.response.data) {
          message = (error.response.data as { message?: string }).message || message;
        } else if ('message' in error && typeof error.message === 'string') {
          message = error.message;
        }
      }
      toast.error(message);
    }
  };

  return (
    <div className={styles.card}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {mode === 'register' && (
          <>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className={styles.label}>Username</label>
              <input
                type="text"
                className={styles.input}
                autoComplete="username"
                placeholder="Enter your username"
                {...formRegister('username', {
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Min 3 characters' },
                  maxLength: { value: 32, message: 'Max 32 characters' },
                })}
              />
              {errors.username && <div className={styles.error}>{errors.username.message}</div>}
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className={styles.label}>GitHub Key</label>
              <input
                type="text"
                className={styles.input}
                autoComplete="off"
                placeholder="Enter your GitHub key"
                {...formRegister('githubKey', {
                  required: 'GitHub key is required',
                  minLength: { value: 10, message: 'Min 10 characters' },
                  maxLength: { value: 128, message: 'Max 128 characters' },
                })}
              />
              {errors.githubKey && <div className={styles.error}>{errors.githubKey.message}</div>}
            </div>
          </>
        )}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            className={styles.input}
            autoComplete="email"
            placeholder="Enter your email"
            {...formRegister('email', { required: 'Email is required', pattern: { value: /.+@.+\..+/, message: 'Invalid email' } })}
          />
          {errors.email && <div className={styles.error}>{errors.email.message}</div>}
        </div>
        <div style={{ marginBottom: '1.25rem' }}>
          <label className={styles.label}>Password</label>
          <input
            type="password"
            className={styles.input}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder="Enter your password"
            {...formRegister('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
          />
          {errors.password && <div className={styles.error}>{errors.password.message}</div>}
        </div>
        <button type="submit" disabled={isSubmitting} className={styles.button}>
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
