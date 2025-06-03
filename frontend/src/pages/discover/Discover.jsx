import { useState, useRef, useEffect, useCallback } from 'react';
import BackToTopButton from '@/src/components/BackToTopButton.jsx';
import { WindowScroller, List } from 'react-virtualized';
import { Button } from '@/components/ui/button';

import {
    Clock,
    TicketPercent,
    Sparkles,
    CirclePlus,
    Radar,
    Baby,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import EventCard from '@/src/components/EventCard.jsx';
import DebouncedAutoSizer from '@/src/components/DebouncedAutoSizer.jsx';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

function FilterCard({ symbol, text, id, isActive, filterEvents }) {
    const Icon = symbol;
    const label = text.replace(/ /g, '\u00A0');
    return (
        <Button
            onClick={() => filterEvents(id)}
            variant='outline'
            className={`mr-3 p-5 ${
                isActive ?
                    'border-accent-200 bg-accent-50 text-accent-600 hover:bg-accent-50/60 hover:text-accent-600'
                :   'border-stone-200 bg-white hover:bg-stone-50'
            } transition-all flex items-center`}
        >
            <Icon className='mr-2 size-5' />
            {label}
        </Button>
    );
}

export default function Discover({ events }) {
    const itemRefs = useRef({});
    const listRef = useRef(null);
    const location = useLocation();
    const allEvents = useRef([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [activeFilter, setActiveFilter] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [distanceArray, setDistanceArray] = useState([]);

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

    useEffect(() => {
        // Only stop showing skeletons once we actually have data or an error code:
        if (events && events.length > 0 && events[0] !== -1) {
            allEvents.current = events;
            setFilteredEvents(events);
            setIsLoading(false);
        } else if (events && events[0] === -1) {
            allEvents.current = [];
            setFilteredEvents([-1]);
            setIsLoading(false);
        }
        // otherwise (including events === []), keep isLoading = true
    }, [events]);

    useEffect(() => {
        if (filteredEvents.length > 0 && location.hash) {
            requestAnimationFrame(() => {
                const hash = location.hash.replace('#', '');
                const el = itemRefs.current[hash];
                if (el)
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }
    }, [location.hash, filteredEvents]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const id = params.get('event-id');
        if (id && filteredEvents.length > 0) {
            const el = itemRefs.current[id];
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [location.search, filteredEvents]);

    const filterEvents = (filterId) => {
        if (activeFilter === filterId) {
            setActiveFilter(null);
            setFilteredEvents(allEvents.current);
            listRef.current?.forceUpdateGrid();
            return;
        }
        setActiveFilter(filterId);
        let temp = [];
        if (filterId === 0) {
            temp = allEvents.current.filter(
                (e) => new Date(e.start_date).getTime() > Date.now()
            );
        } else if (filterId === 1) {
            temp = allEvents.current.filter((e) =>
                ['0', 'free', 'kostenlos', 'frei', 'gratis'].includes(
                    (e.cost || '').toString().toLowerCase()
                )
            );
        } else if (filterId === 2) {
            temp = [...allEvents.current].sort(() => Math.random() - 0.5);
        } else if (filterId === 3) {
            temp = [...allEvents.current].sort(
                (a, b) =>
                    new Date(b.created_at || b.start_date) -
                    new Date(a.created_at || a.start_date)
            );
        } else if (filterId === 4) {
            const geo = navigator.geolocation;
            if (geo && distanceArray.length === 0) {
                geo.getCurrentPosition((pos) => {
                    const toRad = Math.PI / 180;
                    const ulat = pos.coords.latitude * toRad;
                    const ulon = pos.coords.longitude * toRad;
                    const sorted = allEvents.current
                        .map((evt) => {
                            if (!evt.venue?.lat || !evt.venue?.lon)
                                return {
                                    ...evt,
                                    _calculatedDistance: Infinity,
                                };
                            const elat = evt.venue.lat * toRad;
                            const elon = evt.venue.lon * toRad;
                            const dlat = ulat - elat,
                                dlon = ulon - elon;
                            const a =
                                Math.sin(dlat / 2) ** 2 +
                                Math.cos(ulat) *
                                    Math.cos(elat) *
                                    Math.sin(dlon / 2) ** 2;
                            const dist =
                                2 *
                                Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) *
                                6371e3;
                            return { ...evt, _calculatedDistance: dist };
                        })
                        .sort(
                            (a, b) =>
                                a._calculatedDistance - b._calculatedDistance
                        );
                    setDistanceArray(sorted);
                    setFilteredEvents(sorted);
                    listRef.current?.forceUpdateGrid();
                });
                return;
            } else {
                setFilteredEvents(distanceArray);
                listRef.current?.recomputeRowHeights(0);
                return;
            }
        } else if (filterId === 5) {
            temp = allEvents.current.filter((e) => e.is_family_friendly);
        }
        setFilteredEvents(temp);
    };

    function getMaxItemsAmountPerRow(w, minW, gap) {
        return Math.max(Math.floor((w + gap) / (minW + gap)), 1);
    }
    function generateIndexesForRow(row, w, minW, amt, gap) {
        const perRow = getMaxItemsAmountPerRow(w, minW, gap);
        const start = row * perRow;
        return Array.from(
            { length: Math.min(perRow, amt - start) },
            (_, i) => start + i
        );
    }
    function getRowsAmount(w, minW, amt) {
        return Math.ceil(amt / getMaxItemsAmountPerRow(w, minW, GRID_GAP));
    }

    const rowRenderer = useCallback(
        ({ index, key, style, parent }) => {
            const width = parent.props.width;
            const perRow = getMaxItemsAmountPerRow(
                width,
                CARD_MIN_DESIRED_WIDTH,
                GRID_GAP
            );

            // while isLoading, render up to SKELETON_COUNT placeholders:
            const items =
                isLoading ?
                    Array.from({
                        length: Math.min(
                            perRow,
                            SKELETON_COUNT - index * perRow
                        ),
                    }).map(() => null)
                :   generateIndexesForRow(
                        index,
                        width,
                        CARD_MIN_DESIRED_WIDTH,
                        filteredEvents.length,
                        GRID_GAP
                    ).map((i) => filteredEvents[i]);

            const gapTotal = (items.length - 1) * GRID_GAP;
            const cardW = items.length ? (width - gapTotal) / items.length : 0;

            return (
                <div key={key} style={style} className='flex justify-center'>
                    <div
                        className='flex flex-wrap justify-center'
                        style={{ width, gap: `${GRID_GAP}px` }}
                    >
                        {items.map((evt, i) => (
                            <div
                                key={evt ? evt.id : `sk-${index}-${i}`}
                                style={{
                                    width: cardW,
                                    height: CARD_ACTUAL_HEIGHT,
                                }}
                            >
                                <EventCard
                                    event={evt}
                                    isLoading={evt === null}
                                    distanceToMe={evt?._calculatedDistance || 0}
                                    filterID={activeFilter}
                                    style={{ width: '100%', height: '100%' }}
                                    ref={(el) => {
                                        if (evt) itemRefs.current[evt.id] = el;
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            );
        },
        [filteredEvents, activeFilter, isLoading]
    );

    return (
        <>
            <div className='py-4 w-full flex flex-col'>
                <h1 className='text-4xl mx-10 lg:ml-15 text-center lg:text-left'>
                    Entdecke aktuelle Veranstaltungen
                </h1>
                <h2 className='text-lg mx-10 lg:ml-15 text-stone-400 text-center lg:text-left'>
                    Krefeld und Umgebung
                </h2>
                <ScrollArea className='py-3 mx-10 lg:mx-15 gap-x-2 my-2 max-w-full'>
                    <div className='flex flex-row w-max'>
                        {filterTexts.map((t, i) => (
                            <FilterCard
                                key={i}
                                symbol={filterSymbols[i]}
                                text={t}
                                id={i}
                                isActive={activeFilter === i}
                                filterEvents={filterEvents}
                            />
                        ))}
                    </div>
                    <ScrollBar orientation='horizontal' />
                </ScrollArea>
            </div>

            {events[0] === -1 ?
                <div className='flex flex-col w-full grow my-5'>
                    <span className='text-2xl font-bold mx-10 lg:mx-15 text-center my-2'>
                        Die Veranstaltungen konnten nicht geladen werden.
                    </span>
                    <span className='text-xl mx-10 lg:mx-15 text-center mb-5'>
                        Überprüfe deine Internetverbindung und versuche es
                        später erneut.
                    </span>
                </div>
            :   <>
                    <div className='grid grid-cols-1 @4xl:grid-cols-2 @7xl:grid-cols-3 mx-10 lg:mx-15 my-3 overflow-visible flex-grow'>
                        <DebouncedAutoSizer debounceTime={200} disableHeight>
                            {({ width }) => {
                                const rowCount = getRowsAmount(
                                    width,
                                    CARD_MIN_DESIRED_WIDTH,
                                    isLoading ? SKELETON_COUNT : (
                                        filteredEvents.length
                                    )
                                );
                                return (
                                    <WindowScroller>
                                        {({
                                            height,
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
                                                    height={height}
                                                    scrollTop={scrollTop}
                                                    isScrolling={isScrolling}
                                                    rowCount={rowCount}
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
                    <BackToTopButton />
                </>
            }
        </>
    );
}
