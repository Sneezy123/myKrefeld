export default function BackToTopButton() {
    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
            className='
                    fixed bottom-5 right-5 z-50
                    w-12 h-12 flex items-center justify-center
                    rounded-full shadow-md
                    hover:bg-accent-400/80 transition
                    text-xl
                    bg-accent-400 text-text-950
                     '
        >
            ↑
        </button>
    );
}
