import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProject, getTasks, createTask, updateTask, deleteTask, getUsers, addMember } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });
  const [selectedUser, setSelectedUser] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [projectRes, tasksRes, usersRes] = await Promise.all([
        getProject(id),
        getTasks({ project: id }),
        getUsers()
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      await createTask({ ...form, projectId: id });
      setShowTaskModal(false);
      setForm({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally { setSaving(false); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSaving(true);
    try {
      await addMember(id, { userId: selectedUser, role: 'member' });
      setShowMemberModal(false);
      setSelectedUser('');
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (err) { console.error(err); }
  };

  const isAdmin = user?.role === 'admin' ||
    project?.members?.find(m => m.user._id === user?._id)?.role === 'admin' ||
    project?.owner?._id === user?._id;

  const memberIds = project?.members?.map(m => m.user._id) || [];
  const nonMembers = users.filter(u => !memberIds.includes(u._id));

  if (loading) return <div className="loading">Loading project...</div>;
  if (!project) return <div className="empty">Project not found</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{project.name}</h1>
          <p style={{ color: 'var(--text2)' }}>{project.description || 'No description'}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>
            👥 {project.members?.length || 0} members • Owner: {project.owner?.name}
          </p>
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {project.members?.map(m => (
              <span key={m.user._id} style={{ fontSize: '0.78rem', padding: '2px 8px', borderRadius: '12px', background: 'var(--surface2)', color: 'var(--text2)' }}>
                👤 {m.user.name} ({m.role})
              </span>
            ))}
          </div>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-ghost" onClick={() => setShowMemberModal(true)}>+ Add Member</button>
            <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>+ New Task</button>
          </div>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="empty" style={{ textAlign: 'center', marginTop: '50px' }}>
          <div style={{ fontSize: '3rem' }}>📋</div>
          <div>No tasks yet. {isAdmin ? 'Create one!' : ''}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {tasks.map(task => (
            <div key={task._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong>{task.title}</strong>
                <span style={{
                  padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem',
                  background: task.status === 'done' ? '#22c55e' : task.status === 'in-progress' ? '#f59e0b' : '#6366f1',
                  color: 'white'
                }}>{task.status}</span>
              </div>
              {task.description && <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '10px' }}>{task.description}</p>}
              <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginBottom: '10px' }}>
                {task.assignedTo && <div>👤 {task.assignedTo.name}</div>}
                {task.dueDate && <div>📅 {new Date(task.dueDate).toLocaleDateString()}</div>}
                <div>🎯 {task.priority}</div>
              </div>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {task.status !== 'todo' && <button className="btn btn-sm btn-ghost" onClick={() => handleStatusChange(task._id, 'todo')}>To Do</button>}
                {task.status !== 'in-progress' && <button className="btn btn-sm btn-ghost" onClick={() => handleStatusChange(task._id, 'in-progress')}>In Progress</button>}
                {task.status !== 'done' && <button className="btn btn-sm btn-ghost" onClick={() => handleStatusChange(task._id, 'done')}>Done</button>}
                {isAdmin && <button className="btn btn-sm btn-danger" onClick={() => handleDelete(task._id)}>🗑️</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Task</h2>
              <button className="modal-close" onClick={() => setShowTaskModal(false)}>✕</button>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title" required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Task description" />
              </div>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select className="form-select" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Member</h2>
              <button className="modal-close" onClick={() => setShowMemberModal(false)}>✕</button>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label className="form-label">Select User</label>
                <select className="form-select" value={selectedUser} onChange={e => setSelectedUser(e.target.value)} required>
                  <option value="">Choose a user</option>
                  {nonMembers.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Adding...' : 'Add Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}