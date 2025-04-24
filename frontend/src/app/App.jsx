import './App.css';
import Map from '../pages/map/Map.jsx';
import Discover from '../pages/discover/Discover.jsx';
import Description from '../pages/description/Description.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import { Outlet, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function App() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch(
                    'http://localhost:3000/api/events'
                );
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
    }, []);

    return (
        <>
            <meta
                name='viewport'
                content='width=device-width, initial-scale=1.0'
            />
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<NavBar />}>
                        <Route index element={<Map events={events} />} />
                        <Route path='map' element={<Map events={events} />} />
                        <Route
                            path='discover'
                            element={<Discover events={events} />}
                        />
                    </Route>
                    <Route path='*' element={<NoPage />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

function NavBar() {
    const cardStyle =
        'flex h-11 items-center md:justify-start justify-around flex-row md:mx-4 mx-2 my-2 p-2 md:p-3 md:px-3 bg-stone-100 rounded-3xl transition-all hover:bg-stone-200 duration-300';
    return (
        <>
            <div className='flex'>
                <div className='bg-white h-dvh flex flex-col w-15 md:w-25/100 max-w-70 flex-shrink-0 drop-shadow-xl/10 transition-all z-10 my-4'>
                    <Link to='/map'>
                        <div className={cardStyle}>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                viewBox='0 0 576 512'
                                className='size-5 md:mr-3 m-1 fill-black'
                            >
                                {/* Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. */}
                                <path d='M565.6 36.2C572.1 40.7 576 48.1 576 56l0 336c0 10-6.2 18.9-15.5 22.4l-168 64c-5.2 2-10.9 2.1-16.1 .3L192.5 417.5l-160 61c-7.4 2.8-15.7 1.8-22.2-2.7S0 463.9 0 456L0 120c0-10 6.1-18.9 15.5-22.4l168-64c5.2-2 10.9-2.1 16.1-.3L383.5 94.5l160-61c7.4-2.8 15.7-1.8 22.2 2.7zM48 136.5l0 284.6 120-45.7 0-284.6L48 136.5zM360 422.7l0-285.4-144-48 0 285.4 144 48zm48-1.5l120-45.7 0-284.6L408 136.5l0 284.6z' />
                            </svg>
                            <p className='md:font-stretch-semi-expanded hidden md:inline'>
                                Karte
                            </p>
                        </div>
                    </Link>

                    <Link to='/discover'>
                        <div className={cardStyle}>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                viewBox='0 0 512 512'
                                className='size-5 md:mr-3 m-1 fill-black'
                            >
                                {/* Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. */}
                                <path d='M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm306.7 69.1L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31L325.1 306.7c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z' />
                            </svg>
                            <p className='md:font-stretch-semi-expanded hidden md:inline'>
                                Erkunden
                            </p>
                        </div>
                    </Link>
                </div>

                <div className='h-dvh grow bg-stone-100 overflow-y-scroll'>
                    <Outlet />
                </div>
            </div>
        </>
    );
}

function NoPage() {
    return (
        <div className='flex flex-col justify-center items-center w-dvw h-dvh'>
            <h1 className='text-9xl font-stretch-semi-expanded'>404</h1>
            <h2 className='text-5xl font-stretch-semi-expanded'>
                Diese Seite wurde nicht gefunden
            </h2>
            <p className='text-2xl font-stretch-semi-expanded'>
                Zurück zur Startseite?{' '}
                <Link to='/' className='underline text-indigo-500'>
                    Hier
                </Link>
            </p>
        </div>
    );
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container); // Ensure this is called only once
root.render(<App />);
