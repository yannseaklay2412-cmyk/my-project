# CollabHub — Build Roadmap & Learning Guide

*Your senior-dev-and-teacher's plan for building the Student Project Collaboration Platform.*

This is the map of the whole journey. Read it once end-to-end to get the shape of the thing, then we'll walk it phase by phase together. You don't need to understand every detail yet — the point right now is to see *why the order is what it is*.

---

## Part 1 — The mental model (read this first)

You're comfortable on the frontend, so here's the single most important shift for the backend world:

**The frontend is untrusted. The backend is the only place truth lives.**

On the frontend, if you hide a button, a user "can't" click it. On the backend, you assume every user is holding a hacked browser that will send any request it wants. So every rule that matters — "only the project owner can accept members," "only accepted members can read this chat" — has to be enforced *on the server*, every single time, no exceptions. The client-side version of that rule is just a convenience for honest users. This one idea is behind ~80% of the security in this app.

Here's how a single request flows through the system. Internalize this picture:

```
[ Browser / React ]
      |  fetch('/api/projects', { headers: { Authorization: 'Bearer <JWT>' } })
      v
[ Express Server ]
      |  1. Route     — "a POST to /api/projects goes here"
      |  2. Middleware — "is this JWT valid? who is this user? are they allowed?"
      |  3. Controller — "read the request, decide what to do, shape the response"
      |  4. Model      — "the ONLY place that runs SQL"
      v
[ PostgreSQL ]
```

Four layers, each with one job. The discipline of keeping them separate is what keeps a growing app from turning into spaghetti — and your spec already demands it ("routes → controllers → models, with `pg` queries isolated in the model layer"). We'll honor that from day one.

A few vocabulary anchors, since these are the backend words you'll live in:

- **REST API** — your backend is just a set of URLs (endpoints) the frontend calls to get/change data. `GET /api/projects` reads, `POST /api/projects` creates, `PATCH` updates, `DELETE` removes.
- **Middleware** — a function that runs *between* the request arriving and the controller handling it. Auth checks live here. Think of it as a bouncer at the door.
- **JWT (JSON Web Token)** — a signed string the server hands the browser at login. The browser sends it back on every request to prove "I'm still logged in as user 42." The server can verify the signature without a database lookup. It's a stamped ticket, not a password.
- **Hashing (bcrypt)** — a one-way scramble of the password. You store the scramble, never the password. At login you scramble what they typed and compare scrambles. Even you, with full database access, can never see anyone's password.
- **Migration** — a versioned SQL script that builds/changes your database structure. Instead of clicking around in a DB tool, you write the schema as code so it's repeatable and reviewable.

If those five make sense, you're ready for everything below.

---

## Part 2 — The phases

Each phase lists: the **goal**, **what you build**, **what you'll learn** (the teaching payload), and **"done when"** — a concrete finish line so you always know if a phase is actually complete. We do them in this order because each one depends on the one before it. You can't guard a chat room by membership (Phase 7) before members exist (Phase 4), and nothing works before there's a database to hold it (Phase 1).

### Phase 0 — Environment & project skeleton
**Goal:** A running (empty) backend and a clean folder structure, with secrets handled correctly from the very first commit.

**What you build:**
- Confirm Node/npm/Postgres versions.
- `server/` folder: `npm init`, install `express pg bcrypt jsonwebtoken dotenv`, set `"type": "module"`.
- A `.env` file (git-ignored) and a `.env.example` (committed) holding `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `SMTP_*`.
- A minimal Express server that starts and answers `GET /api/health` with `{ ok: true }`.
- The layered folder structure: `routes/ controllers/ models/ middleware/ db/`.

**What you'll learn:** How a Node project is wired together, why `.env` never gets committed (this is the #1 way beginners leak passwords and API keys to GitHub), and how the request → response cycle works with the simplest possible endpoint.

**Done when:** You hit `http://localhost:PORT/api/health` in your browser and see `{ ok: true }`.

### Phase 1 — Database schema (migrations)
**Goal:** Every table the app will ever need, designed up front, created by a repeatable script. Your spec explicitly says do this *first* — and it's right.

