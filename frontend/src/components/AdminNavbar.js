import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Link as RouterLink } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAuth } from '../context/AuthContext';

const AdminNavbar = () => {
  const { isAuthenticated: adminAuthed, logout: adminLogout } = useAdminAuth();
  const { isAuthenticated: userAuthed, logout: userLogout } = useAuth();

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/admin/dashboard"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
        >
          JobHunt Admin
        </Typography>
        {adminAuthed && (
          <Stack direction="row" spacing={1}>
            <Button color="inherit" component={RouterLink} to="/admin/dashboard">Dashboard</Button>
            {userAuthed && (
              <Button color="inherit" onClick={userLogout}>Logout User</Button>
            )}
            <Button color="inherit" onClick={adminLogout}>Logout Admin</Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AdminNavbar;


