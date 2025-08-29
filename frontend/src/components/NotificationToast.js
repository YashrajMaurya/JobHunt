import React, { useEffect, useState } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const NotificationToast = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const { socket, listenToEvent } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket || !user) return;

    // Listen for application status updates (student side)
    const cleanupApplicationUpdate = listenToEvent('application-updated', (data) => {
      addNotification({
        type: 'info',
        message: `Application status updated to ${data.status}`,
        timestamp: Date.now()
      });
    });

    // Listen for new job applications (recruiter side)
    const cleanupNewApplication = listenToEvent('new-application', (data) => {
      const jobTitle = data?.application?.job?.title || 'your job';
      addNotification({
        type: 'success',
        message: `New application received for ${jobTitle}`,
        timestamp: Date.now()
      });
    });

    // Listen for job updates
    const cleanupJobUpdate = listenToEvent('job-updated', (data) => {
      if (user.role === 'student') {
        addNotification({
          type: 'info',
          message: `Job "${data.title}" has been updated`,
          timestamp: Date.now()
        });
      }
    });

    // Listen for withdrawals
    const cleanupWithdrawn = listenToEvent('application-withdrawn', (data) => {
      addNotification({
        type: 'warning',
        message: `An application was withdrawn`,
        timestamp: Date.now()
      });
    });

    return () => {
      cleanupApplicationUpdate?.();
      cleanupNewApplication?.();
      cleanupJobUpdate?.();
      cleanupWithdrawn?.();
    };
  }, [socket, user, listenToEvent]);

  const addNotification = (notification) => {
    setNotifications(prev => [...prev, notification]);
    if (!open) {
      setCurrentNotification(notification);
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Show next notification if available
    setTimeout(() => {
      if (notifications.length > 1) {
        const remainingNotifications = notifications.slice(1);
        setNotifications(remainingNotifications);
        if (remainingNotifications.length > 0) {
          setCurrentNotification(remainingNotifications[0]);
          setOpen(true);
        }
      } else {
        setNotifications([]);
        setCurrentNotification(null);
      }
    }, 300);
  };

  if (!currentNotification) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={Slide}
    >
      <Alert
        onClose={handleClose}
        severity={currentNotification.type}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {currentNotification.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationToast;
