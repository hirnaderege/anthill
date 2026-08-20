import React, { createContext, useContext, useState } from "react";
import { Route } from "../services/routing";

type RouteContextType = {
    selectedRoute: Route | null;
    setSelectedRoute: (route: Route | null) => void;
};

const RouteContext = createContext<RouteContextType | undefined >(undefined);

export function RouteProvider({ children }: { children: React.ReactNode }) {
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

    return (
        <RouteContext.Provider value={{ selectedRoute, setSelectedRoute }}>
            { children }
        </RouteContext.Provider>
    );
} // end of RP

export function useRouteContext() {
    const context = useContext(RouteContext);
    if(!context)
        throw new Error(" useRouteContext must be used withing a RouteProvider ");

    return context;
} // end of URC
