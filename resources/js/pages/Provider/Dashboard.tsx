import { Head } from '@inertiajs/react'
import React from 'react'

import AppLayout from '@/layouts/app-layout'

export default function Dashboard() {
    return (
        <AppLayout>
            <Head title='Provider Dashboard' />
            <div className='p-6'>Provider Dashboard</div>
        </AppLayout>
    )
}
