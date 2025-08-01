import { memo } from 'react';

function CustomMarker() {
    return (
        /* <svg
            height={10}
            viewBox='0 0 200 200'
            className='fill-sky-500 cursor-pointer'
        >
            <circle cx='100' cy='100' r='100'></circle>
        </svg> */

        <span className={`relative flex`}>
            <span className='relative inline-flex size-3 rounded-full text-white bg-primary-500 border-2 border-primary-600 dark:border-primary-400 cursor-pointer justify-center items-center'></span>
        </span>
    );
}
export default memo(CustomMarker);
