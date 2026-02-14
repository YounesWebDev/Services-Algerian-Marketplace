import { ComponentPropsWithoutRef } from 'react';

export default function AppLogoIcon(props: ComponentPropsWithoutRef<'img'>) {
    return (
        <img
            {...props}
            className="h-50 w-50 max-w-none object-contain"
            src="/favicon-2.png"
            alt="App logo"
        />
    );
}
