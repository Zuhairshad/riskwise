
import React from 'react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center">
            {/* Background elements */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-background">
                <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
                <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
            </div>

            {/* Main content area, now correctly centered */}
            <main className="w-full max-w-md p-4">
                 {children}
            </main>
            
            {/* Footer pushed to the bottom */}
            <footer className="absolute bottom-0 w-full py-4 text-center text-xs text-muted-foreground">
                <p>Design by Uzair Ahmad</p>
            </footer>
        </div>
    );
}
