import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
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

function DialogDrawer({ ...props }) {
    mode = useDetailsComponentMode(768);
    return mode === 'drawer' ? <Drawer {...props} /> : <Dialog {...props} />;
}

function DialogDrawerTrigger({ ...props }) {
    return mode === 'drawer' ?
            <DrawerTrigger {...props} />
        :   <DialogTrigger {...props} />;
}

function DialogDrawerContent({ ...props }) {
    return mode === 'drawer' ?
            <DrawerContent {...props} />
        :   <DialogContent {...props} />;
}

function DialogDrawerDescription({ ...props }) {
    return mode === 'drawer' ?
            <DrawerDescription {...props} />
        :   <DialogDescription {...props} />;
}

function DialogDrawerTitle({ ...props }) {
    return mode === 'drawer' ?
            <DrawerTitle {...props} />
        :   <DialogTitle {...props} />;
}

function DialogDrawerHeader({ ...props }) {
    return mode === 'drawer' ?
            <DrawerHeader {...props} />
        :   <DialogHeader {...props} />;
}

function DialogDrawerFooter({ ...props }) {
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
