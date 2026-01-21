import AppLayout from '@/layouts/app-layout'

export default function Dashboard() {
    return (
        <>
        <AppLayout breadcrumbs={[ { title: 'Dashboard', href: '/dashboard' } ]}>
            <div className='p-6'>Client Dashboard</div>
        </AppLayout>
        </>
    ) 
}
