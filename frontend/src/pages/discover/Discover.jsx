import { useState, useRef, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import BackToTopButton from '@/src/components/BackToTopButton.jsx';
import { AutoSizer, WindowScroller, List } from 'react-virtualized';
import { Button } from '@/components/ui/button';

import {
    Clock,
    TicketPercent,
    Sparkles,
    MapPinned, // Note: MapPinned is not used in the filterTexts/filterSymbols array
    Radar,
    CirclePlus,
    Baby,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import EventCard from '@/src/components/EventCard.jsx';
import DebouncedAutoSizer from '@/src/components/DebouncedAutoSizer.jsx';
import { Component } from '@/src/components/testChart';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// Define FilterCard component (assuming it's in the same file or imported)
function FilterCard({ symbol, text, id, isActive, filterEvents }) {
    const LucideSymbolIcon = symbol;
    const noBreakSpaceText = text.replace(/ /g, '\u00A0');

    return (
        <Button
            onClick={() => filterEvents(id)}
            variant='outline'
            className={`mr-3 p-5
            ${
                isActive ?
                    'border-accent-200 bg-accent-50 filter  text-accent-600 hover:bg-accent-50/60 hover:text-accent-600'
                :   'border-stone-200 bg-white filter  hover:'
            }
            transition-all flex flex-row items-center cursor-pointer`}
        >
            <LucideSymbolIcon className='mr-2 size-5' />
            {noBreakSpaceText}
        </Button>
    );
}

export default function Discover({ events }) {
    const itemRefs = useRef({});
    const listRef = useRef(null);
    const location = useLocation();

    // State for BackToTopButton visibility
    const [showScrollButton, setShowScrollButton] = useState(false);

    // Stores the full list of events, used for filtering
    const allEvents = useRef([]);

    // Filtered events state
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [activeFilter, setActiveFilter] = useState(null);
    // State to manage overall loading status
    const [isLoading, setIsLoading] = useState(true);

    const [distanceArray, setDistanceArray] = useState([]);

    // Constants for card dimensions and grid gap
    const CARD_ACTUAL_HEIGHT = 560;
    const CARD_MIN_DESIRED_WIDTH = 400;
    const GRID_GAP = 24;
    const SKELETON_COUNT = 12; // Number of skeletons to show during initial loading

    // Filter texts and symbols
    const filterTexts = [
        'Anstehend',
        'Kostenlos',
        'Beliebt',
        'Neu',
        'In der Nähe',
        'Familienfreundlich',
    ];
    const filterSymbols = [
        Clock,
        TicketPercent,
        Sparkles,
        CirclePlus, // Assuming this is for 'Neu'
        Radar, // Assuming this is for 'In der Nähe'
        Baby, // Assuming this is for 'Familienfreundlich'
    ];

    // Effect to handle initial event loading and filtering
    useEffect(() => {
        if (events && events.length > 0 && events[0] !== -1) {
            allEvents.current = events; // Store the complete list of events
            setFilteredEvents(events); // Display all events initially
            setIsLoading(false); // Data has loaded
        } else if (events && events.length === 0) {
            setFilteredEvents([]);
            setIsLoading(false); // No events found, but loading is complete
        } else if (events && events[0] === -1) {
            // Handle error state: no events could be loaded
            setFilteredEvents([-1]);
            setIsLoading(false); // Error state, loading complete
        } else {
            // Initial state where 'events' might be undefined/null, still loading
            setIsLoading(true);
        }
    }, [events]);

    // Effect to scroll to a specific event based on URL hash
    useEffect(() => {
        if (filteredEvents.length > 0 && location.hash) {
            requestAnimationFrame(() => {
                const hash = location.hash.replace('#', '');
                if (hash) {
                    const matchingRef = itemRefs.current[hash];
                    if (matchingRef) {
                        matchingRef.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                        });
                    } else {
                        console.warn(`Element with ID "${hash}" not found.`);
                    }
                }
            });
        }
    }, [location.hash, filteredEvents]); // Depend on filteredEvents to ensure they are loaded

    // Effect to scroll to a specific event based on URL query parameter 'id'
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const eventId = params.get('id');

        if (eventId && filteredEvents.length > 0) {
            const matchingRef = itemRefs.current[eventId];
            if (matchingRef) {
                matchingRef.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }
    }, [location.search, filteredEvents]); // Depend on filteredEvents to ensure they are loaded

    // Debounced scroll handler for the BackToTopButton visibility
    const debouncedHandleScrollButton = useCallback(
        debounce(() => {
            setShowScrollButton(window.scrollY > 300);
        }, 100), // Debounce for 100ms
        []
    );

    // Effect to attach and clean up scroll event listeners to the window
    useEffect(() => {
        window.addEventListener('scroll', debouncedHandleScrollButton);

        return () => {
            window.removeEventListener('scroll', debouncedHandleScrollButton);
        };
    }, [debouncedHandleScrollButton]);

    // Function to filter events based on filter ID
    const filterEvents = (filterId) => {
        // If the same filter is clicked again, deactivate it and show all events
        if (activeFilter === filterId) {
            setActiveFilter(null);
            setFilteredEvents(allEvents.current); // Reset to all events
            if (listRef.current) {
                // Assuming listRef is defined from previous fix
                listRef.current.forceUpdateGrid();
            }
            return;
        }

        setActiveFilter(filterId);
        let tempFilteredEvents = [];

        if (filterId === 0) {
            // Anstehend (Upcoming)
            tempFilteredEvents = allEvents.current.filter(
                (event) =>
                    new Date(event.start_date).getTime() >
                    new Date(Date.now()).getTime()
            );
        } else if (filterId === 1) {
            // Kostenlos (Free)
            tempFilteredEvents = allEvents.current.filter((event) => {
                const cost = event.cost?.toString().toLowerCase();
                return (
                    cost === '0' ||
                    cost === 'free' ||
                    cost === 'kostenlos' ||
                    cost === 'frei' ||
                    cost === 'gratis'
                );
            });
        } else if (filterId === 2) {
            // Beliebt (Popular) - Placeholder, requires logic based on popularity
            // For now, return a subset or sort by a dummy popularity score
            tempFilteredEvents = [...allEvents.current].sort(
                () => Math.random() - 0.5
            ); // Random sort for demonstration
        } else if (filterId === 3) {
            // Neu (New) - Placeholder, requires logic based on creation date
            tempFilteredEvents = [...allEvents.current].sort((a, b) => {
                // Assuming 'created_at' or similar field exists
                const dateA = new Date(a.created_at || a.start_date).getTime();
                const dateB = new Date(b.created_at || b.start_date).getTime();
                return dateB - dateA; // Sort descending by date
            });
        } else if (filterId === 4) {
            // In der Nähe (Nearby) - Requires geolocation API
            // Placeholder: This would involve getting user's current location and filtering events by distance.
            // For demonstration, return a random subset.
            const geoLocation = navigator.geolocation;
            console.group('Geolocation filter');
            console.log('Starts filter');
            if (geoLocation) {
                console.log('Has geolocation');
                if (distanceArray.length === 0) {
                    console.log(
                        'Length of distanceArray is 0. Getting position...'
                    );
                    geoLocation.getCurrentPosition(
                        (position) => {
                            console.log(
                                'Position got:',
                                position.coords.latitude,
                                position.coords.longitude
                            );

                            console.log('Starting to sort');
                            let tempFilteredEvents = [...allEvents.current]
                                .map((event) => {
                                    // Handle cases where venue or lat/lon might be missing
                                    if (
                                        !event.venue?.lat ||
                                        !event.venue?.lon
                                    ) {
                                        return {
                                            ...event,
                                            _calculatedDistance: Infinity,
                                        };
                                    }

                                    // Haversine Formula

                                    const toRad = Math.PI / 180;
                                    const latUser =
                                        position.coords.latitude * toRad;
                                    const latEvent = event.venue.lat * toRad;

                                    const lonUser =
                                        position.coords.longitude * toRad;
                                    const lonEvent = event.venue.lon * toRad;

                                    const deltaLat = latUser - latEvent;
                                    const deltaLon = lonUser - lonEvent;

                                    const earthRadius = 6371e3;

                                    const sqChLenHalf =
                                        Math.sin(deltaLat / 2) *
                                            Math.sin(deltaLat / 2) +
                                        Math.cos(latUser) *
                                            Math.cos(latEvent) *
                                            Math.sin(deltaLon / 2) *
                                            Math.sin(deltaLon / 2);

                                    const angularDist =
                                        2 *
                                        Math.atan2(
                                            Math.sqrt(sqChLenHalf),
                                            Math.sqrt(1 - sqChLenHalf)
                                        );

                                    const distance = earthRadius * angularDist;
                                    return {
                                        ...event,
                                        _calculatedDistance: distance,
                                    }; // Using _calculatedDistance as an example
                                })
                                .sort(
                                    (a, b) =>
                                        a._calculatedDistance -
                                        b._calculatedDistance
                                );
                            console.log('Sorting finished');
                            setDistanceArray(tempFilteredEvents);
                            setFilteredEvents(tempFilteredEvents);
                            console.log('Set distanceArray and filterEvents');

                            if (listRef.current)
                                listRef.current.forceUpdateGrid();
                        },
                        (error) => {
                            console.error('Error getting geolocation:', error);
                            tempFilteredEvents = [...allEvents.current]; // Fallback to all events
                        }
                    );
                } else {
                    console.log('Distance array exists');
                    setFilteredEvents(distanceArray);
                    if (listRef.current) listRef.current.recomputeRowHeights(0);
                }
            } else {
                console.warn('Geolocation is not supported by this browser.');
                tempFilteredEvents = [...allEvents.current]; // Fallback to all events
            }
            return; // Exit early as geolocation is async
        } else if (filterId === 5) {
            // Familienfreundlich (Family-friendly) - Placeholder, requires event data field
            // Placeholder: Filter based on a 'family_friendly' property
            tempFilteredEvents = allEvents.current.filter(
                (event) => event.is_family_friendly
            ); // Assuming a boolean field
        }
        console.log('Setting filter');
        setFilteredEvents(tempFilteredEvents); // Apply filter
        console.groupEnd();
    };

    // Helper function to calculate maximum items per row
    function getMaxItemsAmountPerRow(rowWidth, itemMinWidth, gridGap) {
        return Math.max(
            Math.floor((rowWidth + gridGap) / (itemMinWidth + gridGap)),
            1
        );
    }

    // Helper function to generate indexes for items in a given row
    function generateIndexesForRow(
        rowIndex,
        rowWidth,
        itemMinWidth,
        itemsAmount,
        gridGap
    ) {
        const result = [];
        const maxItemsPerRow = getMaxItemsAmountPerRow(
            rowWidth,
            itemMinWidth,
            gridGap
        );
        const startIndex = rowIndex * maxItemsPerRow;

        for (
            let i = startIndex;
            i < Math.min(startIndex + maxItemsPerRow, itemsAmount);
            i++
        ) {
            result.push(i);
        }
        return result;
    }

    // Helper function to calculate total number of rows
    function getRowsAmount(rowWidth, itemMinWidth, itemsAmount) {
        const maxItemsPerRow = getMaxItemsAmountPerRow(
            rowWidth,
            itemMinWidth,
            GRID_GAP
        );
        return Math.ceil(itemsAmount / maxItemsPerRow);
    }

    // Row renderer for react-virtualized List
    const rowRenderer = useCallback(
        ({ index, key, style, parent }) => {
            const rowWidth = parent.props.width;
            const maxItemsPerRow = getMaxItemsAmountPerRow(
                rowWidth,
                CARD_MIN_DESIRED_WIDTH,
                GRID_GAP
            );

            let itemsToRender = [];
            let currentItemsInRow = 0;
            let calculatedCardContentWidth = 0;

            if (isLoading) {
                // When loading, render skeletons based on SKELETON_COUNT
                const startIndex = index * maxItemsPerRow;
                const endIndex = Math.min(
                    startIndex + maxItemsPerRow,
                    SKELETON_COUNT
                );
                itemsToRender = Array.from({
                    length: endIndex - startIndex,
                }).map(() => null); // Null for skeleton
                currentItemsInRow = itemsToRender.length;
            } else {
                // When not loading, render actual filtered events
                const itemsInThisRowIndexes = generateIndexesForRow(
                    index,
                    rowWidth,
                    CARD_MIN_DESIRED_WIDTH,
                    filteredEvents.length,
                    GRID_GAP
                );
                itemsToRender = itemsInThisRowIndexes.map(
                    (itemIndex) => filteredEvents[itemIndex]
                );
                currentItemsInRow = itemsToRender.length;
            }

            const totalGapWidthForRow =
                currentItemsInRow > 0 ? (currentItemsInRow - 1) * GRID_GAP : 0;
            calculatedCardContentWidth =
                currentItemsInRow > 0 ?
                    (rowWidth - totalGapWidthForRow) / currentItemsInRow
                :   0;

            return (
                <div key={key} style={style} className='flex justify-center'>
                    <div
                        className='flex flex-wrap'
                        style={{
                            width: rowWidth,
                            gap: `${GRID_GAP}px`,
                            justifyContent: 'center',
                        }}
                    >
                        {itemsToRender.map((eventData, itemIndex) => (
                            <div
                                key={
                                    eventData ?
                                        eventData.id
                                    :   `skeleton-${index}-${itemIndex}`
                                }
                                className='relative'
                                style={{
                                    width: calculatedCardContentWidth,
                                    height: CARD_ACTUAL_HEIGHT,
                                }}
                            >
                                <EventCard
                                    event={eventData}
                                    isLoading={!eventData} // isLoading is true if eventData is null (for skeletons)
                                    style={{ width: '100%', height: '100%' }}
                                    filterID={activeFilter}
                                    distanceToMe={
                                        eventData?._calculatedDistance || 0
                                    }
                                    // Correctly assign ref to individual items using a callback
                                    ref={(el) => {
                                        if (eventData && eventData.id) {
                                            itemRefs.current[eventData.id] = el;
                                        }
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            );
        },
        [
            filteredEvents,
            CARD_MIN_DESIRED_WIDTH,
            CARD_ACTUAL_HEIGHT,
            GRID_GAP,
            isLoading,
            SKELETON_COUNT,
        ]
    );

    return (
        <>
            {' '}
            {/* Use a Fragment to return multiple top-level elements */}
            {/* SECTION 1: Fixed-Height Header and Filter Bar (Stays at the top, h-dvh) */}
            <div className='py-4 w-full @container flex flex-col'>
                <h1 className='font-stretch-semi-expanded text-4xl mx-10 lg:ml-15 text-center lg:text-left'>
                    Entdecke aktuelle Veranstaltungen
                </h1>
                <h2 className='font-stretch-semi-expanded text-lg mx-10 lg:ml-15 text-stone-400 font-light text-center lg:text-left'>
                    Krefeld und Umgebung
                </h2>

                <ScrollArea className='py-3 mx-10 lg:mx-15 gap-x-2 my-2 max-w-full'>
                    <div className='flex flex-row w-max'>
                        {filterTexts.map((text, index) => {
                            // Assuming filterTexts and filterSymbols are available
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
                    <ScrollBar orientation='horizontal' />
                </ScrollArea>

                {/* IMPORTANT: If you want any initial content of the List to appear within this first viewport,
                    you might place a placeholder or the first few skeleton cards here,
                    but the main List needs to be outside for full page scroll.
                    Currently, this h-dvh div holds no content that grows to fill it, so it will mostly be title/filters.
                */}
            </div>
            {/* SECTION 2: Main Scrollable Content (Event List or Error Message) */}
            {/* This section will cause the browser's main scrollbar to appear */}
            {events[0] === -1 ?
                // Error state display
                <div className='flex flex-col w-full grow my-5'>
                    {' '}
                    {/* Added my-5 for spacing, removed h-full/flex-grow if not relevant here */}
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
                    <div className='grid grid-cols-1 @xl:grid-cols-1 @4xl:grid-cols-2 @7xl:grid-cols-3  lg:mx-15 mx-10 lg:my-5 my-3 max-w-full overflow-visible flex-grow'>
                        {/* ^^^^^^^^^^^ REMOVED h-full ^^^^^^^^^^^ */}
                        <DebouncedAutoSizer debounceTime={200} disableHeight>
                            {({ width }) => {
                                // height from DebouncedAutoSizer might still be passed but is less relevant for List with WindowScroller/autoHeight
                                const rowCountCalculated = getRowsAmount(
                                    width,
                                    CARD_MIN_DESIRED_WIDTH,
                                    isLoading ? SKELETON_COUNT : (
                                        filteredEvents.length
                                    )
                                );

                                setIsLoading(width === 0);

                                return (
                                    <WindowScroller>
                                        {({
                                            height: windowHeight, // Height of the actual browser window
                                            scrollTop,
                                            isScrolling,
                                            registerChild,
                                        }) => (
                                            <div
                                                ref={registerChild}
                                                className='w-full'
                                            >
                                                <List
                                                    autoHeight // List will adjust its own DOM height to fit content
                                                    ref={listRef}
                                                    width={width}
                                                    height={windowHeight} // Virtual viewport for List (window height)
                                                    scrollTop={scrollTop}
                                                    isScrolling={isScrolling}
                                                    rowCount={
                                                        rowCountCalculated
                                                    }
                                                    rowHeight={
                                                        CARD_ACTUAL_HEIGHT +
                                                        GRID_GAP
                                                    }
                                                    rowRenderer={rowRenderer}
                                                />
                                            </div>
                                        )}
                                    </WindowScroller>
                                );
                            }}
                        </DebouncedAutoSizer>
                    </div>
                    {showScrollButton && <BackToTopButton />}
                </>
            }
        </>
    );
}
