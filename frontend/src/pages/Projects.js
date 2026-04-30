import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, createProject, deleteProject } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const res = await createProject(form);
      setProjects([...projects, res.data]);
      setShowModal(false);
      setForm({ name: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm('Delete this project?')) return;
    try {
      await deleteProject(id);
      setProjects(projects.filter(p => p._id !== id));
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📁</div>
          <div className="empty-text">
            {user?.role === 'admin' ? 'No projects yet. Create one!' : 'You have no projects assigned.'}
          </div>
        </div>
      ) : (
        <div className="grid grid-3">
          {projects.map(project => (
            <Link to={`/project/${project._id}`} key={project._id} className="project-card">
              <div className="project-name">{project.name}</div>
              <div className="project-desc">{project.description || 'No description'}</div>
              <div className="project-meta">
                <span>👥 {project.members?.length || 0} members</span>
                <span className={`badge badge-${project.status === 'active' ? 'done' : 'todo'}`}>
                  {project.status}
                </span>
                {user?.role === 'admin' && project.owner?._id === user?._id && (
                  <button className="btn btn-sm btn-danger" 
                    onClick={(e) => handleDelete(project._id, e)} 
                    style={{ marginLeft: 'auto' }}>🗑️
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Project</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input className="form-input" value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  placeholder="My Awesome Project" required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })} 
                  placeholder="What is this project about?" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}