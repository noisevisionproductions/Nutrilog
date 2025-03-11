import Container from "../../ui/landing/Container";
import {motion} from "framer-motion";

const TeamSection = () => {
    return (
        <section className="py-20 bg-background">
            <Container>
                <motion.div
                    initial={{opacity: 0}}
                    whileInView={{opacity: 1}}
                    viewport={{once: true}}
                    className="max-w-3xl mx-auto text-center"
                >
                    <h2 className="text-3xl font-bold text-text-primary mb-8">
                        Zespół
                    </h2>
                    <div className="bg-surface p-8 rounded-xl border border-border">
                        <div
                            className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            // TODO zdjęcie
                        </div>
                        <h3 className="text-xl font-semibold text-text-primary mb-2">
                            Założyciel Noise Vision Software
                        </h3>
                        <p className="text-text-secondary mb-4">
                            Tomasz Jurczyk
                        </p>
                        <p className="text-text-secondary">
                            Z pasją do technologii i wizją usprawnienia pracy dietetyków, prowadzi rozwój Zdrowego
                            Panelu, łącząc doświadczenie w tworzeniu oprogramowania z głębokim zrozumieniem potrzeb
                            branży dietetycznej.
                        </p>
                    </div>
                </motion.div>
            </Container>
        </section>
    );
};

export default TeamSection;