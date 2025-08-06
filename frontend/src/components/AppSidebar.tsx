import {
    Map,
    Telescope,
    Calendar,
    Search,
    Settings,
    Command,
} from 'lucide-react';
import myKrefeldLogo from './myKrefeldExport.svg';
import myKrefeldLogoDark from './myKrefeldExport-dark.svg';
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
import { Switch } from '@/components/ui/darkmodeswitch';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function AppSidebar() {
    const [switchState, setSwitchState] = useState(
        document.body.classList.contains('dark')
    );
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
    ];

    return (
        <div className={`flex flex-row h-full`}>
            <Sidebar collapsible='icon' variant='default'>
                <SidebarHeader className='flex flex-row justify-between w-full items-center pr-3 overflow-hidden'>
                    <div className='flex aspect-square size-8 items-center justify-center rounded-lg'>
                        <img
                            src={
                                switchState ? myKrefeldLogoDark : myKrefeldLogo
                            }
                        />
                    </div>
                    <span className='truncate font-semibold grow overflow-ellipsis'>
                        myKrefeld
                    </span>
                    <Switch
                        onCheckedChange={(e) => {
                            if (document.body.classList.contains('dark')) {
                                document.body.classList.remove('dark');
                                setSwitchState(false);
                            } else {
                                document.body.classList.add('dark');
                                setSwitchState(true);
                            }
                        }}
                        defaultChecked={switchState}
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
