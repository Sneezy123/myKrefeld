import React, { useState, useEffect, useRef } from 'react';
import { AutoSizer } from 'react-virtualized';

function DebouncedAutoSizer({
    children,
    debounceTime = 150,
    disableHeight = false,
}) {
    // State to store the *latest* (non-debounced) dimensions from AutoSizer
    const [latestAutoSizerWidth, setLatestAutoSizerWidth] = useState(0);
    const [latestAutoSizerHeight, setLatestAutoSizerHeight] = useState(0);

    // State to store the *debounced* dimensions that will be passed to children
    const [debouncedRenderWidth, setDebouncedRenderWidth] = useState(0);
    const [debouncedRenderHeight, setDebouncedRenderHeight] = useState(0);

    // Ref to hold the timeout ID for cleanup
    const timeoutRef = useRef(null);

    // This useEffect debounces the dimensions received from AutoSizer
    useEffect(() => {
        // Clear any existing timeout to reset the debounce timer
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set a new timeout to update the debounced dimensions after the delay
        timeoutRef.current = setTimeout(() => {
            setDebouncedRenderWidth(latestAutoSizerWidth);
            setDebouncedRenderHeight(latestAutoSizerHeight);
        }, debounceTime);

        // Cleanup function: Clear the timeout if the component unmounts
        // or if latestAutoSizerWidth/Height/debounceTime change before the timeout fires.
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [latestAutoSizerWidth, latestAutoSizerHeight, debounceTime]); // Dependencies for the effect

    return (
        <AutoSizer disableHeight={disableHeight}>
            {({ width, height }) => {
                // Update the *latest* dimensions state immediately when AutoSizer provides them.
                // This update will then trigger the useEffect above to start the debounce timer.
                if (
                    width !== latestAutoSizerWidth ||
                    height !== latestAutoSizerHeight
                ) {
                    setLatestAutoSizerWidth(width);
                    setLatestAutoSizerHeight(height);
                }

                // Render children with the *debounced* dimensions.
                // Handle the initial state where debounced dimensions might still be 0,0
                // by passing the immediate (non-debounced) 0,0 from AutoSizer.
                if (
                    debouncedRenderWidth === 0 &&
                    debouncedRenderHeight === 0 &&
                    (width === 0 || height === 0)
                ) {
                    return children({ width: width, height: height });
                }

                // Otherwise, pass the debounced dimensions to the children.
                return children({
                    width: debouncedRenderWidth,
                    height: debouncedRenderHeight,
                });
            }}
        </AutoSizer>
    );
}

export default DebouncedAutoSizer;
