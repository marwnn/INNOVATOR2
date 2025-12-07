
import React from 'react';
import MissionVision from './MissionVision';

const ParentDashboard = () => {
  return (
    <div style={{ 
      margin: 0, 
      padding: 0, 
      position: 'relative',
      top: 0,
      left: 0,
      right: 0
    }}>
      <MissionVision />
    </div>
  );
};

export default ParentDashboard;