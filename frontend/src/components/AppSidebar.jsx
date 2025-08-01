import {
    Map,
    Telescope,
    Calendar,
    Search,
    Settings,
    Command,
} from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import {
    Sidebar,
    SidebarTrigger,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarHeader,
    SidebarFooter,
} from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function AppSidebar() {
    const items = [
        {
            title: 'Karte',
            url: '/map',
            icon: Map,
        },
        {
            title: 'Entdecken',
            url: '/discover',
            icon: Telescope,
        },
        {
            title: 'Calendar',
            url: '#',
            icon: Calendar,
        },
        {
            title: 'Search',
            url: '#',
            icon: Search,
        },
        {
            title: 'Settings',
            url: '#',
            icon: Settings,
        },
    ];

    return (
        <div className={`flex flex-row h-full`}>
            <Sidebar collapsible='icon' variant='sidebar'>
                <SidebarHeader className='flex flex-row justify-between w-full items-center pr-3 overflow-hidden'>
                    <div className='flex aspect-square size-8 items-center justify-center rounded-lg'>
                        <svg
                            className='size-full'
                            viewBox='0 0 512 512'
                            version='1.1'
                            id='svg1'
                            xmlSpace='preserve'
                            xmlnsXlink='http://www.w3.org/1999/xlink'
                            xmlns='http://www.w3.org/2000/svg'
                        >
                            <defs id='defs1'>
                                <pattern
                                    xlinkHref='#stripes-grid'
                                    preserveAspectRatio='none'
                                    id='pattern48'
                                    patternTransform='matrix(10.111627,10.111627,-5.939697,5.939697,0,0)'
                                    x='-3'
                                    y='0'
                                    width='7.2'
                                />
                                <pattern
                                    patternUnits='userSpaceOnUse'
                                    width='3'
                                    height='10'
                                    patternTransform='scale(2)'
                                    preserveAspectRatio='xMidYMid'
                                    id='stripes-grid'
                                    style={{ fill: '#000000' }}
                                    x='0'
                                    y='0'
                                >
                                    <rect
                                        style={{ stroke: 'none' }}
                                        x='0'
                                        y='0'
                                        width='2'
                                        height='10'
                                        id='rect134-4'
                                    />
                                </pattern>
                            </defs>
                            <g
                                id='layer2'
                                style={{ stroke: '#0000ff' }}
                                transform='matrix(0.86372114,0,0,0.86372114,36.678284,34.63084)'
                            >
                                <path
                                    style={{
                                        display: 'inline',
                                        fill: 'url(#pattern48)', // Reference to the pattern
                                        fillOpacity: 1,
                                        stroke: '#000000',
                                        strokeWidth: 28.9682,
                                        strokeLinecap: 'round',
                                        strokeLinejoin: 'round',
                                        strokeDasharray: 'none',
                                        paintOrder: 'normal',
                                    }}
                                    d='m 324.44632,445.70947 c 0,0 3.23368,-26.94736 2.15579,-46.34947 -1.0779,-19.40211 7.00631,-19.94105 7.00631,-19.94105 0,0 12.39579,-5.38948 24.25263,-3.77263 11.85684,1.61684 1.61684,3.77263 22.63579,3.23368 21.01895,-0.53895 44.73263,-26.94737 44.73263,-26.94737 0,0 14.55158,-15.09052 33.95369,-15.62947 19.4021,-0.53895 31.79789,-21.01895 37.18737,-31.7979 5.38947,-10.77894 9.1621,-22.63579 9.1621,-22.63579 0,0 -55.51158,-25.86947 -74.91368,-30.18105 -19.40211,-4.31158 -32.87579,-18.32421 -35.03158,-27.48631 -2.15579,-9.16211 1.07789,-29.64211 9.70105,-36.64843 8.62316,-7.00631 33.41474,-16.16842 33.41474,-16.16842 l -2.69474,-7.54526 5.92842,-1.61684 7.54527,-16.16842 c 0,0 -14.01264,3.77263 -19.40211,7.00631 -5.38947,3.23369 -4.31158,-7.54526 -2.15579,-11.31789 2.15579,-3.77263 7.54526,-30.18105 7.54526,-30.18105 l -3.23368,-7.00632 -9.16211,8.62316 -16.70736,-3.77263 -8.62316,14.55157 -11.3179,0.53895 -5.38947,4.85053 c 0,0 -4.85053,-2.15579 -4.85053,-7.54526 0,-5.38948 -3.77263,-8.62316 -3.77263,-8.62316 l -14.55158,3.77263 -3.77263,-25.330527 c 0,0 -56.58947,-14.012632 -66.82947,-11.317895 -10.24,2.694737 -7.00632,9.701053 -7.00632,9.701053 l -37.18737,7.006315 -5.92842,-7.545263 -25.33052,7.006316 c 0,0 -1.0779,9.162101 -10.77895,8.623161 -9.70105,-0.53895 -20.48,-17.246319 -20.48,-17.246319 l -9.70105,5.389474 -10.77895,-15.629474 5.92842,-9.162105 -10.77895,-1.077895 -9.70105,-7.545263 4.31158,-3.772632 -7.54526,-5.389473 c 0,0 -10.24,20.48 -19.40211,23.174736 -9.16211,2.694737 -31.258947,2.15579 -44.193684,-0.538947 C 65.751579,70.602105 48.505263,64.134737 48.505263,64.134737 l -4.850526,11.317895 -16.168421,2.694736 3.233684,20.48 -8.623158,-0.538947 -1.077895,18.324209 6.467369,1.61684 -1.616842,8.08421 12.395789,2.15579 -3.233684,37.72632 c 0,0 2.694737,11.85684 9.162105,22.09684 6.467369,10.24 -2.694737,12.93474 -2.694737,12.93474 l -1.616842,11.85684 6.467369,12.93474 c 0,0 -9.162106,2.15579 -9.162106,7.54526 0,5.38947 7.006316,8.08421 7.006316,8.08421 l -5.389473,11.85684 47.427368,23.71369 c 0,0 10.24,7.00631 12.395789,19.94105 2.155792,12.93474 -0.538947,20.48 -0.538947,20.48 0,0 -3.772632,12.93474 -1.077895,18.32421 2.694737,5.38947 4.850524,27.48632 -2.694737,37.72632 -7.545263,10.24 -22.096842,20.48 -32.336842,22.63579 -10.24,2.15579 -17.246315,2.69473 -17.246315,2.69473 l 1.616842,9.16211 4.311579,-0.53895 15.629473,19.94105 c 0,0 5.928421,4.85053 4.311579,10.77895 -1.616842,5.92842 1.077895,6.46737 1.077895,6.46737 l 26.408421,-4.31158 6.467369,12.39579 19.94105,-3.23368 c 0,0 11.85684,-1.0779 18.86316,-1.0779 7.00632,0 93.77684,7.54526 93.77684,7.54526 0,0 15.62948,3.77264 42.0379,0 26.40842,-3.77263 45.27158,-10.24 45.27158,-10.24 z'
                                    id='path1'
                                />
                                <path
                                    style={{
                                        fill: '#36b3ff',
                                        fillOpacity: 1,
                                        stroke: '#36b3ff',
                                        strokeWidth: 27.2616,
                                        strokeLinecap: 'round',
                                        strokeLinejoin: 'round',
                                        strokeDasharray: 'none',
                                        strokeOpacity: 1,
                                        paintOrder: 'normal',
                                    }}
                                    d='m 521.70105,145.51579 c 0,0 1.15988,6.81992 -71.68,16.70737 -20.06259,2.72334 -44.73263,12.93474 -53.89473,25.86947 -7.17175,10.12483 -12.39579,31.25895 -5.38948,42.57685 7.00632,11.31789 11.0231,20.31986 49.58316,32.33683 40.85654,12.73266 75.45264,32.33684 78.68632,35.57053 3.23368,3.23368 4.31157,-12.93474 4.31157,-12.93474 0,0 -34.26486,-23.19656 -98.08842,-42.57684 -30.04236,-9.12248 -22.63579,-39.8821 -22.63579,-39.8821 0,0 5.18472,-10.5788 23.71368,-19.40211 11.3179,-5.38947 38.82667,-10.73401 64.13475,-14.55158 55.19021,-8.3251 31.25894,-23.71368 31.25894,-23.71368 z'
                                    id='path2'
                                />
                            </g>
                        </svg>
                    </div>
                    <span className='truncate font-semibold grow overflow-ellipsis'>
                        myKrefeld
                    </span>
                    <Switch
                        onCheckedChange={(e) =>
                            document.body.classList.contains('dark') ?
                                document.body.classList.remove('dark')
                            :   document.body.classList.add('dark')
                        }
                        defaultChecked={true} // Change to false if light mode is default
                    />
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Veranstaltungen</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            className='[&>svg]:size-5'
                                        >
                                            <Link to={item.url}>
                                                <item.icon />
                                                <span className='text-base'>
                                                    {item.title}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu className={'py-3 px-3'}>
                        <SidebarMenuItem></SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <SidebarTrigger className='sticky top-0 size-10 z-1' />
            <div className='w-full -ml-10 overflow-x-hidden overflow-y-visible flex flex-col flex-1 grow'>
                <Outlet />
            </div>
        </div>
    );
}
