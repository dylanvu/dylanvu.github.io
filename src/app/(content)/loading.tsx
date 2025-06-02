"use client";
// also used to fix an error in the built version: https://stackoverflow.com/questions/76790424/error-minified-react-error-482-visit-https-reactjs-org-docs-error-decoder-h
import { NextPage } from "next";
import "@/styles/loading.css";

const LoadingPage: NextPage = () => {
  return (
    <div>
      {/* <div className="container">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
            </div> */}
    </div>
  );
};

export default LoadingPage;
