import React, { useState, useMemo, useEffect } from 'react';
import { AutoSizer } from 'react-virtualized';
import debounce from 'lodash/debounce';

function DebouncedAutoSizer({
    children,
    debounceTime = 150,
    disableHeight = false,
}) {
    const [renderWidth, setRenderWidth] = useState(0);

    // Create a debounced setter that only updates state after the delay
    const debouncedSetWidth = useMemo(
        () => debounce((width) => setRenderWidth(width), debounceTime),
        [debounceTime]
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            debouncedSetWidth.cancel();
        };
    }, [debouncedSetWidth]);

    return (
        <AutoSizer
            disableHeight={disableHeight}
            onResize={({ width }) => {
                debouncedSetWidth(width);
            }}
        >
            {() => children({ width: renderWidth })}
        </AutoSizer>
    );
}

export default DebouncedAutoSizer;