**What you build:** SQL migration(s) creating tables for `users`, `projects`, `project_members`, `collaboration_requests`, `comments`, `messages`, `resources`, `resource_votes`, plus the join/relationship keys between them. We design the shape now even for features (like chat) we build much later, so we don't have to rip up the foundation halfway.

**What you'll learn:** Relational thinking — how a "project has many members" becomes a `project_members` table with foreign keys; primary keys, foreign keys, constraints (like `UNIQUE` on email), and indexes (what makes searches fast). This is the backbone; a good schema makes every later phase easier and a bad one makes all of them painful. We'll spend real time here.

**Done when:** Running your migration against a fresh database produces all tables with correct relationships, and you can describe *why each table exists* in one sentence.

### Phase 2 — Auth: signup → email verify → login *(the big security phase)*
**Goal:** Users can register with a university email, prove they own it, and log in — securely.

**What you build:**
- **Signup:** validate the email is from an allowed university domain (from a *configurable list*, per your spec), hash the password with bcrypt, create an inactive user, generate a verification token, email a confirmation link via nodemailer.
- **Verify:** the link hits an endpoint that marks the account active.
- **Login:** check email+password against the bcrypt hash, and *only if the account is verified*, issue a JWT.
- **Auth middleware:** the reusable bouncer that reads the `Authorization: Bearer <token>` header, verifies the JWT, and attaches `req.user` for every protected route downstream.

**What you'll learn:** This is the heart of your weak spot, so we go slow. Password hashing and salting (and why bcrypt specifically). The full token lifecycle. Why verification matters (it's your only wall against fake/non-student accounts in v1). The critical difference between **authentication** ("who are you?") and **authorization** ("are you allowed to do *this*?") — you'll build both here.

**Decision — how we gate registration (settled):** v1 is **email-only**, no ID cards. The gate is two layers: the **domain allow-list** checks the *shape* of the email (approved university domain), and **email verification** proves the person actually *controls* that mailbox — verification is the layer with real teeth. This proves "owns a mailbox at an approved university domain"; it does *not* prove current enrollment or that they study IT/CS specifically — accepted v1 tradeoffs. Student-ID verification (manual review, and/or OCR) is deliberately **deferred**: it needs a human reviewer + a new platform-admin role + a review screen, and storing ID cards means holding sensitive personal data we'd then be responsible for securing. Add it later *only* if real students turn out to be locked out.

**Enforcement rules to get right in this phase:**
- Allow-list lives **server-side and configurable** (config/DB, not hardcoded `if`s) so a new university can be added without a code change.
- **Normalize before comparing:** lowercase + trim the email, so `Me@UPP.edu.kh ` matches `me@upp.edu.kh`.
- Decide **subdomains** deliberately (is `student.upp.edu.kh` allowed, or only the bare domain?) and match exactly.
- Verification **token is single-use and expires** (e.g. 24h).
- Avoid **account enumeration** — signup errors must not reveal whether an email is already registered.
- **Rate-limit** signup and login against spam/brute-force.

**Done when:** You can register, receive the email, click the link, log in, get a token, and call a protected endpoint that rejects you without a valid token and accepts you with one.

### Phase 3 — Project posts & the feed
**Goal:** Verified users can create projects; anyone can browse, search, and filter them.

**What you build:** `POST /api/projects` (create — protected), `GET /api/projects` (list, with `?tag=&university=&status=` query filters), `GET /api/projects/:id` (detail). Owner is stamped as `owner_id = req.user.id` at creation.

**What you'll learn:** The full CRUD pattern end to end through all four layers — this becomes the template you'll reuse for comments and resources. How to turn URL query params into safe, dynamic SQL filters. And your first **ownership** rule: the creator becomes that project's owner (a per-project role, not a site-wide admin).

**Done when:** You can create a project via the API, then fetch it back in a filtered list.

### Phase 4 — Collaboration requests (accept / decline)
**Goal:** Users request to join a project; the owner — and *only* the owner — accepts or declines.

**What you build:** `POST /api/projects/:id/requests` (any verified user), `GET /api/projects/:id/requests` (owner-only), `PATCH .../requests/:reqId` to accept/decline. On accept, insert a row into `project_members`.

