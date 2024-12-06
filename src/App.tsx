import "./App.css";
import { Link } from "@mui/material";
import { Outlet } from "react-router-dom";
import React from 'react';


export default function App() {

  return (
    <>
      <li>
        <Link href="/views/GitUtil">Git 批量工具</Link>
      </li>
      <Outlet />
    </>

  );
}

