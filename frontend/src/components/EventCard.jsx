import { useEffect, useState } from 'react';
import {
    Description,
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogBackdrop,
} from '@headlessui/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function EventCard({ event, ref }) {
    let [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const closeDialog = () => {
        setIsOpen(false);
        navigate('/discover');
    };

    let isSkeleton = event ? false : true;

    return (
        <>
            {!isSkeleton ?
                <Link key={event?.id} to={`/discover?event-id=${event?.id}`}>
                    <li
                        ref={(el) => (ref.current[event.id] = el)} // Assign ref to each <li>
                        onClick={() => {
                            /* setIsOpen(true); */
                            // TODO: Implement nice modal.
                        }}
                        className='relative rounded-3xl border p-6  border-stone-200 bg-white shadow-md hover:shadow-lg transition-shadow min-h-[400px] flex flex-col cursor-pointer'
                    >
                        {/* Front of the Card */}
                        <div
                            className={
                                'w-full backface-hidden flex flex-col h-full'
                            }
                        >
                            {/* Main content area - takes all available space but shrinks as needed */}
                            <div className='flex-1'>
                                {event.image?.url !== '' ?
                                    <img
                                        src={event.image?.url}
                                        alt={event.title}
                                        className='rounded-2xl mb-4 w-full h-40 object-cover'
                                    />
                                :   <div className='rounded-2xl mb-4 w-full h-40 object-cover bg-stone-100'></div>
                                }
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
                                {event.venue?.venue === '' ?
                                    <p className='font-stretch-semi-expanded text-sm text-gray-600 mb-4'>
                                        <strong>Veranstaltungsort:</strong> k.A.
                                    </p>
                                :   <p className='font-stretch-semi-expanded text-sm text-gray-600 mb-4'>
                                        <strong>Veranstaltungsort:</strong>{' '}
                                        {event.venue?.venue}:{' '}
                                        <span className='font-light'>
                                            {event.venue?.address},{' '}
                                            {event.venue?.zip}{' '}
                                            {event.venue?.city}
                                        </span>
                                    </p>
                                }
                                {event.cost === '' ?
                                    <p className='font-stretch-semi-expanded text-sm text-gray-600 mb-4'>
                                        <strong>Preis:</strong> k.A.
                                    </p>
                                :   <p className='font-stretch-semi-expanded text-sm text-gray-600 mb-4'>
                                        <strong>Preis:</strong>{' '}
                                        {(
                                            event.cost
                                                ?.toString()
                                                .toLowerCase() === '0' ||
                                            event.cost
                                                ?.toString()
                                                .toLowerCase() === 'free' ||
                                            event.cost
                                                ?.toString()
                                                .toLowerCase() ===
                                                'kostenlos' ||
                                            event.cost
                                                ?.toString()
                                                .toLowerCase() === 'frei'
                                        ) ?
                                            'Gratis'
                                        :   event.cost}
                                    </p>
                                }
                            </div>
                        </div>
                    </li>
                </Link>
            :   <SkeletonCard />}
            <Dialog open={isOpen} onClose={closeDialog}>
                <DialogBackdrop className='fixed inset-0 bg-black/70 w-full h-full z-1' />
                <div className='fixed inset-0 flex w-screen items-center justify-center p-4 z-1'>
                    <DialogPanel className='max-w-lg space-y-4 border bg-white p-12'>
                        <DialogTitle className='font-bold'>
                            Deactivate account
                        </DialogTitle>
                        <Description>
                            This will permanently deactivate your account
                        </Description>
                        <p>
                            Are you sure you want to deactivate your account?
                            All of your data will be permanently removed.
                        </p>
                        <div className='flex gap-4'>
                            <button onClick={closeDialog}>Cancel</button>
                            <button onClick={closeDialog}>Deactivate</button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
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
    const secondsFloored = Math.floor(timeDiff / 1000);
    const minutesFloored = Math.floor(secondsFloored / 60);
    const hoursFloored = Math.floor(minutesFloored / 60);
    const daysFloored = Math.floor(hoursFloored / 24);
    const weeksFloored = Math.floor(daysFloored / 7);
    const monthsFloored = Math.floor(
        weeksFloored / (365.25 / 84) /* Average length of months in weeks */
    );
    const yearsFloored = Math.floor(monthsFloored / 12);

    const secondsRounded = Math.round(timeDiff / 1000);
    const minutesRounded = Math.round(secondsRounded / 60);
    const hoursRounded = Math.round(minutesRounded / 60);
    const daysRounded = Math.round(hoursRounded / 24);
    const weeksRounded = Math.round(daysRounded / 7);
    const monthsRounded = Math.round(
        weeksRounded / (365.25 / 84) /* Average length of months in weeks */
    );

    if (yearsFloored > 0) {
        return `${yearsFloored} ${yearsFloored === 1 ? 'Jahr' : 'Jahre'} ${monthsRounded - yearsFloored * 12} ${monthsRounded - yearsFloored * 12 === 1 ? 'Monat' : 'Monate'}`;
    } else if (monthsFloored > 0) {
        return `${monthsFloored} ${monthsFloored === 1 ? 'Monat' : 'Monate'} ${Math.floor(weeksRounded - monthsFloored * (365.25 / 84))} ${Math.floor(weeksRounded - monthsFloored * (365.25 / 84)) === 1 ? 'Woche' : 'Wochen'}`;
    } else if (weeksFloored > 0) {
        return `${weeksFloored} ${weeksFloored === 1 ? 'Woche' : 'Wochen'} ${daysRounded - weeksFloored * 7} ${daysRounded - weeksFloored * 7 === 1 ? 'Tag' : 'Tagen'}`;
    } else if (daysFloored > 0) {
        return `${daysFloored} ${daysFloored === 1 ? 'Tag' : 'Tagen'} ${hoursRounded - daysFloored * 24} ${hoursRounded - daysFloored * 24 === 1 ? 'Stunde' : 'Stunden'}`;
    } else if (hoursFloored > 0) {
        return `${hoursFloored} ${hoursFloored === 1 ? 'Stunde' : 'Stunden'} ${minutesRounded - hoursFloored * 60} ${minutesRounded - hoursFloored * 60 === 1 ? 'Minute' : 'Minuten'}`;
    } else if (minutesFloored > 0) {
        return `${minutesRounded} ${minutesRounded === 1 ? 'Minute' : 'Minuten'}`;
    } else {
        return `${secondsRounded} ${secondsRounded === 1 ? 'Sekunde' : 'Sekunden'}`;
    }
}
function SkeletonCard() {
    return (
        <li className='relative rounded-3xl border p-6 border-stone-200 bg-white shadow-md hover:shadow-lg transition-shadow min-h-[400px] flex flex-col cursor-pointer'>
            <div
                className={
                    'w-full backface-hidden flex flex-col h-full animate-pulse'
                }
            >
                {/* Image */}
                <div className='rounded-2xl mb-5.5 w-full h-40 object-cover bg-stone-200'></div>{' '}
                {/* Title */}
                <div>
                    <div className='rounded-2xl mb-3 w-full h-4 bg-stone-200'></div>
                    <div className='rounded-2xl mb-13.5 w-3/7 h-4 bg-stone-200'></div>
                </div>
                {/* Start */}
                <div className='rounded-2xl mb-2 w-1/2 h-3 bg-stone-200'></div>
                {/* End */}
                <div className='rounded-2xl mb-4 w-2/5 h-3 bg-stone-200'></div>
                {/* Venue */}
                <div>
                    <div className='rounded-2xl mb-6 w-full h-3 bg-stone-200'></div>
                </div>
                {/* Cost */}
                <div className='rounded-2xl mb-5 w-1/5 h-3 bg-stone-200'></div>
            </div>
        </li>
    );
}
