import CompanyMission from "../components/landing/about/CompanyMission";
import CompanyHistory from "../components/landing/about/CompanyHistory";
import CompanyValues from "../components/landing/about/CompanyValues";
import TeamSection from "../components/landing/about/TeamSection";

const About = () => {
    return (
        <div className="pt-20">
            <CompanyMission/>
            <CompanyHistory/>
            <CompanyValues/>
            <TeamSection/>
        </div>
    );
};

export default About;