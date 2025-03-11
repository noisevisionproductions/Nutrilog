import * as React from "react";

interface ContactCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
    content: string;
    action: string;
    isButton?: boolean;
}

const ContactCard = ({
                         icon: Icon,
                         title,
                         description,
                         content,
                         action,
                         isButton
                     }: ContactCardProps) => {
    return (
        <div
            className="p-6 bg-background rounded-xl border border-border hover:border-primary/20 transition-colors duration-200">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary"/>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-text-primary">
                        {title}
                    </h3>
                    <p className="text-text-secondary mt-1 mb-3">
                        {description}
                    </p>

                    {isButton ? (
                        <button
                            className="inline-flex items-center text-primary hover:text-primary-dark font-medium"
                            onClick={() => window.location.href = action}
                        >
                            {content}
                        </button>
                    ) : (
                        <a
                            href={action}
                            className="text-primary hover:text-primary-dark font-medium"
                        >
                            {content}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactCard;