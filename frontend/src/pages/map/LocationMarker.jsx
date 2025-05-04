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

        <span className={`relative flex size-2.5`}>
            <span className='relative inline-flex size-2.5 rounded-full bg-white border-2 border-black cursor-pointer'></span>
        </span>
    );
}
export default memo(CustomMarker);
