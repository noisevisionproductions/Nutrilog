import Hero from "../components/landing/hero/Hero";
import Features from "../components/landing/features/Features";
import ForWho from "../components/landing/forWho/ForWho";
import FAQ from "../components/landing/faq/FAQ";
import Contact from "../components/landing/contact/Contact";
import CTA from "../components/landing/cta/CTA";
import MarketStats from "../components/landing/marketStats/MarketStats";
import DownloadAppSection from "../components/landing/appStore/DownloadAppSection";

const Landing = () => {
    return (
        <>
            <Hero/>
            <MarketStats/>
            <Features/>
            <ForWho/>
            <DownloadAppSection/>
            <FAQ/>
            <Contact/>
            <CTA/>
        </>
    );
};

export default Landing;