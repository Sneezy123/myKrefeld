import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { Sun, Moon, Car } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { useState } from 'react';

function Switch({ className, ...props }) {
    const [lucideIcon, setLucideIcon] = useState(
        document.body.classList.contains('dark') ? Moon : Sun
    );
    return (
        <SwitchPrimitive.Root
            data-slot='switch'
            className={cn(
                'peer data-[state=checked]:bg-background-300 data-[state=unchecked]:bg-background-200 focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-red-600/80 inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            onClick={
                () =>
                    document.body.classList.contains('dark') ?
                        setLucideIcon(Sun)
                    :   setLucideIcon(Moon)
                // Reversed because the mode is checked before the switch flips and changes the mode.
            }
            {...props}
        >
            <SwitchPrimitive.Thumb
                data-slot='switch-thumb'
                className={cn(
                    'bg-accent-500 items-center justify-center dark:data-[state=unchecked]:bg-accent-500 dark:data-[state=checked]:bg-accent-500 pointer-events-none flex size-6 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-3px)] data-[state=unchecked]:translate-x-[1px] text-white'
                )}
            >
                <LucideIconSymbol symbol={lucideIcon} />
            </SwitchPrimitive.Thumb>
        </SwitchPrimitive.Root>
    );
}

function LucideIconSymbol({ symbol }) {
    const I = symbol;
    return <I className='size-5' />;
}

export { Switch };
