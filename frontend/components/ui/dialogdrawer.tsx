import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './dialog';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from './drawer';
import { useEffect, useState } from 'react';

function useDetailsComponentMode(breakpoint = 640) {
    const [mode, setMode] = useState(
        typeof window !== 'undefined' && window.innerWidth <= breakpoint ?
            'drawer'
        :   'dialog'
    );
    useEffect(() => {
        const handleResize = () => {
            setMode(window.innerWidth <= breakpoint ? 'drawer' : 'dialog');
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);
    return mode;
}

let mode = '';

function DialogDrawer({ ...props }: React.ComponentProps<typeof Dialog> & React.ComponentProps<typeof Drawer>) {
    mode = useDetailsComponentMode(768);
    return mode === 'drawer' ? <Drawer {...props} /> : <Dialog {...props} />;
}

function DialogDrawerTrigger({ ...props }: React.ComponentProps<typeof DrawerTrigger> & React.ComponentProps<typeof DialogTrigger>) {
    return mode === 'drawer' ?
            <DrawerTrigger {...props} />
        :   <DialogTrigger {...props} />;
}

function DialogDrawerContent({ ...props }: React.ComponentProps<typeof DrawerContent> & React.ComponentProps<typeof DialogContent>) {
    return mode === 'drawer' ?
            <DrawerContent {...props} />
        :   <DialogContent {...props} />;
}

function DialogDrawerDescription({ ...props }: React.ComponentProps<typeof DrawerDescription> & React.ComponentProps<typeof DialogDescription>) {
    return mode === 'drawer' ?
            <DrawerDescription {...props} />
        :   <DialogDescription {...props} />;
}

function DialogDrawerTitle({ ...props }: React.ComponentProps<typeof DrawerTitle> & React.ComponentProps<typeof DialogTitle>) {
    return mode === 'drawer' ?
            <DrawerTitle {...props} />
        :   <DialogTitle {...props} />;
}

function DialogDrawerHeader({ ...props }: React.ComponentProps<typeof DrawerHeader> & React.ComponentProps<typeof DialogHeader>) {
    return mode === 'drawer' ?
            <DrawerHeader {...props} />
        :   <DialogHeader {...props} />;
}

function DialogDrawerFooter({ ...props }: React.ComponentProps<typeof DrawerFooter> & React.ComponentProps<typeof DialogFooter>) {
    return mode === 'drawer' ?
            <DrawerFooter {...props} />
        :   <DialogFooter {...props} />;
}

export {
    DialogDrawer,
    DialogDrawerTrigger,
    DialogDrawerContent,
    DialogDrawerDescription,
    DialogDrawerTitle,
    DialogDrawerHeader,
    DialogDrawerFooter,
};