import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TextField from '../components/ui/TextField.jsx';
import TextArea from '../components/ui/TextArea.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { updateProfile } from '../services/auth.js';

export default function ProfileEditPage() {
  const { user, token, setUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    bio: user?.bio || '',
    university: user?.university || '',
    year: user?.year || '',
    major: user?.major || '',
    github_url: user?.github_url || '',
    skills: (user?.skills || []).join(', '),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const skills = form.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    try {
      const updatedUser = await updateProfile(token, { ...form, skills });
      setUser(updatedUser);
      navigate(`/u/${user.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Link
        to={`/u/${user?.id}`}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to profile
      </Link>

      <h1 className="text-2xl font-bold text-neutral-900">Edit profile</h1>
      <p className="mt-1 text-sm text-neutral-500">
        This information appears on your public profile page.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <TextArea
          id="bio"
          name="bio"
          label="About"
          rows={4}
          placeholder="Tell people about yourself..."
          value={form.bio}
          onChange={handleChange}
        />
        <TextField
          id="university"
          name="university"
          label="University"
          placeholder="e.g. CADT"
          value={form.university}
          onChange={handleChange}
        />
        <TextField
          id="year"
          name="year"
          label="Year"
          placeholder="e.g. Year 3"
          value={form.year}
          onChange={handleChange}
        />
        <TextField
          id="major"
          name="major"
          label="Major"
          placeholder="e.g. Computer Science"
          value={form.major}
          onChange={handleChange}
        />
        <TextField
          id="github_url"
          name="github_url"
          label="GitHub profile URL"
          placeholder="https://github.com/yourname"
          value={form.github_url}
          onChange={handleChange}
        />
        <TextField
          id="skills"
          name="skills"
          label="Skills"
          hint="Separate each skill with a comma"
          placeholder="React, Node.js, PostgreSQL"
          value={form.skills}
          onChange={handleChange}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Save changes
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
