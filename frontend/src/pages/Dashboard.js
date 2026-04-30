import React, { useState, useEffect } from 'react';
import { getTasks, updateTask, deleteTask, getUsers, getProjects } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskModal from '../components/TaskModal';

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editTask, setEditTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tasksRes, usersRes, projectsRes] = await Promise.all([
        getTasks(),
        getUsers(),
        getProjects()
      ]);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      setTasks(tasks.map(t => (t._id === taskId ? { ...t, status: newStatus } : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (err) {
      console.error(err);
    }
  };

  const isOverdue = (task) => {
    return task.dueDate && task.status !== 'done' && new Date() > new Date(task.dueDate);
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'mine') return t.assignedTo?._id === user._id;
    if (filter === 'overdue') return isOverdue(t);
    return t.status === filter;
  });

  const counts = {
    todo: tasks.filter(t => t.status === 'todo').length,
    inprog: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => isOverdue(t)).length,
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p style={{ color: 'var(--text2)', marginTop: '0.25rem' }}>
            Welcome back, {user?.name || 'User'} 👋
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card todo" onClick={() => setFilter('todo')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">To Do</div>
          <div className="stat-value">{counts.todo}</div>
        </div>
        <div className="stat-card inprog" onClick={() => setFilter('in-progress')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{counts.inprog}</div>
        </div>
        <div className="stat-card done" onClick={() => setFilter('done')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Completed</div>
          <div className="stat-value">{counts.done}</div>
        </div>
        <div className="stat-card overdue" onClick={() => setFilter('overdue')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Overdue</div>
          <div className="stat-value">{counts.overdue}</div>
        </div>
      </div>

      <div className="filter-bar" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <span style={{ color: 'var(--text2)', fontSize: '0.85rem', marginRight: '10px' }}>Filter:</span>
        {['all', 'mine', 'todo', 'in-progress', 'done', 'overdue'].map(f => (
          <button 
            key={f} 
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => setFilter(f)}
            style={{ marginRight: '5px' }}
          >
            {f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty" style={{ textAlign: 'center', marginTop: '50px' }}>
          <div className="empty-icon" style={{ fontSize: '3rem' }}>📋</div>
          <div className="empty-text">No tasks found for this filter</div>
        </div>
      ) : (
        <div className="grid grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredTasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              user={user}
              isOverdue={isOverdue(task)}
              onStatusChange={handleStatusChange}
              onEdit={() => setEditTask(task)}
              onDelete={() => handleDelete(task._id)}
            />
          ))}
        </div>
      )}

      {editTask && (
        <TaskModal
          task={editTask}
          users={users}
          projects={projects}
          onClose={() => setEditTask(null)}
          onSaved={() => { setEditTask(null); fetchAll(); }}
        />
      )}
    </div>
  );
}

function TaskCard({ task, user, isOverdue, onStatusChange, onEdit, onDelete }) {
  const statusMap = { 'todo': 'badge-todo', 'in-progress': 'badge-inprog', 'done': 'badge-done' };
  const priorityMap = { 'low': 'badge-low', 'medium': 'badge-medium', 'high': 'badge-high' };

  return (
    <div className={`task-card ${isOverdue ? 'overdue' : ''}`} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
      <div className="task-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div className="task-title" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{task.title}</div>
        <span className={`badge ${statusMap[task.status] || ''}`}>{task.status}</span>
      </div>
      
      {task.description && (
        <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {task.description}
        </p>
      )}
      
      <div className="task-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
        <span className="task-project">📁 {task.project?.name || 'No Project'}</span>
        {task.priority && <span className={`badge ${priorityMap[task.priority] || ''}`}>{task.priority}</span>}
        {isOverdue && <span className="badge badge-overdue" style={{ color: 'red' }}>⚠ Overdue</span>}
        {task.dueDate && (
          <span className={`task-due ${isOverdue ? 'overdue-text' : ''}`} style={{ color: isOverdue ? 'red' : 'var(--text2)', fontSize: '0.78rem' }}>
            📅 {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
        {task.assignedTo && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>
            👤 {task.assignedTo.name}
          </span>
        )}
      </div>
      
      <div className="task-actions" style={{ display: 'flex', gap: '5px' }}>
        {task.status !== 'todo' && <button className="btn btn-sm btn-ghost" onClick={() => onStatusChange(task._id, 'todo')}>To Do</button>}
        {task.status !== 'in-progress' && <button className="btn btn-sm btn-ghost" onClick={() => onStatusChange(task._id, 'in-progress')}>In Progress</button>}
        {task.status !== 'done' && <button className="btn btn-sm btn-ghost" onClick={() => onStatusChange(task._id, 'done')}>Done</button>}
        
        {user?.role === 'admin' && (
          <>
            <button className="btn btn-sm btn-ghost" onClick={onEdit}>✏️</button>
            <button className="btn btn-sm btn-danger" onClick={onDelete}>🗑️</button>
          </>
        )}
      </div>
    </div>
  );
}