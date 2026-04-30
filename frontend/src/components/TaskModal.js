import React from 'react';

const TaskModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', minWidth: '300px' }}>
        <h3>Create New Task</h3>
        <input type="text" placeholder="Task Title" style={{ width: '100%', marginBottom: '10px' }} />
        <select style={{ width: '100%', marginBottom: '10px' }}>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={onClose}>Cancel</button>
          <button>Save Task</button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;