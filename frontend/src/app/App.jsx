import '@/src/main.css';
import MapPage from '../pages/map/MapPage.jsx';
import Discover from '../pages/discover/Discover.jsx';
import AppSidebar from '../components/AppSidebar.jsx';
import { Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { useCookies } from 'react-cookie';

export default function App() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch(__API_BASE__ + '/events');

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                // Sort events by start date
                data.sort((a, b) =>
                    new Date(a.start_date) > new Date(b.start_date) ? 1 : -1
                );
                setEvents(data);
            } catch (error) {
                console.error('Error fetching events:', error);
                setEvents([-1]);
            }
        };

        fetchEvents();
    }, []);

    /* const [
        sidebarStateCookie,
        setSidebarStateCookie,
        removeSidebarStateCookie,
    ] = useCookies(['sidebar_state']);

    const defaultOpen = sidebarStateCookie.sidebar_state == 'true';
    console.log(sidebarStateCookie?.sidebar_state, sidebarStateCookie); */

    return (
        <>
            <meta
                name='viewport'
                content='width=device-width, initial-scale=1.0'
            />

            <SidebarProvider /* defaultOpen={defaultOpen} */>
                <SidebarInset>
                    <Routes>
                        <Route path='/' element={<AppSidebar />}>
                            <Route
                                index
                                element={<MapPage events={events} />}
                            />
                            <Route
                                path='map'
                                element={<MapPage events={events} />}
                            />
                            <Route
                                path='discover'
                                element={<Discover events={events} />}
                            />
                        </Route>
                        <Route path='/*' element={<NoPage />} />
                    </Routes>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}

function NoPage() {
    return (
        <div className='flex flex-col justify-center items-center w-dvw h-dvh font-sans'>
            <h1 className='text-9xl font-bold m-5'>404</h1>
            <h2 className='text-3xl '>Wir haben nichts gefunden.</h2>
            <p className='text-2xl w-1/2 text-center mt-3'>
                Wir haben überall nachgeschaut, doch es scheint, als ob diese
                Seite nicht existiert. Willst du zurück zur Startseite? Dann
                klicke auf den Link{' '}
                <Link to='/' className='underline text-accent-600'>
                    hier
                </Link>
                .
            </p>
        </div>
    );
}
