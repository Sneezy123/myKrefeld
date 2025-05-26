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
} from '@/components/ui/sidebar';

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
        <div className='flex flex-row '>
            <Sidebar collapsible='icon' variant='sidebar'>
                <SidebarHeader className='flex flex-row justify-between w-full items-center'>
                    <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                        <Command className='size-4' />
                    </div>
                    <span className='truncate font-semibold grow overflow-ellipsis'>
                        myKrefeld
                    </span>
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
            </Sidebar>
            <SidebarTrigger className='top-0 size-10 z-1' />
            <div className='w-full h-dvh -ml-10 overflow-x-hidden'>
                <Outlet />
            </div>
        </div>
    );
}
