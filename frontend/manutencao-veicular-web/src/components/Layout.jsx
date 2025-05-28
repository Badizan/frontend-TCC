import { Sidebar } from './Sidebar'

export function Layout({ children }) {
    return (
        <div className="flex min-h-screen bg-[#F4F6F8]">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
} 