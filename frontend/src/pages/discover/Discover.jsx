import { useState, useRef, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import BackToTopButton from '@/src/components/BackToTopButton.jsx';
import { WindowScroller, List } from 'react-virtualized';
import { Button } from '@/components/ui/button';
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
import EventCard from '@/src/pages/discover/EventCard.jsx';
import DebouncedAutoSizer from '@/src/pages/discover/DebouncedAutoSizer.jsx';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function SkeletonCard() {
    return (
        <Card
            className={
                'w-full h-full shadow-md hover:shadow-lg transition-shadow flex flex-col cursor-pointer'
            }
        >
            <CardHeader>
                <Skeleton className='rounded-xl mb-5.5 w-full h-40 '></Skeleton>
                <div>
                    <Skeleton className='mb-3 w-full h-4'></Skeleton>
                    <Skeleton className='mb-13.5 w-3/7 h-4'></Skeleton>
                </div>
            </CardHeader>
            <CardContent>
                <Skeleton className='mb-2 w-1/2 h-3'></Skeleton>
                <Skeleton className='mb-4 w-2/5 h-3'></Skeleton>
                <div>
                    <Skeleton className='mb-6 w-full h-3'></Skeleton>
                </div>
                <Skeleton className='mb-5 w-1/5 h-3'></Skeleton>
            </CardContent>
        </Card>
    );
}

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
                    'border-accent-500 dark:border-accent-600 dark:bg-accent-100 bg-accent-50 filter text-accent-600 hover:bg-accent-50/60 dark:hover:bg-accent-100/60 hover:text-accent-600'
                :   'border-stone-200 bg-white filter text-text-900 hover:text-text-950'
            }
            transition-all flex flex-row items-center cursor-pointer`}
        >
            <LucideSymbolIcon className='mr-2 size-5' />
            {noBreakSpaceText}
        </Button>
    );
}
// source: https://dev.to/jmalvarez/check-if-an-element-is-visible-with-react-hooks-27h8
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

/* export function useIsVisible(element) {
    const [isIntersecting, setIntersecting] = useState(false);

    useEffect(() => {
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => setIntersecting(entry.intersectionRatio === 1),
            { threshold: 1 }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [element]);

    return isIntersecting;
} */

export default function DiscoverEvents({ events }) {
    const listRef = useRef(null);

    const [showScrollButton, setShowScrollButton] = useState(false);
    const allEvents = useRef([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [activeFilter, setActiveFilter] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [distanceArray, setDistanceArray] = useState([]);

    // Card/grid constants
    const CARD_ACTUAL_HEIGHT = 560;
    const CARD_MIN_DESIRED_WIDTH = 400;
    const GRID_GAP = 24;
    const SKELETON_COUNT = 12;

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
        CirclePlus,
        Radar,
        Baby,
    ];

    // Initial event load/filter
    useEffect(() => {
        if (events && events[0] !== -1 && events[0] !== undefined) {
            allEvents.current = events;
            setFilteredEvents(events);
            setIsLoading(false);
        } else if (events && events[0] === -1) {
            setFilteredEvents([-1]);
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }
    }, [events]);

    // Back-to-top button visibility
    const debouncedHandleScrollButton = useCallback(
        debounce(() => {
            setShowScrollButton(window.scrollY > 300);
        }, 100),
        []
    );
    useEffect(() => {
        window.addEventListener('scroll', debouncedHandleScrollButton);
        return () => {
            window.removeEventListener('scroll', debouncedHandleScrollButton);
        };
    }, [debouncedHandleScrollButton]);

    // Filtering logic
    const filterEvents = (filterId) => {
        if (activeFilter === filterId) {
            setActiveFilter(null);
            setFilteredEvents(allEvents.current);
            if (listRef.current) listRef.current.forceUpdateGrid();
            return;
        }
        setActiveFilter(filterId);
        let tempFilteredEvents = [];
        if (filterId === 0) {
            tempFilteredEvents = allEvents.current.filter(
                (event) =>
                    new Date(event.start_date).getTime() >
                    new Date(Date.now()).getTime()
            );
        } else if (filterId === 1) {
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
            tempFilteredEvents = [...allEvents.current].sort(
                () => Math.random() - 0.5
            );
        } else if (filterId === 3) {
            tempFilteredEvents = [...allEvents.current].sort((a, b) => {
                const dateA = new Date(a.created_at || a.start_date).getTime();
                const dateB = new Date(b.created_at || b.start_date).getTime();
                return dateB - dateA;
            });
        } else if (filterId === 4) {
            const geoLocation = navigator.geolocation;
            if (geoLocation) {
                if (distanceArray.length === 0) {
                    geoLocation.getCurrentPosition(
                        (position) => {
                            let tempFilteredEvents = [...allEvents.current]
                                .map((event) => {
                                    if (
                                        !event.venue?.lat ||
                                        !event.venue?.lon
                                    ) {
                                        return {
                                            ...event,
                                            _calculatedDistance: Infinity,
                                        };
                                    }
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
                                    };
                                })
                                .sort(
                                    (a, b) =>
                                        a._calculatedDistance -
                                        b._calculatedDistance
                                );
                            setDistanceArray(tempFilteredEvents);
                            setFilteredEvents(tempFilteredEvents);
                            if (listRef.current)
                                listRef.current.forceUpdateGrid();
                        },
                        (error) => {
                            tempFilteredEvents = [...allEvents.current];
                            setFilteredEvents(tempFilteredEvents);
                        }
                    );
                } else {
                    setFilteredEvents(distanceArray);
                    if (listRef.current) listRef.current.recomputeRowHeights(0);
                }
            } else {
                tempFilteredEvents = [...allEvents.current];
                setFilteredEvents(tempFilteredEvents);
            }
            return;
        } else if (filterId === 5) {
            tempFilteredEvents = allEvents.current.filter(
                (event) => event.is_family_friendly
            );
        }
        setFilteredEvents(tempFilteredEvents);
    };

    // Helper functions for grid
    function getMaxItemsAmountPerRow(rowWidth, itemMinWidth, gridGap) {
        return Math.max(
            Math.floor((rowWidth + gridGap) / (itemMinWidth + gridGap)),
            1
        );
    }
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
    function getRowsAmount(rowWidth, itemMinWidth, itemsAmount) {
        const maxItemsPerRow = getMaxItemsAmountPerRow(
            rowWidth,
            itemMinWidth,
            GRID_GAP
        );
        return Math.ceil(itemsAmount / maxItemsPerRow);
    }

    // rowRenderer
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
                const startIndex = index * maxItemsPerRow;
                const endIndex = Math.min(
                    startIndex + maxItemsPerRow,
                    SKELETON_COUNT
                );
                itemsToRender = Array.from({
                    length: endIndex - startIndex,
                }).map(() => null);
                currentItemsInRow = itemsToRender.length;
            } else {
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
                        {itemsToRender.map((eventDataFromProps, itemIndex) => {
                            // Determine if we should show a skeleton or actual data.
                            // If eventDataFromProps is initially null/undefined (during loading/gap),
                            // we want the skeleton to show.
                            // Once eventDataFromProps gets populated with real data,
                            // the actual card should render.

                            const isCurrentlyLoading =
                                eventDataFromProps === null ||
                                eventDataFromProps === undefined ||
                                filteredEvents[0] === undefined;

                            // The key for the div wrapper should ideally be stable.
                            // If eventDataFromProps is null, create a unique skeleton key.
                            // Otherwise, use the actual event ID.
                            const itemKey =
                                isCurrentlyLoading ?
                                    `skeleton-${index}-${itemIndex}`
                                :   eventDataFromProps.id;

                            return (
                                <div
                                    key={itemKey}
                                    id={eventDataFromProps?.id} // Only set ID if data exists
                                    className='relative'
                                    style={{
                                        width: calculatedCardContentWidth,
                                        height: CARD_ACTUAL_HEIGHT,
                                    }}
                                >
                                    {
                                        <EventCard
                                            event={eventDataFromProps} // Pass the eventData as it comes from props
                                            isLoading={isCurrentlyLoading} // Let EventCard decide based on this prop
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                            }}
                                            filterID={activeFilter}
                                            distanceToMe={
                                                eventDataFromProps?._calculatedDistance ||
                                                0
                                            }
                                        />
                                    }
                                </div>
                            );
                        })}
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
            activeFilter,
        ]
    );

    return (
        <>
            <div className='py-4 w-full @container flex flex-col'>
                <h1 className='font-stretch-semi-expanded text-4xl mx-10 lg:ml-15 text-center lg:text-left text-text-950'>
                    Entdecke aktuelle Veranstaltungen
                </h1>
                <h2 className='font-stretch-semi-expanded text-lg mx-10 lg:ml-15 text-text-900 font-light text-center lg:text-left'>
                    Krefeld und Umgebung
                </h2>

                <ScrollArea className='py-3 mx-10 lg:mx-15 gap-x-2 my-2 max-w-full'>
                    <div className='flex flex-row w-max'>
                        {filterTexts.map((text, index) => (
                            <FilterCard
                                key={index}
                                symbol={filterSymbols[index]}
                                text={text}
                                id={index}
                                isActive={activeFilter === index}
                                filterEvents={filterEvents}
                            />
                        ))}
                    </div>
                    <ScrollBar orientation='horizontal' />
                </ScrollArea>
            </div>
            {events[0] === -1 ?
                <div className='flex flex-col w-full grow my-5'>
                    <span className='text-text-950 text-2xl font-bold mx-10 lg:mx-15 text-center my-2'>
                        Die Veranstaltungen konnten nicht geladen werden.
                    </span>
                    <span className='text-text-800 text-xl mx-10 lg:mx-15 text-center mb-5'>
                        Überprüfe deine Internetverbindung und versuche es
                        später erneut.
                    </span>
                    <span className='text-text-800 font-[350] text-xl mx-10 lg:mx-15 text-center'>
                        Wenn das Problem weiterhin besteht, kontaktiere den{' '}
                        <span className='underline underline-offset-2 decoration-accent-500'>
                            Support
                        </span>
                        .
                    </span>
                </div>
            :   <>
                    <div className='grid grid-cols-1 @xl:grid-cols-1 @4xl:grid-cols-2 @7xl:grid-cols-3  lg:mx-15 mx-10 lg:my-5 my-3 max-w-full overflow-visible flex-grow'>
                        <DebouncedAutoSizer debounceTime={200} disableHeight>
                            {({ width }) => {
                                const rowCountCalculated = getRowsAmount(
                                    width,
                                    CARD_MIN_DESIRED_WIDTH,
                                    isLoading ? SKELETON_COUNT
                                    : filteredEvents[0] === -1 ? 0
                                    : filteredEvents.length
                                );
                                setIsLoading(width === 0);
                                return (
                                    <WindowScroller>
                                        {({
                                            height: windowHeight,
                                            scrollTop,
                                            isScrolling,
                                            registerChild,
                                        }) => (
                                            <div
                                                ref={registerChild}
                                                className='w-full'
                                            >
                                                <List
                                                    autoHeight
                                                    ref={listRef}
                                                    width={width}
                                                    height={windowHeight}
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
