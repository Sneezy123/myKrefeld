import React, { useState } from 'react'; // Make sure useState is imported

// In App.jsx or another component rendered within StrictMode:
export default function MyStrictModeCheckComponent() {
    const [count, setCount] = useState(0);

    const handleClick = () => {
        setCount((prevCount) => {
            // This log will fire twice per click if StrictMode runtime checks are active
            console.log('StrictMode check: State updater running');
            return prevCount + 1;
        });
    };

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={handleClick}>Trigger StrictMode Check</button>
        </div>
    );
}

// Then render this component within your App or where appropriate:
// In App.jsx's return statement:
// <BrowserRouter> ... <Routes> ... <Route path='/' element={<NavBar />}> ... </Route> ... </Routes> ... </BrowserRouter>
// <MyStrictModeCheckComponent /> // Temporarily add this component
