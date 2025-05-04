import { useState, useRef, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { useLocation } from 'react-router-dom';
import '../../app/App.css';
import BackToTopButton from '../../components/BackToTopButton.jsx'; // Pfad anpassen falls nötig

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faClock, faStar } from '@fortawesome/free-regular-svg-icons';
import {
    faCoins,
    faPlus,
    faLocationDot,
    faChildren,
} from '@fortawesome/free-solid-svg-icons';

export default function Discover({ events }) {
    const location = useLocation();
    const itemRefs = useRef({}); // Create a map of refs for each event
    const [showScrollButton, setShowScrollButton] = useState(false);
    const scrollableListRef = useRef(null); // Ref for the <ul> element

    // Removed the separate scrollToHash function as the logic is now inline in the useEffect
    // const scrollToHash = () => { ... }

    // useEffect for handling scrolling to a hash fragment after events load
    useEffect(() => {
        // Only attempt to scroll if events data is loaded and there is a hash
        if (events && events.length > 0 && location.hash) {
            // Use requestAnimationFrame to ensure the DOM has updated after events are rendered
            requestAnimationFrame(() => {
                const hash = location.hash.replace('#', ''); // Get the hash without the '#'
                if (hash) {
                    const matchingRef = itemRefs.current[hash];

                    if (matchingRef) {
                        matchingRef.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center', // Scroll the element to the center of the container
                        });
                        // Optional: Clear the hash after scrolling if you don't want it in the URL anymore
                        // window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
                    } else {
                        // Optional: Log a warning if the element with the hash ID was not found
                        console.warn(`Element with ID "${hash}" not found.`);
                    }
                }
            });
        }
        // Rerun this effect when the hash changes or when events data updates
    }, [location.hash, events]); // Dependencies: location.hash and events prop

    // useEffect for handling scrolling to an ID based on a query parameter
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const eventId = params.get('id'); // Use 'id' instead of 'title'

        if (eventId) {
            // Find the ref for the event with the matching id
            const matchingRef = itemRefs.current[eventId];

            if (matchingRef) {
                matchingRef.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }
        // Depend on location to handle query parameter changes
    }, [location]);

    // State to track which card is flipped
    const [flippedCardId, setFlippedCardId] = useState(null);
    // State to store heights for each card's front
    const [frontHeights, setFrontHeights] = useState({});
    // Refs for each card's front
    const frontRefs = useRef({});

    // Add new state for filtered events and active filter
    const [filteredEvents, setFilteredEvents] = useState(events);
    const [activeFilter, setActiveFilter] = useState(null);

    // Filter texts and their corresponding icons
    const filterTexts = [
        'Anstehend',
        'Kostenlos',
        'Beliebt',
        'Neu',
        'In der Nähe',
        'Familienfreundlich',
    ];
    const filterSymbols = [
        faClock, // Represents time-related filters
        faCoins, // Represents cost-related filters
        faStar, // Represents popular events
        faPlus, // Represents new events
        faLocationDot, // Represents nearby events
        faChildren, // Represents family-friendly events
    ];

    // Function to handle filtering events
    const filterEvents = (filterId) => {
        console.log(`Filtering events for: ${filterId}`);

        if (activeFilter == filterId) {
            // Reset active filter
            setActiveFilter(null);
            setFilteredEvents(events);
            return;
        }

        setActiveFilter(filterId);

        // Your filtering logic here
        if (filterId === 0) {
            // Filter events based on their start date
            setFilteredEvents(
                events.filter(
                    (event) =>
                        new Date(event.start_date).getTime() >
                        new Date(Date.now()).getTime()
                )
            );
        } else if (filterId === 1) {
            // Filter events based on their cost
            setFilteredEvents(
                events.filter((event) => {
                    const cost = event.cost?.toString().toLowerCase();
                    return (
                        cost === '0' ||
                        cost === 'free' ||
                        cost === 'kostenlos' ||
                        cost === 'frei'
                    );
                })
            );
        } else if (filterId === 2) {
            // Filter events based on their popularity
        } else if (filterId === 3) {
            // Filter events based on their newness
        } else if (filterId === 4) {
            // Filter events based on their proximity
        } else if (filterId === 5) {
            // Filter events based on their family-friendliness
        }
    };

    // Function to handle flipping a card
    const handleFlip = (id) => {
        // If flipping from front to back (the clicked card is not the currently flipped one)
        if (flippedCardId !== id) {
            const front = frontRefs.current[id];
            if (front) {
                // Capture the height of the front BEFORE it's potentially hidden
                const currentFrontHeight = front.offsetHeight;
                // Only update the stored height if the captured height is valid (greater than 0)
                if (currentFrontHeight > 0) {
                    setFrontHeights((prevHeights) => ({
                        ...prevHeights,
                        [id]: currentFrontHeight, // Store the captured height
                    }));
                }
            }
        }
        // Now toggle the flip state
        setFlippedCardId(flippedCardId === id ? null : id);
    };

    /* -------------------------------- useEffect ------------------------------- */

    useEffect(() => {
        const updateHeights = () => {
            const heightsToUpdate = {};
            // Iterate through all card refs to potentially update heights
            Object.keys(itemRefs.current).forEach((id) => {
                const front = frontRefs.current[id];
                if (front) {
                    const currentOffsetHeight = front.offsetHeight;

                    // If the front is currently visible (offsetHeight > 0 and not hidden by display: none)
                    if (
                        currentOffsetHeight > 0 &&
                        front.style.display !== 'none'
                    ) {
                        // Use the current calculated height
                        heightsToUpdate[id] = currentOffsetHeight;
                    } else if (frontHeights[id]) {
                        // If the front is hidden BUT we have a previously stored height, use the stored height
                        heightsToUpdate[id] = frontHeights[id];
                    } else {
                        // Fallback: If front is hidden and no stored height (should be rare if capture on flip works)
                        // Could try getting the height of the back if it's visible, or a default
                        const listItem = itemRefs.current[id];
                        if (listItem) {
                            const back = listItem.querySelector(
                                '.backface-hidden:not(.hidden)'
                            );
                            if (back) {
                                // Use the back's height if it's visible and front is not
                                heightsToUpdate[id] = back.offsetHeight;
                            } else {
                                // Default fallback if neither front nor back is readily measurable
                                heightsToUpdate[id] = 400;
                            }
                        } else {
                            // Default fallback if itemRef is somehow missing
                            heightsToUpdate[id] = 400;
                        }
                    }
                } else if (frontHeights[id]) {
                    // If the frontRef is not current but we have a stored height, use the stored height
                    heightsToUpdate[id] = frontHeights[id];
                } else {
                    // Default fallback if no frontRef and no stored height
                    heightsToUpdate[id] = 400;
                }
            });

            // Use a functional update to merge the calculated heights with the previous state
            setFrontHeights((prevHeights) => {
                // Create a new object with previous heights
                const newHeights = { ...prevHeights };
                // Overwrite or add heights for the cards we processed in this update cycle
                Object.keys(heightsToUpdate).forEach((id) => {
                    newHeights[id] = heightsToUpdate[id];
                });
                return newHeights;
            });
        };

        const debouncedUpdateHeights = debounce(updateHeights, 200);

        // --- Modified part ---
        // Use requestAnimationFrame to delay the initial height calculation
        const animationFrameId = requestAnimationFrame(() => {
            updateHeights();
        });
        // --- End of Modified part ---

        window.addEventListener('resize', debouncedUpdateHeights);

        return () => {
            window.removeEventListener('resize', debouncedUpdateHeights);
            cancelAnimationFrame(animationFrameId); // Cleanup the animation frame
        };
    }, [events]); // Depends on events prop

    // Update filteredEvents when the original events prop changes
    useEffect(() => {
        setFilteredEvents(events);
    }, [events]);

    useEffect(() => {
        const handleScroll = () => {
            if (scrollableListRef.current) {
                console.log('Scrollable List Ref:', scrollableListRef.current); // Debug log
                const scrollTop = scrollableListRef.current.scrollTop; // Get the scroll position of the <ul>
                console.log('Scroll position:', scrollTop); // Debug log
                setShowScrollButton(scrollTop > 300); // Show button if scrolled more than 300px
            }
        };

        const scrollableList = scrollableListRef.current;
        if (scrollableList) {
            scrollableList.addEventListener('scroll', handleScroll);
        }

        // Cleanup the event listener on component unmount
        return () => {
            if (scrollableList) {
                scrollableList.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    /* -------------------------------- useEffects End ------------------------------- */

    // Render a loading state if no events are available
    if (!events || events.length === 0) {
        return (
            <div className='flex flex-col size-full justify-center items-center gap-y-3'>
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 -960 960 960'
                    className='fill-stone-400 size-20 animate-spin'
                >
                    <path d='M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880v80q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480h80q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Z' />
                </svg>
                <p className='font-stretch-semi-expanded'>
                    Lade Veranstaltungen...
                </p>
            </div>
        );
    }

    // Render the main content
    return (
        <div className='bg-white p-4 w-full relative'>
            <h1 className='font-stretch-semi-expandedd text-4xl ml-3 lg:ml-15'>
                Entdecke aktuelle Veranstaltungen
            </h1>
            <h2 className='font-stretch-semi-expanded text-lg ml-3 lg:ml-15 text-stone-400 font-light'>
                Krefeld und Umgebung
            </h2>
            <div className='h-full p-3 mx-0 lg:mx-12 my-2 flex flex-row max-w-full overflow-x-scroll scrollbar-fade'>
                {filterTexts.map((text, index) => {
                    const symbol = filterSymbols[index];
                    return (
                        <FilterCard
                            key={index}
                            symbol={symbol}
                            text={text}
                            id={index}
                            isActive={activeFilter === index}
                            filterEvents={filterEvents}
                        />
                    );
                })}
            </div>
            <ul
                ref={scrollableListRef}
                className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:mx-15 mx-3 lg:my-5 my-3 max-w-full transition-all overflow-y-auto'
            >
                {filteredEvents.map((event) => (
                    <li
                        key={event.id}
                        ref={(el) => (itemRefs.current[event.id] = el)} // Assign ref to each <li>
                        id={event.id} // Set the id attribute for the element
                        className='relative rounded-3xl border p-6 border-stone-200 bg-white shadow-md hover:shadow-lg transition-shadow min-h-[400px] flex flex-col'
                    >
                        {/* Front of the Card */}
                        <div
                            ref={(el) => (frontRefs.current[event.id] = el)}
                            className={`w-full backface-hidden ${
                                flippedCardId === event.id
                                    ? 'hidden'
                                    : 'flex flex-col h-full'
                            }`}
                        >
                            {/* Main content area - takes all available space but shrinks as needed */}
                            <div className='flex-1'>
                                {event.image?.url !== '' ? (
                                    <img
                                        src={event.image.url}
                                        alt={event.title}
                                        className='rounded-2xl mb-4 w-full h-40 object-cover'
                                    />
                                ) : (
                                    <div className='rounded-2xl mb-4 w-full h-40 object-cover bg-stone-100'></div>
                                )}
                                {/* Event Title */}
                                <h2
                                    className='font-stretch-semi-expanded font-semibold mb-2 text-xl'
                                    dangerouslySetInnerHTML={{
                                        __html: event.title,
                                    }}
                                ></h2>
                                <TimeIndicator
                                    eventStart={new Date(
                                        event.start_date
                                    ).getTime()}
                                    eventEnd={new Date(
                                        event.end_date
                                    ).getTime()}
                                />
                                {/* Event Details */}
                                <p className='font-stretch-semi-expanded text-sm text-gray-600 mb-2'>
                                    <strong>Beginn:</strong>{' '}
                                    {new Date(event.start_date).toLocaleString(
                                        [],
                                        {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        }
                                    )}
                                    {' Uhr'}
                                    <br />
                                    <strong>Ende:</strong>{' '}
                                    {new Date(event.end_date).toLocaleString(
                                        [],
                                        {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        }
                                    )}
                                    {' Uhr'}
                                </p>
                                {/* Venue */}
                                {event.venue?.venue === '' ? (
                                    <p className='font-stretch-semi-expanded text-sm text-gray-600 mb-4'>
                                        <strong>Veranstaltungsort:</strong> k.A.
                                    </p>
                                ) : (
                                    <p className='font-stretch-semi-expanded text-sm text-gray-600 mb-4'>
                                        <strong>Veranstaltungsort:</strong>{' '}
                                        {event.venue?.venue}:{' '}
                                        <span className='font-light'>
                                            {event.venue?.address},{' '}
                                            {event.venue?.zip}{' '}
                                            {event.venue?.city}
                                        </span>
                                    </p>
                                )}
                                {event.cost === '' ? (
                                    <p className='font-stretch-semi-expanded text-sm text-gray-600 mb-4'>
                                        <strong>Preis:</strong> k.A.
                                    </p>
                                ) : (
                                    <p className='font-stretch-semi-expanded text-sm text-gray-600 mb-4'>
                                        <strong>Preis:</strong>{' '}
                                        {event.cost
                                            ?.toString()
                                            .toLowerCase() === '0' ||
                                        event.cost?.toString().toLowerCase() ===
                                            'free' ||
                                        event.cost?.toString().toLowerCase() ===
                                            'kostenlos' ||
                                        event.cost?.toString().toLowerCase() ===
                                            'frei'
                                            ? 'Gratis'
                                            : event.cost}
                                    </p>
                                )}
                            </div>

                            {/* Button area - explicitly positioned at the bottom */}
                            <div className='mt-auto pt-3'>
                                <a
                                    href={
                                        event.website === ''
                                            ? event.url
                                            : event.website
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='font-stretch-semi-expanded text-indigo-500 hover:underline mr-5'
                                >
                                    Mehr Lesen
                                </a>
                                <button
                                    onClick={() => handleFlip(event.id)}
                                    className='font-stretch-semi-expanded text-indigo-500 hover:underline'
                                >
                                    Beschreibung
                                </button>
                            </div>
                        </div>

                        {/* Back of the Card */}
                        <div
                            className={`w-full backface-hidden ${
                                flippedCardId === event.id
                                    ? 'flex flex-col h-full'
                                    : 'hidden'
                            }`}
                            style={{
                                height: frontHeights[event.id] || '1rem',
                            }}
                        >
                            {/* Content area with scroll */}
                            <div className='flex-1 overflow-y-auto scrollbar-fade'>
                                <p
                                    className='font-stretch-semi-expanded text-sm text-gray-700 mb-4 description break-words overflow-x-hidden'
                                    dangerouslySetInnerHTML={{
                                        __html: event.description,
                                    }}
                                ></p>
                            </div>

                            {/* Button area */}
                            <div className='mt-auto pt-3'>
                                <button
                                    onClick={() => handleFlip(event.id)}
                                    className='font-stretch-semi-expanded text-indigo-500 hover:underline'
                                >
                                    Zurück
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            <BackToTopButton />
        </div>
    );
}

// Component for rendering individual filter cards
function FilterCard({ symbol, text, id, isActive, filterEvents }) {
    // Create the icon element
    const symbolIcon = (
        <FontAwesomeIcon icon={symbol} className='mr-2' size='lg' />
    );

    // Replace spaces in text with non-breaking spaces
    const noBreakSpaceText = text.replace(/ /g, '\u00A0');

    return (
        <>
            <button
                onClick={() => filterEvents(id)}
                className={`mr-3 rounded-3xl border p-2 pl-3 pr-4
                ${
                    isActive
                        ? 'border-indigo-200 bg-indigo-50 filter drop-shadow-lg text-indigo-600'
                        : 'border-stone-200 bg-white filter drop-shadow-md hover:drop-shadow-lg'
                }
                transition-all flex flex-row items-center`}
            >
                {symbolIcon}
                <p className='font-stretch-semi-expanded'>{noBreakSpaceText}</p>
            </button>
        </>
    );
}

// This component visually indicates whether an event is currently active based on its start and end times.
// It displays a green pulsating dot if the event is active, or a gray static dot if it is not.
function TimeIndicator({ eventStart, eventEnd }) {
    const [currentTime, setCurrentTime] = useState(
        new Date(Date.now()).getTime()
    );

    useEffect(() => {
        // Update time every second
        const intervalId = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    var activeNumber = -1;

    if (currentTime > eventStart && currentTime < eventEnd) {
        activeNumber = 1;
    } else if (currentTime < eventStart) {
        activeNumber = 0;
    } else if (currentTime > eventEnd) {
        activeNumber = 2;
    }

    var textContent = `Ein Fehler ist aufgetreten.`;

    if (activeNumber === 0) {
        textContent = `Beginnt in ${getTimeUntilString(currentTime, eventStart)}`;
    } else if (activeNumber === 1) {
        textContent = `Endet in ${getTimeUntilString(currentTime, eventEnd)}`;
    } else if (activeNumber === 2) {
        textContent = `Zu Ende`;
    }

    return (
        <>
            <div className='flex flex-row items-center content-center my-3'>
                <span
                    className={`relative mr-2 flex size-2 ${activeNumber === 0 ? '' : 'hidden'}`}
                    title='Diese Veranstaltung hat noch nicht begonnen.'
                >
                    <span className='absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75'></span>
                </span>

                <span
                    className={`relative mr-2 flex size-2 ${activeNumber === 1 ? '' : 'hidden'}`}
                    title='Diese Veranstaltung läuft aktuell.'
                >
                    <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75'></span>
                    <span className='relative inline-flex size-2 rounded-full bg-green-400'></span>
                </span>

                <span
                    className={`relative mr-2 flex size-2 ${activeNumber === 2 ? '' : 'hidden'} `}
                >
                    <span
                        className='relative inline-flex size-2 rounded-full bg-stone-400 opacity-75'
                        title='Diese Veranstaltung ist zuende.'
                    ></span>
                </span>
                <p className='font-stretch-semi-expanded text-sm text-gray-600'>
                    {textContent}
                </p>
            </div>
        </>
    );
}

function getTimeUntilString(now, date) {
    const timeDiff = date - now;
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} ${days === 1 ? 'Tag' : 'Tagen'}`;
    } else if (hours > 0) {
        return `${hours} ${hours === 1 ? 'Stunde' : 'Stunden'}`;
    } else if (minutes > 0) {
        return `${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}`;
    } else {
        return `${seconds} ${seconds === 1 ? 'Sekunde' : 'Sekunden'}`;
    }
}
