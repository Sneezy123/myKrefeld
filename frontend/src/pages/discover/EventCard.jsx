import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DialogDrawer,
    DialogDrawerContent,
    DialogDrawerDescription,
    DialogDrawerFooter,
    DialogDrawerHeader,
    DialogDrawerTitle,
    DialogDrawerTrigger,
} from '@/components/ui/dialogdrawer';
import { Skeleton } from '@/components/ui/skeleton';
import DOMPurify from 'dompurify';
import { ExternalLink, MapPin, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function EventCard({
    event,
    open,
    onOpenChange,
    isLoading,
    distanceToMe,
    onCardClick,
    ...props
}) {
    const [isFavorite, setFavorite] = useState(false);

    if (isLoading || !event)
        return (
            <SkeletonCard
                style={{
                    width: '100%',
                    height: '100%',
                }}
            />
        );

    return (
        <DialogDrawer open={open} onOpenChange={onOpenChange}>
            <DialogDrawerTrigger asChild>
                <Card className='w-full h-[560px] transition-all flex flex-col cursor-pointer hover:border-accent-400 duration-300'>
                    {/* Front of the Card */}
                    {/* Main content area - takes all available space but shrinks as needed */}
                    <CardHeader>
                        {event.image?.url !== '' ?
                            <img
                                src={event.image?.url}
                                alt={event.title}
                                className='rounded-xl mb-4 w-full h-40 object-cover'
                            />
                        :   <div className='rounded-xl mb-4 w-full h-40 object-cover bg-gray-100 dark:bg-[#1d1d20]'></div>
                        }
                        {/* Event Title */}
                        <CardTitle
                            className='font-stretch-semi-expanded font-semibold mb-2 text-xl overflow-x-scroll scrollbar-hidden font-sans'
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(event.title),
                            }}
                        ></CardTitle>
                        <TimeIndicator
                            eventStart={new Date(event.start_date).getTime()}
                            eventEnd={new Date(event.end_date).getTime()}
                        />
                    </CardHeader>
                    {/* Event Details */}
                    <CardContent>
                        <p className='font-stretch-semi-expanded text-sm text-text-900  mb-2'>
                            <strong>Beginn:</strong>{' '}
                            {new Date(event.start_date).toLocaleString([], {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                            {' Uhr'}
                            <br />
                            <strong>Ende:</strong>{' '}
                            {new Date(event.end_date).toLocaleString([], {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                            {' Uhr'}
                        </p>
                        {/* Venue */}
                        {event.venue?.venue === '' ?
                            <p className='font-stretch-semi-expanded text-sm text-text-900 mb-4'>
                                <strong>Veranstaltungsort:</strong> k.A.
                            </p>
                        :   <p className='font-stretch-semi-expanded text-sm text-text-900 mb-4'>
                                <strong>Veranstaltungsort:</strong>{' '}
                                {event.venue?.venue}:{' '}
                                <span className='font-light'>
                                    {event.venue?.address}, {event.venue?.zip}{' '}
                                    {event.venue?.city}
                                </span>
                            </p>
                        }
                        {event.cost === '' ?
                            <p className='font-stretch-semi-expanded text-sm text-text-900 mb-4'>
                                <strong>Preis:</strong> k.A.
                            </p>
                        :   <p className='font-stretch-semi-expanded text-sm text-text-900 mb-4'>
                                <strong>Preis:</strong>{' '}
                                {(
                                    [
                                        '0',
                                        '0€',
                                        'frei',
                                        'free',
                                        'gratis',
                                        'kostenlos',
                                    ].includes(
                                        event.cost?.toString().toLowerCase()
                                    )
                                ) ?
                                    'Kostenlos'
                                :   `${
                                        parseFloat(
                                            event.cost
                                                ?.toString()
                                                .match(/\d+([\.,]\d+)?/)
                                        ).toLocaleString('de-DE', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }) ?? 'null'
                                    } €`
                                }
                            </p>
                        }
                        {typeof distanceToMe === 'number' &&
                            distanceToMe !== Infinity &&
                            distanceToMe !== 0 && (
                                <p className='font-stretch-semi-expanded text-sm text-text-900 mb-4'>
                                    <strong>Abstand:</strong>{' '}
                                    {formatDistance(distanceToMe)}
                                </p>
                            )}
                    </CardContent>
                </Card>
            </DialogDrawerTrigger>
            <DialogDrawerContent>
                <DialogDrawerHeader>
                    <DialogDrawerTitle
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(event.title),
                        }}
                    ></DialogDrawerTitle>
                    <DialogDrawerDescription>
                        {event.sourceURL} &emsp; {event.id}
                    </DialogDrawerDescription>
                </DialogDrawerHeader>
                <div
                    className='mt-3'
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(event.description),
                    }}
                ></div>
                <DialogDrawerFooter>
                    <Button
                        variant={'default'}
                        className={'col-start-1 col-end-3'}
                    >
                        <MapPin />
                        Auf der Karte anzeigen
                    </Button>
                    <Button
                        variant={'outline'}
                        onClick={() => setFavorite(!isFavorite)}
                    >
                        <Star
                            className={`${isFavorite ? 'fill-text-950' : ''} transition-all duration-500`}
                        />
                    </Button>
                    <Button variant={'outline'} asChild>
                        <Link
                            to={
                                event.website !== '' ?
                                    event.website.replace(
                                        /^(?!https?:\/\/|\/\/)(www\.)?/,
                                        'https://$1'
                                    )
                                : event.venue?.website !== '' ?
                                    event.venue?.website
                                :   event.url
                            }
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            <ExternalLink />
                        </Link>
                    </Button>
                </DialogDrawerFooter>
            </DialogDrawerContent>
        </DialogDrawer>
    );
}

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

function formatDistance(distanceInMeters) {
    if (distanceInMeters < 1000) {
        return `${Math.round(distanceInMeters).toLocaleString('de-DE')} m`;
    } else {
        return `${(Math.round(distanceInMeters / 100) / 10).toLocaleString('de-DE')} km`;
    }
}

// This component visually indicates whether an event is currently active based on its start and end times.
// It displays a green pulsating dot if the event is active, or a gray static dot if it is not.
function TimeIndicator({ eventStart, eventEnd }) {
    const [currentTime, setCurrentTime] = useState(
        new Date(Date.now()).getTime()
    );

    useEffect(() => {
        // Update time every second
        const intervalId = setInterval(
            () => {
                setCurrentTime(Date.now());
            },
            activeNumber === 0 ?
                getTimeUntilString(currentTime, eventStart)[1]
            :   getTimeUntilString(currentTime, eventEnd)[1]
        );

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
        textContent = `Beginnt in ${getTimeUntilString(currentTime, eventStart)[0]}`;
    } else if (activeNumber === 1) {
        textContent = `Endet in ${getTimeUntilString(currentTime, eventEnd)[0]}`;
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
                    <span className='relative inline-flex size-2 rounded-full bg-sky-400'></span>
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
                <p className='font-stretch-semi-expanded text-sm text-text-900'>
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
        return [
            `${yearsFloored} ${yearsFloored === 1 ? 'Jahr' : 'Jahre'} ${monthsRounded - yearsFloored * 12} ${monthsRounded - yearsFloored * 12 === 1 ? 'Monat' : 'Monate'}`,
            2.628e9,
        ];
    } else if (monthsFloored > 0) {
        return [
            `${monthsFloored} ${monthsFloored === 1 ? 'Monat' : 'Monate'} ${Math.floor(weeksRounded - monthsFloored * (365.25 / 84))} ${Math.floor(weeksRounded - monthsFloored * (365.25 / 84)) === 1 ? 'Woche' : 'Wochen'}`,
            6.048e8,
        ];
    } else if (weeksFloored > 0) {
        return [
            `${weeksFloored} ${weeksFloored === 1 ? 'Woche' : 'Wochen'} ${daysRounded - weeksFloored * 7} ${daysRounded - weeksFloored * 7 === 1 ? 'Tag' : 'Tagen'}`,
            8.64e7,
        ];
    } else if (daysFloored > 0) {
        return [
            `${daysFloored} ${daysFloored === 1 ? 'Tag' : 'Tagen'} ${hoursRounded - daysFloored * 24} ${hoursRounded - daysFloored * 24 === 1 ? 'Stunde' : 'Stunden'}`,
            3.6e6,
        ];
    } else if (hoursFloored > 0) {
        return [
            `${hoursFloored} ${hoursFloored === 1 ? 'Stunde' : 'Stunden'} ${minutesRounded - hoursFloored * 60} ${minutesRounded - hoursFloored * 60 === 1 ? 'Minute' : 'Minuten'}`,
            60000,
        ];
    } else if (minutesFloored > 0) {
        return [
            `${minutesRounded} ${minutesRounded === 1 ? 'Minute' : 'Minuten'}`,
            1000,
        ];
    } else {
        return [
            `${secondsRounded} ${secondsRounded === 1 ? 'Sekunde' : 'Sekunden'}`,
            500,
        ];
    }
}
