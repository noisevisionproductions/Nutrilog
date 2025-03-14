const Logo = ({asLink = true}) => {
    const content = (
        <span className="text-2xl font-bold text-primary">
            NutriLog
        </span>
    );

    if (asLink) {
        return (
            <a href="/" className="flex items-center gap-2">
                {content}
            </a>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {content}
        </div>
    );
};

export default Logo;