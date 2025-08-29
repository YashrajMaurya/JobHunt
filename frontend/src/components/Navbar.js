import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await logout();
    handleProfileMenuClose();
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const renderDesktopMenu = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Button
        color="inherit"
        onClick={() => navigate('/jobs')}
        sx={{
          backgroundColor: isActive('/jobs') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        Browse Jobs
      </Button>

      {isAuthenticated && (
        <>
          {user.role === 'student' ? (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/student/dashboard')}
                sx={{
                  backgroundColor: isActive('/student/dashboard') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/student/applications')}
                sx={{
                  backgroundColor: isActive('/student/applications') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                My Applications
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/recruiter/dashboard')}
                sx={{
                  backgroundColor: isActive('/recruiter/dashboard') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/recruiter/create-job')}
                sx={{
                  backgroundColor: isActive('/recruiter/create-job') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Post Job
              </Button>
            </>
          )}
        </>
      )}
    </Box>
  );

  const renderMobileMenu = () => (
    <Drawer
      anchor="left"
      open={mobileOpen}
      onClose={handleMobileMenuToggle}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          JobHunt
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <List>
          <ListItem button onClick={() => handleNavigation('/')}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>

          <ListItem button onClick={() => handleNavigation('/jobs')}>
            <ListItemIcon>
              <WorkIcon />
            </ListItemIcon>
            <ListItemText primary="Browse Jobs" />
          </ListItem>

          {isAuthenticated && (
            <>
              <Divider sx={{ my: 1 }} />
              
              {user.role === 'student' ? (
                <>
                  <ListItem button onClick={() => handleNavigation('/student/dashboard')}>
                    <ListItemIcon>
                      <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                  </ListItem>

                  <ListItem button onClick={() => handleNavigation('/student/applications')}>
                    <ListItemIcon>
                      <DescriptionIcon />
                    </ListItemIcon>
                    <ListItemText primary="My Applications" />
                  </ListItem>
                </>
              ) : (
                <>
                  <ListItem button onClick={() => handleNavigation('/recruiter/dashboard')}>
                    <ListItemIcon>
                      <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                  </ListItem>

                  <ListItem button onClick={() => handleNavigation('/recruiter/create-job')}>
                    <ListItemIcon>
                      <AddIcon />
                    </ListItemIcon>
                    <ListItemText primary="Post Job" />
                  </ListItem>
                </>
              )}

              <ListItem button onClick={() => handleNavigation(`/${user.role}/profile`)}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItem>

              <Divider sx={{ my: 1 }} />
              
              <ListItem button onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleMobileMenuToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              cursor: 'pointer',
              fontWeight: 'bold',
              '&:hover': { opacity: 0.8 }
            }}
            onClick={() => navigate('/')}
          >
            JobHunt
          </Typography>

          {!isMobile && renderDesktopMenu()}

          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={user.role === 'student' ? 'Student' : 'Recruiter'}
                color="secondary"
                size="small"
                variant="outlined"
              />
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ ml: 1 }}
              >
                <Avatar
                  src={user.profilePicture?.url}
                  sx={{ width: 32, height: 32 }}
                >
                  {user.name?.charAt(0)}
                </Avatar>
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{ borderColor: 'rgba(255, 255, 255, 0.5)' }}
              >
                Login
              </Button>
              <Button
                color="primary"
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{ backgroundColor: 'white', color: 'primary.main' }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate(`/${user?.role}/profile`); }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {renderMobileMenu()}
    </>
  );
};

export default Navbar;
