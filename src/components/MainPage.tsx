import { useState, useEffect, useCallback } from 'react';
import { loadPortfolioData, getImageUrl } from '@/lib/data';
import { databases } from '@/lib/appwrite';
import { uploadImage } from '@/lib/storage';
import { ID, Permission, Role } from 'appwrite';
import type { PortfolioData, User, Project } from '@/types';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'main';

interface MainPageProps {
  user: User;
  onLogout: () => void;
}

export default function MainPage({ user, onLogout }: MainPageProps) {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [memoTitle, setMemoTitle] = useState('');
  const [memoDesc, setMemoDesc] = useState('');
  const [memoSaving, setMemoSaving] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await loadPortfolioData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddProject = async () => {
    if (!memoTitle.trim()) return;
    try {
      setMemoSaving(true);
      await databases.createDocument(
        DATABASE_ID,
        'projects',
        ID.unique(),
        {
          title: memoTitle.trim(),
          description: memoDesc.trim(),
          image: '',
          tags: [],
          link: '',
          sort_order: (data?.projects.length || 0) + 1,
          user_id: user.id,
        },
        [
          Permission.read(Role.any()),
          Permission.write(Role.user(user.id)),
        ]
      );
      setMemoTitle('');
      setMemoDesc('');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project.');
    } finally {
      setMemoSaving(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, 'projects', projectId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      setUploadError(null);
      const url = await uploadImage(file, 'projects');
      await databases.createDocument(
        DATABASE_ID,
        'projects',
        ID.unique(),
        {
          title: file.name.replace(/\.[^.]+$/, ''),
          description: 'Uploaded image',
          image: url,
          tags: ['image'],
          link: '',
          sort_order: (data?.projects.length || 0) + 1,
          user_id: user.id,
        },
        [
          Permission.read(Role.any()),
          Permission.write(Role.user(user.id)),
        ]
      );
      await loadData();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload image.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md w-full">
          <div className="text-5xl mb-4">😢</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Cannot load data</h2>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <p className="text-gray-400 text-xs mb-4">
            Make sure your Appwrite database has site_config, profiles, and projects collections.
          </p>
          <button
            onClick={loadData}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const profile = data?.profile;
  const projects = data?.projects || [];
  const config = data?.config;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            {config?.site_name || 'JustVibeIt'}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.name || user.email}</span>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {profile && (
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center gap-4">
              {profile.avatar && (
                <img
                  src={getImageUrl(profile.avatar)}
                  alt={profile.name}
                  className="w-16 h-16 rounded-full border-2 border-white/30 object-cover"
                />
              )}
              <div>
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <p className="text-white/80">{profile.title}</p>
                {profile.bio && <p className="text-white/60 text-sm mt-1">{profile.bio}</p>}
              </div>
            </div>
            {profile.links.length > 0 && (
              <div className="flex gap-3 mt-4">
                {profile.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              📝 Projects <span className="text-xs font-normal text-gray-400">Database</span>
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Save and load projects from Appwrite Database.
            </p>

            <div className="space-y-3 mb-6">
              <input
                type="text"
                placeholder="Project name"
                value={memoTitle}
                onChange={(e) => setMemoTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
              />
              <textarea
                placeholder="Description (optional)"
                value={memoDesc}
                onChange={(e) => setMemoDesc(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
              <button
                onClick={handleAddProject}
                disabled={!memoTitle.trim() || memoSaving}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {memoSaving ? 'Saving...' : 'Add Project'}
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Projects ({projects.length})
                </span>
                <button onClick={loadData} className="text-xs text-indigo-600 hover:text-indigo-800">
                  Refresh
                </button>
              </div>

              {projects.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No projects yet. Add one above!
                </p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {projects.map((project: Project) => (
                    <div
                      key={project.id}
                      className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {project.title}
                          </h4>
                          {project.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                          {project.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {project.tags.map((tag) => (
                                <span key={tag} className="text-xs text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-xs text-red-400 hover:text-red-600 shrink-0 px-2 py-1"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 mb-2">💡 Appwrite APIs used</p>
              <code className="text-xs text-gray-600 block space-y-1">
                <span className="block">databases.listDocuments()</span>
                <span className="block">databases.createDocument()</span>
                <span className="block">databases.deleteDocument()</span>
              </code>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              🖼️ Images <span className="text-xs font-normal text-gray-400">Storage</span>
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Upload images to Appwrite Storage and link them to projects.
            </p>

            {uploadError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                {uploadError}
              </div>
            )}

            <label className="block mb-6">
              <div className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${uploading
                  ? 'border-indigo-300 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'}
              `}>
                {uploading ? (
                  <p className="text-sm text-indigo-600">Uploading...</p>
                ) : (
                  <>
                    <p className="text-3xl mb-2">📁</p>
                    <p className="text-sm text-gray-600">Click to select an image</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP (max 5MB)</p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            <div>
              <span className="text-sm font-medium text-gray-700 mb-3 block">
                Projects with images
              </span>
              {projects.filter((p) => p.image).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No images yet. Upload one above!
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {projects
                    .filter((p) => p.image)
                    .map((project) => (
                      <div
                        key={project.id}
                        className="border border-gray-100 rounded-lg overflow-hidden"
                      >
                        <img
                          src={getImageUrl(project.image)}
                          alt={project.title}
                          className="w-full h-32 object-cover"
                          loading="lazy"
                        />
                        <div className="p-2">
                          <p className="text-xs text-gray-700 truncate">{project.title}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 mb-2">💡 Appwrite APIs used</p>
              <code className="text-xs text-gray-600 block space-y-1">
                <span className="block">storage.createFile()</span>
                <span className="block">storage.getFileView()</span>
                <span className="block">storage.deleteFile()</span>
              </code>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-gray-900 mb-3">📚 Appwrite Setup Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-700 mb-2">📝 Database Collections</p>
              <ul className="space-y-1 text-gray-600 text-xs">
                <li><code className="bg-gray-200 px-1 rounded">site_config</code> - Site settings</li>
                <li><code className="bg-gray-200 px-1 rounded">profiles</code> - Profile info</li>
                <li><code className="bg-gray-200 px-1 rounded">projects</code> - Project list</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-700 mb-2">🖼️ Storage</p>
              <ul className="space-y-1 text-gray-600 text-xs">
                <li>Bucket: <code className="bg-gray-200 px-1 rounded">images</code></li>
                <li>Max file size: 5MB</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-700 mb-2">🔐 Auth</p>
              <ul className="space-y-1 text-gray-600 text-xs">
                <li>Google OAuth login</li>
                <li>Configure in Appwrite Console</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
