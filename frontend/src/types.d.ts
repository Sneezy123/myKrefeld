export interface Event {
    start_date: string;
    cost?: string;
    created_at?: string;
    is_family_friendly?: boolean;
    venue?: { id: number; phone?: string; lat: number; lon: number; website?: string; venue?: string; address?: string; zip?: string; city?: string; };
    _calculatedDistance?: number;
    id: string;
    _id: string;
    title: string;
    addedToDB: string;
    description: string;
    image?: { url: string; width: number; height: number; };
    sourceURL?: string;
    website?: string;
    url: string;
    categories?: string[];
    tags?: string[];
    end_date: string;
}

export {};