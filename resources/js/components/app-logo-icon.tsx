import { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/lib/utils';

export default function AppLogoIcon(props: ComponentPropsWithoutRef<'img'>) {
    const { className, ...rest } = props;

    return (
        <img
            {...rest}
            className={cn('h-8 w-8 object-contain', className)}
            src={rest.src ?? '/favicon-2.png'}
            alt={rest.alt ?? 'App logo'}
        />
    );
}
