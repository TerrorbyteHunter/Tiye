export const logout = () => {
  // Remove token from storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('vendor_token');
  
  // Clear saved credentials for "Remember Me" functionality
  localStorage.removeItem('vendor_remember_me');
  localStorage.removeItem('vendor_saved_email');
  
  // Redirect to login page
  window.location.href = '/login';
}; 