import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import ErrorPage from "./ErrorPage.tsx";
import GitUtil from "./views/GitUtil.tsx";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App/>} errorElement={<ErrorPage/>} futureFlags={{v7_relativeSplatPath: true}}>
      <Route path="views/GitUtil" element={<GitUtil/>}/>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
);
