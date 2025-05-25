import { useState, useRef, useEffect } from 'react';
import debounce from 'lodash.debounce';
import BackToTopButton from '../../components/BackToTopButton.jsx'; // Pfad anpassen falls nötig

import {
    Clock,
    TicketPercent,
    Sparkles,
    MapPinned,
    Radar,
    CirclePlus,
    Baby,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import EventCard from '../../components/EventCard.jsx';

export default function Discover({ events }) {
    const itemRefs = useRef({}); // Create a map of refs for each event
    const location = useLocation();
    const [showScrollButton, setShowScrollButton] = useState(false);
    const scrollableListRef = useRef(null); // Ref for the <ul> element

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

    // Add new state for filtered events and active filter
    const [filteredEvents, setFilteredEvents] = useState([]);
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
        Clock, // Represents time-related filters
        TicketPercent, // Represents cost-related filters
        Sparkles, // Represents popular events
        CirclePlus, // Represents new events
        Radar, // MapPinned Represents nearby events
        Baby, // Represents family-friendly events
    ];

    // Function to handle filtering events
    const filterEvents = (filterId) => {
        let t1 = Date.now();
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
            const geoLocation = navigator.geolocation;

            const location = geoLocation.getCurrentPosition();
        } else if (filterId === 5) {
            // Filter events based on their family-friendliness
        }
        let t2 = Date.now();

        console.log(t2 - t1);
    };

    // Update filteredEvents when the original events prop changes
    useEffect(() => {
        if (!events || events.length === 0) {
            setFilteredEvents([...Array(99)]);
        } else if (events[0] != -1) {
            setFilteredEvents(events);
        }
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

    // Render the main content
    return (
        <div className='py-4 w-full @container'>
            <h1 className='font-stretch-semi-expanded text-4xl mx-10 lg:ml-15 text-center lg:text-left'>
                Entdecke aktuelle Veranstaltungen
            </h1>
            <h2 className='font-stretch-semi-expanded text-lg mx-10 lg:ml-15 text-stone-400 font-light text-center lg:text-left'>
                Krefeld und Umgebung
            </h2>
            <div className='py-3 mx-10 lg:mx-12 my-2 flex flex-row max-w-full overflow-x-scroll scrollbar-hidden'>
                {filterTexts.map((text, index) => {
                    return (
                        <FilterCard
                            key={index}
                            symbol={filterSymbols[index]}
                            text={text}
                            id={index}
                            isActive={activeFilter === index}
                            filterEvents={filterEvents}
                        />
                    );
                })}
            </div>
            {events[0] == -1 ?
                <div className='flex flex-col w-full grow'>
                    <span className='text-black text-2xl font-bold mx-10 lg:mx-15 text-center my-2'>
                        Die Veranstaltungen konnten nicht geladen werden.
                    </span>
                    <span className='text-gray-500 text-xl mx-10 lg:mx-15 text-center mb-5'>
                        Überprüfe deine Internetverbindung und versuche es
                        später erneut.
                    </span>
                    <span className='text-gray-500 font-[350] text-xl mx-10 lg:mx-15 text-center'>
                        Wenn das Problem weiterhin besteht, kontaktiere den{' '}
                        <span className='underline underline-offset-2 decoration-accent-500'>
                            Support
                        </span>
                        .
                    </span>
                </div>
            :   <>
                    <ul
                        ref={scrollableListRef}
                        className=' grid grid-cols-1 @xl:grid-cols-1 @4xl:grid-cols-2 @7xl:grid-cols-3 gap-6 lg:mx-15 mx-10 lg:my-5 my-3 max-w-full  overflow-visible'
                    >
                        {filteredEvents.map((event, idx) => (
                            <EventCard
                                key={event?.id ? event.id : idx}
                                event={event}
                                ref={itemRefs}
                            />
                        ))}
                    </ul>
                    <BackToTopButton />
                </>
            }
        </div>
    );
}

// Component for rendering individual filter cards
function FilterCard({ symbol, text, id, isActive, filterEvents }) {
    // Create the icon element
    const LucideSymbolIcon = symbol;

    // Replace spaces in text with non-breaking spaces
    const noBreakSpaceText = text.replace(/ /g, '\u00A0');

    return (
        <>
            <button
                onClick={() => filterEvents(id)}
                className={`mr-3 rounded-3xl border p-2 pl-3 pr-4
                ${
                    isActive ?
                        'border-accent-200 bg-accent-50 filter drop-shadow-lg text-accent-600'
                    :   'border-stone-200 bg-white filter drop-shadow-md hover:drop-shadow-lg'
                }
                transition-all flex flex-row items-center`}
            >
                <LucideSymbolIcon className='mr-2 size-5' />
                <p className='font-stretch-semi-expanded'>{noBreakSpaceText}</p>
            </button>
        </>
    );
}
