import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Logo from '../components/layout/Logo.jsx';
import PillButton from '../components/ui/PillButton.jsx';
import heroAnimation from '../assets/hero-animation.svg?raw';

const STEPS = [
  {
    number: 1,
    title: 'Post your idea',
    description:
      'Share a project idea, the problem it solves, and the skills you need. It goes live on the feed.',
  },
  {
    number: 2,
    title: 'Find collaborators',
    description:
      'Students request to join. You review, accept the right people, and form your team.',
  },
  {
    number: 3,
    title: 'Build & ship',
    description:
      'Coordinate in private chat, link your GitHub repo, divide tasks, and build together.',
  },
];

const FEATURES = [
  {
    icon: '◆',
    title: 'Project feed',
    description: 'Browse and filter student projects by tag, university, or status.',
    bg: 'bg-sky-50',
  },
  {
    icon: '★',
    title: 'Collaboration requests',
    description: 'Request to join, and let owners accept the right teammates.',
    bg: 'bg-amber-50',
  },
  {
    icon: '◆',
    title: 'Private team chat',
    description: 'Real-time chat unlocked for accepted members of each project.',
    bg: 'bg-violet-50',
  },
  {
    icon: '→',
    title: 'Shared resources',
    description: 'Post and upvote useful tools, guides, and platforms.',
    bg: 'bg-rose-50',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-8 sm:py-16 md:grid-cols-2 md:items-center md:gap-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-lime-600">
            Student Project Collaboration
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-neutral-900 sm:text-5xl md:text-6xl">
            Find your team,
            <br />
            <span className="text-lime-500">build something real.</span>
          </h1>
          <p className="mt-5 max-w-md text-neutral-500">
            CollabHub is where Cambodian IT &amp; Computer Science students post project
            ideas, find collaborators, and build together  from first idea to shipped repo.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <PillButton as={Link} to="/signup" variant="dark">
              Get started
            </PillButton>
            <PillButton as={Link} to="/projects" variant="light">
              Browse projects
            </PillButton>
          </div>
        </div>

        <div
          className="relative aspect-2682/1509 overflow-hidden rounded-3xl [&_svg]:h-full [&_svg]:w-full"
          dangerouslySetInnerHTML={{ __html: heroAnimation }}
        />
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-8 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-wide text-lime-600">How it works</p>
        <h2 className="mt-3 text-3xl font-bold text-neutral-900">From idea to shipped project</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number} className="rounded-2xl bg-white p-6 text-left shadow-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lime-400 text-sm font-semibold text-neutral-900">
                {step.number}
              </span>
              <h3 className="mt-4 font-semibold text-neutral-900">{step.title}</h3>
              <p className="mt-2 text-sm text-neutral-500">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 text-center sm:px-8 sm:pb-20">
        <p className="text-xs font-semibold uppercase tracking-wide text-lime-600">Features</p>
        <h2 className="mt-3 text-3xl font-bold text-neutral-900">
          Everything your team needs in one place
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div key={feature.title} className={`rounded-2xl ${feature.bg} p-6 text-left`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-neutral-900">
                {feature.icon}
              </span>
              <h3 className="mt-4 font-semibold text-neutral-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-neutral-500">{feature.description}</p>
              <a href="#" className="mt-3 inline-block text-sm font-medium text-neutral-900">
                Learn more ↗
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-8 sm:pb-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-neutral-900 p-6 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Ready to build something real?</h2>
            <p className="mt-2 text-neutral-400">
              Join CollabHub with your university email and find your next team today.
            </p>
          </div>
          <PillButton as={Link} to="/signup" variant="lime">
            Create your account
          </PillButton>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-neutral-200 px-4 py-8 sm:flex-row sm:px-8">
        <Logo />
        <nav className="flex gap-6 text-sm text-neutral-500">
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#resources">Resources</a>
          <a href="#privacy">Privacy</a>
        </nav>
        <p className="text-sm text-neutral-400">© 2026 CollabHub</p>
      </footer>
    </div>
  );
}
