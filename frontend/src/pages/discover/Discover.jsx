import { useState, useRef, useEffect } from 'react';

export default function Discover({ events }) {
    const [flippedCardId, setFlippedCardId] = useState(null);
    const [frontHeights, setFrontHeights] = useState({}); // Store heights for each card
    const frontRefs = useRef({}); // Refs for each card's front

    const handleFlip = (id) => {
        setFlippedCardId(flippedCardId === id ? null : id); // Toggle flip state
    };

    useEffect(() => {
        // Measure the height of each front card
        const heights = {};
        Object.keys(frontRefs.current).forEach((id) => {
            const front = frontRefs.current[id];
            if (front) {
                heights[id] = front.offsetHeight;
            }
        });
        setFrontHeights(heights);
    }, [events]);

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

    return (
        <div className='bg-white p-4'>
            <h1 className='font-stretch-semi-expanded text-4xl ml-3 lg:ml-15'>
                Entdecke aktuelle Veranstaltungen
            </h1>
            <h2 className='font-stretch-semi expanded text-lg ml-3 lg:ml-15 text-stone-400 font-light'>
                Krefeld und Umgebung
            </h2>
            <ul className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:mx-15 mx-3 lg:my-5 my-3'>
                {events.map((event) => (
                    <li
                        key={event.id}
                        className={`relative rounded-3xl border p-6 border-stone-200 bg-white shadow-md hover:shadow-lg transition-shadow ${
                            flippedCardId === event.id ? 'flipped' : ''
                        } `}
                    >
                        {/* Front of the Card */}
                        <div
                            ref={(el) => (frontRefs.current[event.id] = el)}
                            className={` w-full backface-hidden ${
                                flippedCardId === event.id ? 'hidden' : 'block'
                            } flex flex-col h-full`}
                        >
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
                                className='font-semibold mb-2 text-xl'
                                dangerouslySetInnerHTML={{
                                    __html: event.title,
                                }}
                            ></h2>
                            {/* Event Details */}
                            <p className='text-sm text-gray-600 mb-2'>
                                <strong>Beginn:</strong>{' '}
                                {new Date(event.start_date).toLocaleString()}{' '}
                                <br />
                                <strong>Ende:</strong>{' '}
                                {new Date(event.end_date).toLocaleString()}
                            </p>
                            {/* Venue */}
                            {event.venue?.venue !== '' ? (
                                <p className='text-sm text-gray-600 mb-4'>
                                    <strong>Veranstaltungsort:</strong>{' '}
                                    {event.venue?.venue}:{' '}
                                    <span className='font-extralight'>
                                        {event.venue?.address},{' '}
                                        {event.venue?.zip} {event.venue?.city}
                                    </span>
                                </p>
                            ) : (
                                <></>
                            )}

                            <div className='h-auto mt-auto'>
                                <a
                                    href={
                                        event.website === ''
                                            ? event.url
                                            : event.website
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-indigo-500 hover:underline'
                                >
                                    Mehr Lesen
                                </a>
                                <button
                                    onClick={() => handleFlip(event.id)}
                                    className='text-indigo-500 hover:underline ml-5'
                                >
                                    Beschreibung
                                </button>
                            </div>
                        </div>

                        {/* Back of the Card */}
                        <div
                            className={`w-full backface-hidden ${
                                flippedCardId === event.id ? 'block' : 'hidden'
                            }   overflow-y-scroll scrollbar-hidden flex flex-col`}
                            style={{
                                height: frontHeights[event.id] || '10rem', // Dynamically set height
                            }}
                        >
                            <div className='flex-grow'>
                                <p
                                    className='text-sm text-gray-700 font-stretch-semi-expanded mb-4 description'
                                    dangerouslySetInnerHTML={{
                                        __html: event.description,
                                    }}
                                ></p>
                            </div>
                            <div className='w-full sticky bottom-0 bg-white pt-1'>
                                <button
                                    onClick={() => handleFlip(event.id)}
                                    className='text-indigo-500 hover:underline'
                                >
                                    Zurück
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
