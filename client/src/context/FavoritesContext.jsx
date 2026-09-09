import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import { getSavedProjects, toggleSaveProject, removeSavedProject } from '../services/projects.js';

const FavoritesContext = createContext(null);

function capitalize(word) {
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}

function normalizeDbProject(row) {
  return {
    id: row.id,
    title: row.title || 'Untitled Project',
    description: row.description || '',
    status: capitalize(row.status || 'Active'),
    tags: row.tech_tags || row.tags || [],
    author: {
      id: row.owner_id,
      name: row.owner_name || 'Unknown',
      university: row.owner_university || 'CollabHub member',
    },
    createdAt: row.created_at ? new Date(row.created_at).getTime() : 0,
    savedAt: row.saved_at ? new Date(row.saved_at).getTime() : Date.now(),
    collaborators: Number(row.collaborators_count ?? 0),
    comments: Number(row.comments_count ?? 0),
  };
}

export function FavoritesProvider({ children }) {
  const { user, token } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Synchronize favorites with user session & PostgreSQL database
  useEffect(() => {
    // Permanently remove legacy shared keys to prevent cross-account contamination
    try {
      localStorage.removeItem('collabhub_favorites');
      localStorage.removeItem('collabhub_favorites_guest');
    } catch {}

    if (!user?.id || !token) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const userKey = `collabhub_favorites_${user.id}`;

    // Read cache for this specific user only for instant render
    try {
      const cached = localStorage.getItem(userKey);
      if (cached) {
        setFavorites(JSON.parse(cached));
      } else {
        setFavorites([]);
      }
    } catch {
      setFavorites([]);
    }

    setLoading(true);
    getSavedProjects(token)
      .then((rows) => {
        if (!isMounted) return;
        if (Array.isArray(rows)) {
          const normalized = rows.map(normalizeDbProject);
          setFavorites(normalized);
          try {
            localStorage.setItem(userKey, JSON.stringify(normalized));
          } catch {}
        }
      })
      .catch((err) => {
        console.error('Failed to fetch user saved projects:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id, token]);

  const refreshFavorites = useCallback(async () => {
    if (!user?.id || !token) {
      setFavorites([]);
      return;
    }

    try {
      const rows = await getSavedProjects(token);
      if (Array.isArray(rows)) {
        const normalized = rows.map(normalizeDbProject);
        setFavorites(normalized);
        const userKey = `collabhub_favorites_${user.id}`;
        localStorage.setItem(userKey, JSON.stringify(normalized));
      }
    } catch (err) {
      console.error('Failed to refresh saved projects:', err);
    }
  }, [user?.id, token]);

  const isFavorite = useCallback(
    (projectId) => {
      if (!user?.id || !projectId) return false;
      return favorites.some((item) => String(item.id) === String(projectId));
    },
    [user?.id, favorites]
  );

  const toggleFavorite = useCallback(
    async (project) => {
      if (!user?.id || !token) {
        return { success: false, requiresAuth: true };
      }
      if (!project || !project.id) return { success: false };

      const projectId = project.id;
      const exists = favorites.some((item) => String(item.id) === String(projectId));
      const previousFavorites = [...favorites];
      const userKey = `collabhub_favorites_${user.id}`;

      let updatedFavorites;
      if (exists) {
        updatedFavorites = favorites.filter((item) => String(item.id) !== String(projectId));
      } else {
        const normalized = {
          id: project.id,
          title: project.title || 'Untitled Project',
          description: project.description || '',
          status: project.status || 'Active',
          tags: project.tags || project.tech_tags || project.techStack || [],
          author: project.author || {
            id: project.owner_id || project.owner?.id,
            name: project.owner_name || project.owner?.name || 'Unknown',
            university: project.owner_university || project.owner?.university || 'CollabHub member',
          },
          createdAt: project.createdAt || (project.created_at ? new Date(project.created_at).getTime() : Date.now()),
          collaborators: Number(project.collaborators_count ?? project.collaborators ?? 0),
          comments: Number(project.comments_count ?? project.comments ?? 0),
          savedAt: Date.now(),
        };
        updatedFavorites = [normalized, ...favorites];
      }

      // Optimistic update
      setFavorites(updatedFavorites);
      try {
        localStorage.setItem(userKey, JSON.stringify(updatedFavorites));
      } catch {}

      try {
        const result = await toggleSaveProject(projectId, token);
        return { success: true, saved: result.saved };
      } catch (err) {
        console.error('Failed to save project on server, rolling back:', err);
        // Rollback to previous state on server failure
        setFavorites(previousFavorites);
        try {
          localStorage.setItem(userKey, JSON.stringify(previousFavorites));
        } catch {}
        return { success: false, error: err.message };
      }
    },
    [user?.id, token, favorites]
  );

  const removeFavorite = useCallback(
    async (projectId) => {
      if (!user?.id || !token || !projectId) return;

      const previousFavorites = [...favorites];
      const updatedFavorites = favorites.filter((item) => String(item.id) !== String(projectId));
      const userKey = `collabhub_favorites_${user.id}`;

      setFavorites(updatedFavorites);
      try {
        localStorage.setItem(userKey, JSON.stringify(updatedFavorites));
      } catch {}

      try {
        await removeSavedProject(projectId, token);
      } catch (err) {
        console.error('Failed to remove saved project from server, rolling back:', err);
        setFavorites(previousFavorites);
        try {
          localStorage.setItem(userKey, JSON.stringify(previousFavorites));
        } catch {}
      }
    },
    [user?.id, token, favorites]
  );

  const updateFavoriteData = useCallback(
    (projectsList) => {
      if (!Array.isArray(projectsList) || projectsList.length === 0 || !user?.id) return;
      setFavorites((prev) => {
        let changed = false;
        const updated = prev.map((fav) => {
          const fresh = projectsList.find((p) => String(p.id) === String(fav.id));
          if (fresh) {
            changed = true;
            return {
              ...fav,
              title: fresh.title || fav.title,
              description: fresh.description || fav.description,
              status: fresh.status || fav.status,
              tags: fresh.tags || fresh.tech_tags || fav.tags,
              author: fresh.author || fav.author,
              collaborators: Number(fresh.collaborators_count ?? fresh.collaborators ?? fav.collaborators ?? 0),
              comments: Number(fresh.comments_count ?? fresh.comments ?? fav.comments ?? 0),
            };
          }
          return fav;
        });

        if (changed) {
          try {
            const userKey = `collabhub_favorites_${user.id}`;
            localStorage.setItem(userKey, JSON.stringify(updated));
          } catch {}
          return updated;
        }
        return prev;
      });
    },
    [user?.id]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        updateFavoriteData,
        refreshFavorites,
        loading,
        count: user?.id ? favorites.length : 0,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
