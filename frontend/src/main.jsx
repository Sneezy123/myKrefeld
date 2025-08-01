import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';

// User analytics
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/* <CookiesProvider> */}
        {document.body.classList.add('dark')}
        <BrowserRouter>
            <Analytics />
            <SpeedInsights />
            <App />
        </BrowserRouter>
        {/* </CookiesProvider> */}
    </StrictMode>
);
