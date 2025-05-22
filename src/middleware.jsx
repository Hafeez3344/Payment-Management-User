import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function AuthCheck({ children }) {
  // This middleware is now a passthrough, since auth is handled in App.jsx
  return children;
}