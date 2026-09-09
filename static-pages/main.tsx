import React from 'react';
import { createRoot } from 'react-dom/client';
import { HomeContent } from '../components/sections/home-content';
import '../app/globals.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><HomeContent /></React.StrictMode>);
