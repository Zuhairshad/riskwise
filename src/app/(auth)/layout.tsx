
import React from 'react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Background elements */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-background">
                <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
                <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
            </div>

            {/* Main content area for centering */}
            <main className="flex-grow grid place-items-center p-4">
                <div className="w-full max-w-md">
                 {children}
                </div>
            </main>
            
            {/* Footer */}
            <footer className="w-full py-4 text-center text-xs text-muted-foreground">
                <p>Design by Uzair Ahmad</p>
            </footer>
        </div>
    );
}
