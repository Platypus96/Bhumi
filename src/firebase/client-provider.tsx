"use client";

import { useState, useEffect } from "react";

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return <>{isClient ? children : null}</>;
}
