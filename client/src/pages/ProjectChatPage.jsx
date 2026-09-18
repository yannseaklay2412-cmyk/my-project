import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import ProjectWorkspaceHeader from '../components/project/ProjectWorkspaceHeader.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getMessages } from '../services/messages.js';
import { createSocket } from '../services/socket.js';
import { getProject, getProjectMembers } from '../services/projects.js';
import { getMyCollaborationRequest } from '../services/collaboration.js';

export default function ProjectChatPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [myRequest, setMyRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');

    Promise.all([
      getProject(id).catch(() => null),
      getProjectMembers(id).catch(() => []),
      token ? getMyCollaborationRequest(id, token).catch(() => null) : Promise.resolve(null),
    ])
      .then(([pData, mData, reqData]) => {
        if (pData) setProject(pData);
        if (Array.isArray(mData)) setMembers(mData);
        if (reqData) setMyRequest(reqData);
      })
      .catch((err) => setError(err.message || 'Failed to load project details'))
      .finally(() => setLoading(false));
  }, [id, token]);

  const isOwner = Boolean(user && project && String(user.id) === String(project.owner_id));
  const isMember = Boolean(
    isOwner ||
    (user && (
      members.some((m) => String(m.user_id) === String(user.id)) ||
      myRequest?.status === 'accepted'
    ))
  );

  useEffect(() => {
    // Only proceed once project details have finished loading and the user is verified
    if (loading || !token || !id || (!isOwner && !isMember)) return;

    let isMounted = true;
    setError('');

    // Fetch initial chat history
    getMessages(token, id)
      .then((data) => {
        if (isMounted) setMessages(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Could not load messages');
      });

    // Initialize Socket.io connection
    const socket = createSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_project', id);
    });

    if (socket.connected) {
      socket.emit('join_project', id);
    }

    socket.on('new_message', (message) => {
      if (isMounted) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    });

    socket.on('error_message', (msg) => {
      if (isMounted) setError(msg);
    });

    socket.on('connect_error', (err) => {
      if (isMounted) setError(err.message || 'Connection to chat server failed');
    });

    return () => {
      isMounted = false;
      socket.disconnect();
      socketRef.current = null;
    };
  }, [id, token, loading, isOwner, isMember]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;

    if (!socketRef.current) {
      setError('Chat server connection is not ready. Please try again in a moment.');
      return;
    }

    socketRef.current.emit('send_message', { projectId: id, body });
    setDraft('');
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="flex h-[100dvh] flex-col bg-neutral-50">
        <ProjectWorkspaceHeader
          projectId={id}
          projectName="Project Workspace"
          active="chat"
        />
        <main className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500 text-sm">
            <svg className="h-5 w-5 animate-spin text-neutral-900" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Connecting to project chat...</span>
          </div>
        </main>
      </div>
    );
  }

  if (user && !isOwner && !isMember) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-4">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-neutral-900">Team Chat Private</h2>
          <p className="mt-2 text-sm text-neutral-600">
            The project team chat is only accessible to the project owner and accepted team members.
          </p>
          <Link
            to={`/projects/${id}/overview`}
            className="mt-6 inline-flex rounded-full bg-neutral-900 px-6 py-2 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
          >
            Back to Project Overview
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-neutral-50">
      <ProjectWorkspaceHeader
        projectId={id}
        projectName={project?.title || 'Project Workspace'}
        active="chat"
      />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden px-3 py-4 sm:px-8 sm:py-6">
        <div className="flex-1 space-y-3 sm:space-y-4 overflow-y-auto px-1">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-6 text-neutral-400">
              <svg className="h-10 w-10 text-neutral-300 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm font-semibold text-neutral-700">No messages yet</p>
              <p className="text-xs text-neutral-500 mt-1">Start the conversation with your team!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = String(message.user_id) === String(user?.id);
              return (
                <div key={message.id} className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <Avatar name={message.sender_name} size="sm" />
                  <div className={`max-w-[82%] sm:max-w-xs rounded-2xl px-3.5 py-2 sm:px-4 text-xs sm:text-sm break-words ${
                    isOwn ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900 border border-neutral-200'
                  }`}>
                    {!isOwn && <p className="mb-0.5 text-[11px] font-semibold text-neutral-500">{message.sender_name}</p>}
                    <p>{message.body}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {error && <p className="mt-2 text-xs sm:text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSend} className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 min-w-0 rounded-full border border-neutral-200 bg-white px-3.5 sm:px-4 py-2 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-neutral-900 px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-neutral-800 shrink-0 transition-colors"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
