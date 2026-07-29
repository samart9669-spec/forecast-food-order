import React from "react";import{createRoot}from"react-dom/client";import{QueryClient,QueryClientProvider}from"@tanstack/react-query";import{createBrowserRouter,RouterProvider}from"react-router";import"./index.css";import{Dashboard}from"./routes/dashboard";
const router=createBrowserRouter([{path:"/",element:<Dashboard/>}]);const queryClient=new QueryClient();
createRoot(document.getElementById("root")!).render(<React.StrictMode><QueryClientProvider client={queryClient}><RouterProvider router={router}/></QueryClientProvider></React.StrictMode>);
