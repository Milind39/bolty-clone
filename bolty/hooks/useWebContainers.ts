import { useEffect, useState } from "react";
import { WebContainer } from '@webcontainer/api';

export function useWebContainer() {
    const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                // Boot the container
                const instance = await WebContainer.boot();
                setWebcontainer(instance);
            } catch (err) {
                console.error("Failed to boot WebContainer:", err);
            }
        };
        
        init();
    }, []);

    // CRITICAL: Return the instance so the component can use it
    return webcontainer;
}