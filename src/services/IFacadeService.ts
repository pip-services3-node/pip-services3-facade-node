export interface IFacadeService {
    getRootPath(): string;

    registerMiddleware(
        action: (req: any, res: any, next: () => void) => void): void;

    registerMiddlewareForPath(path: string,
        action: (req: any, res: any, next: () => void) => void): void;

    registerRoute(method: string, route: string, 
        action: (req: any, res: any) => void): void;

    registerRouteWithAuth(method: string, route: string, 
        authorize: (req: any, res: any, next: () => void) => void,
        action: (req: any, res: any) => void): void;
}