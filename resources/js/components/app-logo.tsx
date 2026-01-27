import React from 'react';

// import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center">
           
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    <img src="/hero/darklogo.png" alt="logo" className=" flex items-center "
                    height={200}
                    width={350}
                    />
                </span>
            </div>
        </div>
    );
}