**What you'll learn:** **Resource-scoped authorization** — the middleware that answers "is *this specific user* the owner of *this specific project*?" This is a genuine step up from "is the user logged in," and it's exactly the kind of check that, done wrong, lets any user accept themselves into any project. We'll write it carefully and test that it says *no* when it should.

**Done when:** A non-owner gets a `403 Forbidden` trying to accept a request; the owner succeeds, and the accepted user appears in the members list.

### Phase 5 — Public comments
**Goal:** Any verified user can comment on any project, no approval needed.

**What you build:** `POST /api/projects/:id/comments`, `GET /api/projects/:id/comments`. Deliberately *simpler* auth than Phase 4 — just "logged in," no ownership.

**What you'll learn:** How to *right-size* authorization — not everything needs a heavy permission check, and over-locking features is its own kind of bug. Good practice reps on the CRUD pattern, plus a first look at input sanitization so a comment can't inject markup/script into other users' browsers (XSS).

**Done when:** Two different users can comment on the same project and both comments render on the detail view.

### Phase 6 — GitHub repo display
**Goal:** Show live stats (stars, open issues, last updated) for a project's linked repo.

**What you build:** The owner saves a public repo URL on the project. The **frontend** calls GitHub's public REST API directly and renders a stats card. Per your spec, the backend isn't involved here at all.

**What you'll learn:** A nice breather in your comfort zone — calling a third-party API from React, handling loading/error states, and rate limits. Also a small architecture lesson: *not every feature needs your backend*, and recognizing which ones don't keeps the server lean.

**Done when:** Pasting a real public repo URL shows its current star/issue counts on the project page.

### Phase 7 — Private project chat (WebSockets) *(the second hard phase)*
**Goal:** A live group chat per project, visible only to the owner + accepted members, with history that survives reload.

**What you build:** A WebSocket server alongside Express. On connect, authenticate with the same JWT. When a socket tries to join a project's room, the server checks `project_members` *before* letting it in. Messages are broadcast live **and** saved to Postgres so history reloads. Removing a member evicts their socket immediately.

**What you'll learn:** The other major new concept — real-time, persistent connections, which behave very differently from request/response. Reusing your JWT to authenticate a socket (not just HTTP), scoping broadcasts to a room, and — the security crux — enforcing membership on *join* and on *every message*, not just once. This is Phase 4's authorization idea applied to a live connection.

**Done when:** Two accepted members chat in real time, a non-member is refused the room, and reloading the page reloads the message history.

### Phase 8 — Resource sharing
**Goal:** A platform-wide feed where users post useful tools/links, upvote, and comment.

