import { lazy } from 'react';

/**
 * A wrapper around React.lazy that automatically retries importing a component
 * if it fails due to a ChunkLoadError (network error or version mismatch).
 * It attempts to reload the page once to fetch the fresh chunks.
 */
const lazyWithRetry = (componentImport) =>
    lazy(async () => {
        const pageHasAlreadyBeenForceRefreshed = JSON.parse(
            window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
        );

        try {
            const component = await componentImport();
            // If successful, reset the flag so future errors can trigger a refresh
            window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
            return component;
        } catch (error) {
            if (!pageHasAlreadyBeenForceRefreshed) {
                // Assuming that the user is not running the latest version of the application.
                // Let's reload the page immediately.
                
                window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
                window.location.reload();

                // Return a promise that never resolves to freeze the UI while reloading
                return new Promise(() => { });
            }

            // If we already reloaded and it still fails, throw the error
            throw error;
        }
    });

export default lazyWithRetry;

