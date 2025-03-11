import Header from "../Header";
import Footer from "../footer/Footer";
import React from "react";

interface LandingLayoutProps {
    children: React.ReactNode;
}

const LandingLayout = ({children}: LandingLayoutProps) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header/>
            <main className="flex-grow">
                {children}
            </main>
            <Footer/>
        </div>
    );
};

export default LandingLayout;