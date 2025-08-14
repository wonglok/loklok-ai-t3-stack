const Loader = ({ size = 48, color = "#3498db", label = "Loading…" }) => (
    <div className="ourloader-wrapper">
        {/* The spinning element */}
        <div
            className="ourloader"
            style={{
                width: size,
                height: size,
                backgroundColor: color,
            }}
        />

        {/* Optional text label – can be hidden with CSS if you want */}
        <span className="ourloader-label">{label}</span>
    </div>
);

export default Loader;
