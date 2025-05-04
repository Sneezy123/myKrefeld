import { memo } from 'react';
import '../../app/App.css';

function CustomMarker() {
    return (
        /* <svg
            height={10}
            viewBox='0 0 200 200'
            className='fill-sky-500 cursor-pointer'
        >
            <circle cx='100' cy='100' r='100'></circle>
        </svg> */

        <span
            className={`relative flex size-3`}
            title='Diese Veranstaltung läuft aktuell.'
        >
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-50'></span>
            <span className='relative inline-flex size-3 rounded-full bg-sky-500'></span>
        </span>
    );
}
export default memo(CustomMarker);
