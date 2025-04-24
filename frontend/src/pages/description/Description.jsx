import { useParams } from 'react-router-dom';

function Description({ events }) {
    const { id } = useParams(); // Get the event ID from the URL
    const event = events.find((event) => event.id === parseInt(id)); // Find the event by ID

    if (!event) {
        return <p>Event not found.</p>; // Handle case where event is not found
    }

    return (
        <div className='bg-white p-6'>
            <h1 className='text-4xl font-bold mb-4'>{event.title}</h1>
            <p className='text-gray-600 mb-4'>
                <strong>Start:</strong>{' '}
                {new Date(event.start_date).toLocaleString()} <br />
                <strong>End:</strong>{' '}
                {new Date(event.end_date).toLocaleString()}
            </p>
            <p className='text-gray-600 mb-4'>
                <strong>Venue:</strong> {event.venue?.address},{' '}
                {event.venue?.city}
            </p>
            <p
                className='text-gray-700 mb-4'
                dangerouslySetInnerHTML={{ __html: event.description }}
            ></p>
            <a
                href={event.website || event.url}
                target='_blank'
                rel='noopener noreferrer'
                className='text-indigo-500 hover:underline'
            >
                Visit Event Website
            </a>
        </div>
    );
}

export default Description;
