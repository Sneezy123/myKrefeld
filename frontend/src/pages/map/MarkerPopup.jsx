import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardTitle } from '@/components/ui/card';
import {
    DialogDrawer,
    DialogDrawerContent,
    DialogDrawerFooter,
    DialogDrawerHeader,
    DialogDrawerTitle,
    DialogDrawerTrigger,
} from '@/components/ui/dialogdrawer';
import DOMPurify from 'dompurify';
import { ExternalLink, MoreVertical, Navigation } from 'lucide-react';
import { useState } from 'react';

export default function MarkerPopup({ cluster }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Card className='p-3 px-0 gap-3'>
                <CardTitle
                    className={'text-center mx-4'}
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                            cluster.properties.eventTitle
                        ),
                    }}
                ></CardTitle>
                <CardFooter className='gap-x-2 px-4'>
                    <Button className='grow justify-start' asChild>
                        {/* Cannot use <Link to={'...'}></Link> from 'react-router-dom' because the Link would live outside the Routes in the DOM tree. That is because of MapLibreGL. */}
                        <a
                            href={`/discover?event-id=${cluster.properties.eventId}`}
                        >
                            <MoreVertical />
                            Mehr Details
                        </a>
                    </Button>
                    <DialogDrawer open={open} onOpenChange={setOpen}>
                        <DialogDrawerTrigger>
                            <div className='cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary-500 text-white shadow-xs dark:hover:bg-primary-500/80 hover:bg-primary-500/90 h-9 px-4 py-2 has-[>svg]:px-3'>
                                <Navigation className='size-4' />
                            </div>
                        </DialogDrawerTrigger>
                        <DialogDrawerContent>
                            <DialogDrawerHeader>
                                <DialogDrawerTitle>
                                    Möchtest du fortfahren?
                                </DialogDrawerTitle>
                            </DialogDrawerHeader>
                            <div className='mt-3'>
                                Wenn du fortfährst, wirst du auf eine externe
                                Seite weitergeleitet (Google Maps). Möchtest du
                                fortfahren?
                            </div>
                            <DialogDrawerFooter>
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURI(cluster.geometry.coordinates[1] + ',' + cluster.geometry.coordinates[0])}&travelmode=transit`}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className=''
                                >
                                    <Button className='w-full col-span-1'>
                                        Ja, fortfahren <ExternalLink />
                                    </Button>
                                </a>
                                <Button
                                    variant='destructive'
                                    onClick={() => setOpen(false)}
                                >
                                    Nein, hier bleiben
                                </Button>
                            </DialogDrawerFooter>
                        </DialogDrawerContent>
                    </DialogDrawer>
                </CardFooter>
            </Card>
        </>
    );
}
