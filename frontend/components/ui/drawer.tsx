import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { DialogDrawerFooter } from './dialogdrawer';
import { ScrollArea } from './scroll-area';

import { cn } from '@/lib/utils';

const Drawer = ({
    shouldScaleBackground = true,
    ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
    <DrawerPrimitive.Root
        shouldScaleBackground={shouldScaleBackground}
        {...props}
    />
);
Drawer.displayName = 'Drawer';

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DrawerPrimitive.Overlay
        ref={ref}
        className={cn('fixed inset-0 z-50 bg-black/80', className)}
        {...props}
    />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => {
    const childrenArray = React.Children.toArray(
        children
    ) as React.ReactElement[];
    const scrollableContent = childrenArray.filter(
        (child) => child.type !== DialogDrawerFooter
    );
    const footer = childrenArray.find(
        (child) => child.type === DialogDrawerFooter
    );

    return (
        <DrawerPortal>
            <DrawerOverlay />
            <DrawerPrimitive.Content
                ref={ref}
                className={cn(
                    'p-6 pt-0 group/drawer-content bg-card fixed z-50 flex flex-col w-full min-h-[20vh] max-h-[80vh] font-sans',
                    'data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b',
                    'data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:min-h-[20vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t',
                    'data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm',
                    'data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm',
                    className
                )}
                {...props}
            >
                <div className='bg-muted mx-auto mt-4 h-2 w-[100px] rounded-full' />
                <ScrollArea
                    id='scrollarea'
                    className={'h-[80vh] leading-6 pb-1'}
                >
                    {scrollableContent}
                </ScrollArea>
                {footer}
            </DrawerPrimitive.Content>
        </DrawerPortal>
    );
});
DrawerContent.displayName = 'DrawerContent';

const DrawerHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn('grid gap-1.5 p-4 text-center md:text-left', className)}
        {...props}
    />
);
DrawerHeader.displayName = 'DrawerHeader';

const DrawerFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn('mt-auto flex flex-col gap-2 p-4', className)}
        {...props}
    />
);
DrawerFooter.displayName = 'DrawerFooter';

const DrawerTitle = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DrawerPrimitive.Title
        ref={ref}
        className={cn(
            'text-lg font-semibold leading-none tracking-tight',
            className
        )}
        {...props}
    />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DrawerPrimitive.Description
        ref={ref}
        className={cn('text-muted-foreground text-sm', className)}
        {...props}
    />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
    Drawer,
    DrawerPortal,
    DrawerOverlay,
    DrawerTrigger,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerFooter,
    DrawerTitle,
    DrawerDescription,
};
