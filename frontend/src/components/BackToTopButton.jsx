import { useState, useEffect } from 'react';

export default function BackToTopButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const scrollContainer = document.getElementById('scroll-container');
        if (!scrollContainer) return;

        const onScroll = () => {
            setVisible(scrollContainer.scrollTop > 300);
        };

        scrollContainer.addEventListener('scroll', onScroll);
        return () => scrollContainer.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToTop = () => {
        const scrollContainer = document.getElementById('scroll-container');
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
            console.log(scrollContainer.scrollTop);
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
                    hover:bg-neutral-800 transition
                    text-xl
                    bg-black text-white
                     '
            >
                ↑
            </button>
        )
    );
}
