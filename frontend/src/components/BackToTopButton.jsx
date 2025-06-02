import { useState, useEffect } from 'react';

export default function BackToTopButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!window) return;

        const onScroll = () => {
            setVisible(window.scrollY > 300);
        };

        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToTop = () => {
        if (window) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        visible && (
            <button
                onClick={scrollToTop}
                className='
                    fixed bottom-5 right-5 z-50
                    w-12 h-12 flex items-center justify-center
                    rounded-full shadow-md
                    hover:bg-accent-400 transition
                    text-xl
                    bg-primary-400 text-white
                    cursor-pointer'
            >
                ↑
            </button>
        )
    );
}
