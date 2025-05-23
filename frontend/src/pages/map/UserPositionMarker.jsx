import { memo } from 'react';
import '../../app/App.css';

function UserPositionMarker() {
    return (
        /* <svg
            height={10}
            viewBox='0 0 200 200'
            className='fill-sky-500 cursor-pointer'
        >
            <circle cx='100' cy='100' r='100'></circle>
        </svg> */

        <span className={`relative flex size-4`} title='Du bist hier.'>
            <span className='absolute inline-flex h-full w-full rounded-full bg-sky-500 animate-ping opacity-50'></span>
            <span className='relative inline-flex size-4 rounded-full bg-sky-500 border-white border-2'></span>
        </span>
    );
}
export default memo(UserPositionMarker);
