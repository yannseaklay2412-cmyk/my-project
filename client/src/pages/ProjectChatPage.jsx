import { useEffect, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import ProjectWorkspaceHeader from '../components/project/ProjectWorkspaceHeader.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getMessages } from '../services/messages.js';
import { createSocket } from '../services/socket.js';
import { getProject, getProjectMembers } from '../services/projects.js';

export default function ProjectChatPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    getProject(id).then(setProject).catch(() => {});
    getProjectMembers(id).then(setMembers).catch(() => []);
  }, [id]);

  const isOwner = Boolean(user && project && String(user.id) === String(project.owner_id));
  const isMember = Boolean(isOwner || (user && members.some((m) => String(m.user_id) === String(user.id))));

  useEffect(() => {
    if (!token) return;

    getMessages(token, id)
      .then(setMessages)
      .catch((err) => setError(err.message));

    const socket = createSocket(token);
    socketRef.current = socket;

    socket.emit('join_project', id);

    socket.on('new_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('error_message', (msg) => setError(msg));
    socket.on('connect_error', (err) => setError(err.message));

    return () => {
      socket.disconnect();
    };
  }, [id, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !socketRef.current) return;

    socketRef.current.emit('send_message', { projectId: id, body });
    setDraft('');
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen flex-col bg-neutral-50">
      <ProjectWorkspaceHeader
        projectId={id}
        projectName={project?.title || 'Project Workspace'}
        active="chat"
      />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden px-4 py-6 sm:px-8">
        <div className="flex-1 space-y-4 overflow-y-auto">
          {messages.map((message) => {
            const isOwn = message.user_id === user?.id;
            return (
              <div key={message.id} className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                <Avatar name={message.sender_name} size="sm" />
                <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
                  isOwn ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900 border border-neutral-200'
                }`}>
                  {!isOwn && <p className="mb-0.5 text-xs font-semibold text-neutral-500">{message.sender_name}</p>}
                  <p>{message.body}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSend} className="mt-4 flex items-center gap-3">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
