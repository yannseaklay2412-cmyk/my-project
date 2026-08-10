import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/layout/Logo.jsx';
import TextField from '../components/ui/TextField.jsx';
import { signup, login } from '../services/auth.js';
import { useAuth } from '../context/AuthContext.jsx';

const CHECKLIST = [
  'Post project ideas and get collaborators',
  'Private team chat for accepted members',
  'Link GitHub and build together',
];

export default function AuthPage() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-1/2 flex-col justify-between bg-neutral-900 p-10 text-white md:flex">
        <Logo variant="light" />

        <div className="pl-6">
          <h1 className="font-display text-4xl font-bold leading-tight">
            Join the student
            <br />
            builder community.
          </h1>
          <p className="mt-4 max-w-sm text-neutral-400">
            Post ideas, find teammates from your university, and ship real projects together.
          </p>
          <ul className="mt-8 space-y-3">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-neutral-200">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime-400 text-xs text-neutral-900">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm italic text-neutral-500">
          "I found my hackathon team here in two days." — CS student, CADT
        </p>
      </aside>

      <main className="flex w-full flex-col items-center justify-center px-4 py-12 sm:px-8 md:w-1/2">
        <div className="w-full max-w-sm rounded-2xl border border-neutral-200 p-8">
          <div className="mx-auto mb-8 flex w-fit rounded-full bg-neutral-100 p-1">
            <Link
              to="/signup"
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                !isLogin ? 'bg-neutral-900 text-white' : 'text-neutral-600'
              }`}
            >
              Sign up
            </Link>
            <Link
              to="/login"
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                isLogin ? 'bg-neutral-900 text-white' : 'text-neutral-600'
              }`}
            >
              Log in
            </Link>
          </div>

          {isLogin ? <LoginForm /> : <SignupForm />}
        </div>
      </main>
    </div>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const { token, user } = await login(form.email, form.password);
      authLogin(token, user);
      navigate('/projects');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900">Log in to your account</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Welcome back to the innovation hub for Cambodian students.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <TextField
          id="email"
          name="email"
          label="Email address"
          type="email"
          placeholder="sophea.chan@student.cadt.edu.kh"
          value={form.email}
          onChange={handleChange}
        />
        <TextField
          id="password"
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          labelExtra={
            <a href="#" className="text-sm font-medium text-lime-600">
              Forgot password?
            </a>
          }
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-full bg-neutral-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
        >
          Log in
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-neutral-500">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="font-semibold text-lime-600">
          Sign up
        </Link>
      </p>

      <div className="mt-6 border-t border-neutral-200 pt-6 text-center text-xs uppercase tracking-wide text-neutral-400">
        Or build instantly with
      </div>
    </div>
  );
}

function SignupForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    universityEmail: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await signup({
        username: form.username,
        email: form.universityEmail,
        password: form.password,
      });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900">Create your account</h2>
      <p className="mt-1 text-sm text-neutral-500">It takes less than a minute to get started.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <TextField
          id="username"
          name="username"
          label="Full name"
          placeholder="e.g. Sophea Chan"
          value={form.username}
          onChange={handleChange}
        />
        <TextField
          id="universityEmail"
          name="universityEmail"
          label="University email"
          type="email"
          placeholder="you@cadt.edu.kh"
          hint="Only approved university domains (.edu.kh) can register."
          value={form.universityEmail}
          onChange={handleChange}
        />
        <TextField
          id="password"
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
        />
        <TextField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-full bg-neutral-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
        >
          Create account
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-lime-600">
          Log in
        </Link>
      </p>
    </div>
  );
}
