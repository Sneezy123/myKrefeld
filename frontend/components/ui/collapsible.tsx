"use client"

import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = React.forwardRef<React.ElementRef<typeof CollapsiblePrimitive.Content>, React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>>(({ className, ...props }, ref) => (
    <CollapsiblePrimitive.Content
        ref={ref}
        className={className}
        {...props}
    />
));

export { Collapsible, CollapsibleTrigger, CollapsibleContent }