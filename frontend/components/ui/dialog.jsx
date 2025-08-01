import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Scroll, XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Children } from 'react';
function Dialog({ ...props }) {
    return <DialogPrimitive.Root data-slot='dialog' {...props} />;
}

function DialogTrigger({ ...props }) {
    return <DialogPrimitive.Trigger data-slot='dialog-trigger' {...props} />;
}

function DialogPortal({ ...props }) {
    return <DialogPrimitive.Portal data-slot='dialog-portal' {...props} />;
}

function DialogClose({ ...props }) {
    return <DialogPrimitive.Close data-slot='dialog-close' {...props} />;
}

function DialogOverlay({ className, ...props }) {
    return (
        <DialogPrimitive.Overlay
            data-slot='dialog-overlay'
            className={cn(
                'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed grid place-items-center overflow-auto inset-0 z-50 bg-black/50',
                className
            )}
            {...props}
        />
    );
}

function DialogContent({ className, children, ...props }) {
    const childrenArray = Children.toArray(children);
    const scrollableContent = childrenArray.filter(
        (child) => child.type !== DialogFooter
    );
    const footer = childrenArray.find((child) => child.type === DialogFooter);
    return (
        <DialogPortal data-slot='dialog-portal'>
            <DialogOverlay>
                <DialogPrimitive.Content
                    data-slot='dialog-content'
                    className={cn(
                        'font-sans min-w-0 bg-card data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 fixed data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 grid max-h-full gap-4 rounded-lg border p-6 shadow-lg max-w-2/3 lg:w-1/2 lg:max-w-180 dark:text-neutral-50',
                        className
                    )}
                    {...props}
                >
                    <ScrollArea
                        className={'max-h-100 w-full leading-6 min-w-0'}
                    >
                        {scrollableContent}
                    </ScrollArea>
                    {footer}
                    <DialogPrimitive.Close className="cursor-pointer ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                        <XIcon className='stroke-white' />
                        <span className='sr-only'>Close</span>
                    </DialogPrimitive.Close>
                </DialogPrimitive.Content>
            </DialogOverlay>
        </DialogPortal>
    );
}

function DialogHeader({ className, ...props }) {
    return (
        <div
            data-slot='dialog-header'
            className={cn(
                'flex flex-col gap-2 text-center sm:text-left font-sans',
                className
            )}
            {...props}
        />
    );
}

function DialogFooter({ className, ...props }) {
    return (
        <div
            data-slot='dialog-footer'
            className={cn(
                'grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:justify-start min-w-0',
                className
            )}
            {...props}
        />
    );
}

function DialogTitle({ className, ...props }) {
    return (
        <DialogPrimitive.Title
            data-slot='dialog-title'
            className={cn('text-lg leading-none font-semibold', className)}
            {...props}
        />
    );
}

function DialogDescription({ className, ...props }) {
    return (
        <DialogPrimitive.Description
            data-slot='dialog-description'
            className={cn('text-muted-foreground text-sm', className)}
            {...props}
        />
    );
}

export {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
};
