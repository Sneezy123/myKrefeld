import { useState, useEffect } from 'react';

export default function BackToTopButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            setVisible(window.pageYOffset > 300);
        };
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        visible && (
            <button
                onClick={scrollToTop}
                className='
          fixed bottom-5 right-5 z-50
          bg-indigo-600 text-white p-3 rounded-full shadow-md
          hover:bg-indigo-700 transition
        '
            >
                ↑
            </button>
        )
    );
}
