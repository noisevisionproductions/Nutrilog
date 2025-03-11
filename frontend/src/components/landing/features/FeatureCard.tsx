import {motion} from 'framer-motion';
import {Feature} from './featuresData';

const FeatureCard = ({icon: Icon, title, description, status}: Feature) => {
    return (
        <motion.div
            whileHover={{y: -5}}
            className="p-6 rounded-xl bg-surface border border-border hover:border-primary/20 transition-colors duration-200 relative"
        >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-primary"/>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2 pr-24">
                {title}
            </h3>
            {status === 'coming_soon' && (
                <span className="absolute top-6 right-6 px-2 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-md">
                    Wkrótce
                </span>
            )}
            <p className="text-text-secondary">
                {description}
            </p>
        </motion.div>
    );
};

export default FeatureCard;