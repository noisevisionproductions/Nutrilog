import {AnimatePresence, motion} from 'framer-motion';
import {FAQItem as FAQItemType} from './faqData';
import {useState} from "react";
import {ChevronRightIcon} from "@heroicons/react/16/solid";

const FAQItem = ({question, answer}: FAQItemType) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="py-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center w-full text-left"
            >
                <h3 className="text-lg font-medium text-text-primary pr-8">
                    {question}
                </h3>
                <motion.div
                    animate={{rotate: isOpen ? 180 : 0}}
                    transition={{duration: 0.2}}
                    className="flex-shrink-0"
                >
                    <ChevronRightIcon className="w-5 h-5 text-primary"/>
                </motion.div>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{height: 0, opacity: 0}}
                        animate={{height: 'auto', opacity: 1}}
                        exit={{height: 0, opacity: 0}}
                        transition={{duration: 0.2}}
                    >
                        <p className="mt-4 text-text-secondary">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FAQItem;