**What you build:** `POST/GET /api/resources` with category filter and sort-by (recency / upvotes), plus an upvote endpoint that prevents double-voting (that's what the `resource_votes` table is for).

**What you'll learn:** This phase is your **graduation exam** — it reuses every pattern you've learned (CRUD, auth, filtering, a join table for votes) with almost no new concepts. If you can build this one largely on your own with me reviewing, you've genuinely learned the backend.

**Done when:** A user posts a resource, another upvotes it once (a second upvote is rejected), and the feed re-sorts by popularity.

### Phase 9 — Hardening & deployment
**Goal:** Take it from "works on my laptop" to "safely live on the internet."

**What you build:** Frontend to Vercel/Netlify; backend + managed Postgres to Render/Railway/Fly. Real environment variables in the host (never committed). Plus a security pass (see the checklist below).

**What you'll learn:** The gap between local and production — CORS, HTTPS, connection strings, why secrets live in the host's config and not your code, and how to not take the whole app down with one bad deploy.

**Done when:** A friend on their phone, on a different network, can sign up and use it.

---

## Part 3 — Security (the cross-cutting checklist)

Security isn't a phase — it's a habit applied in every phase. Here's the running checklist we'll hold every feature against. You don't need to act on it now; it's here so you know what "done right" means as we go.

- **Never trust the client.** Every rule enforced server-side, every time.
- **Passwords:** bcrypt hashed, always. Never logged, never returned in an API response, never stored plain.
- **Secrets in `.env` only.** `.env` is git-ignored from commit #1. If a secret ever touches a commit, it's compromised and must be rotated.
- **SQL injection:** always use *parameterized queries* (`$1, $2` with the `pg` driver) — never build SQL by gluing strings with user input. We'll make this reflex from Phase 1.
- **Authorization on every protected action**, scoped to the specific resource — not just "logged in," but "allowed to touch *this* row."
- **Input validation on both client and server.** The client version is UX; the server version is the real defense.
- **XSS:** treat all user text as untrusted when rendering it.
- **JWT hygiene:** a strong random `JWT_SECRET`, a sensible expiry, and tokens sent over HTTPS in production.
- **Rate-limiting / abuse:** at least on login and signup, so nobody can brute-force or spam-register (we'll add this around Phase 2/9).

---

## Part 4 — How we'll work together

We go one phase at a time. For each phase I'll: (1) explain the concepts and the *why* before any code, (2) we build it — with you writing the parts that teach the most and me handling boilerplate, per your "mix" instinct, (3) we test it against its "done when" line, and (4) I point out what to watch for security-wise before we move on. You can stop me to ask "why" at any point — that's the whole point of doing it this way instead of me just dumping a finished repo on you.

**When you're ready, we start at Phase 0** — confirming your toolchain and standing up the empty server. It's a gentle first step and it makes sure your machine is actually ready before we get into the deep stuff.

*One honest caveat from your teacher: I've laid out the order and the finish lines, but real projects wander — a schema decision in Phase 1 sometimes only reveals itself as wrong in Phase 4. That's normal, not failure. The roadmap is a guide, not a contract.*

---

## Part 5 — Phase 10 (optional / future): The AI assistant

**Decision:** Yes to a chatbot, but *not in v1* — build it only after the platform stands on its own and has real projects and users in it. It is deliberately **narrow**: it advises, it never acts on a user's behalf (no accepting members, no posting, no deleting — those keep all the Phase 4 authorization rules). Two responsibilities only:

### Job B — Process / how-to guidance *(build this first — it's the easy half)*
Explains CollabHub's end-to-end collaboration flow to nervous or first-time users. Example question: *"I'm new — how do I actually start a project with other people?"* The bot answers with your platform's real workflow:

1. Browse the project feed and find one that fits you.
2. Send a **Request to Collaborate** with a short note about your skills.
3. The owner accepts → you become a **Project Member**.
4. You now get access to the project's **private chat**.
5. In the chat: introduce yourselves and open the linked **GitHub repo**.
6. **Divide up the tasks** together in the chat.
7. Do the actual coding on **GitHub**, together.
8. The owner moves the project's status along: Open → In Progress → Completed.

**Why it's easy:** this answer is *fixed platform knowledge* — it doesn't change per user. You write these steps into the bot's system instructions once. Low cost, low risk of a wrong answer. Writing this flow out cleanly also doubles as a sanity check on whether the app itself is easy to follow.

### Job A — Project recommendation / matchmaking *(build second — valuable but harder)*
Suggests good-fit **open** projects based on who the student is. Example: *"I'm a first-year data science student — what kind of project should I join?"* The bot considers the currently-posted projects (title, description, tags, status) and recommends fitting ones. **Advisory only** — it points the student at a project; they still click "Request to Collaborate" themselves.

**Why it's harder:** the bot must *see your live project data*, which a generic AI does not know. That's the real work here — bridging the AI to your own data, either by having the backend pass the current open-project list into the bot's context per request, or by letting the bot query your projects API. This is why it comes after the platform exists: an empty site has nothing to recommend.

### Explicitly out of scope for the bot
General homework/coding help, anything unrelated to CollabHub, and any *action* taken on the user's behalf. If the bot can't do something that a bot living *inside CollabHub* is uniquely able to do, it shouldn't do it at all — users already have general AI in another tab.

### The one security rule that never changes
The AI provider's API key lives on the **backend only**, never in the frontend. The browser talks to your server; your server talks to the AI provider. A key shipped to the browser is a key anyone can steal from dev tools and run up your bill with. Same "the frontend is untrusted" principle from Part 1 — it applies here too.

**Build order:** platform (Phases 0–9) → Job B (fixed knowledge, easy) → Job A (needs the live-data bridge).
