import { useState, useRef, useEffect } from 'react';

export default function Discover({ events }) {
    const [flippedCardId, setFlippedCardId] = useState(null);
    const [frontHeights, setFrontHeights] = useState({}); // Store heights for each card
    const frontRefs = useRef({}); // Refs for each card's front

    const handleFlip = (id) => {
        setFlippedCardId(flippedCardId === id ? null : id); // Toggle flip state
    };

    useEffect(() => {
        // Measure the height of each front card
        const heights = {};
        Object.keys(frontRefs.current).forEach((id) => {
            const front = frontRefs.current[id];
            if (front) {
                heights[id] = front.offsetHeight;
            }
        });
        setFrontHeights(heights);
    }, [events]);

    if (!events || events.length === 0) {
        return (
            <div className='flex flex-col size-full justify-center items-center gap-y-3'>
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 -960 960 960'
                    className='fill-stone-400 size-20 animate-spin'
                >
                    <path d='M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880v80q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480h80q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Z' />
                </svg>
                <p className='font-stretch-semi-expanded'>
                    Lade Veranstaltungen...
                </p>
            </div>
        );
    }

            {/* Back of the Card */}
            <div
              className={`w-full backface-hidden ${
                flippedCardId === event.id ? "block" : "hidden"
              }   overflow-y-scroll scrollbar-fade flex flex-col`}
              style={{
                height: frontHeights[event.id] || "1rem", // Dynamically set height
              }}
            >
              <div className="flex-grow">
                <p
                  className="text-sm text-gray-700 font-stretch-semi-expanded mb-4 description break-words overflow-x-hidden"
                  dangerouslySetInnerHTML={{
                    __html: event.description,
                  }}
                ></p>
              </div>
              <div className="w-full sticky bottom-0 bg-white pt-1 left-0">
                <button
                  onClick={() => handleFlip(event.id)}
                  className="text-indigo-500 hover:underline"
                >
                  Zurück
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Component for rendering individual filter cards
function FilterCard({ symbol, text, id, filterEvents }) {
  // Create the icon element
  const symbolIcon = (
    <FontAwesomeIcon icon={symbol} className="mr-2" size="lg" />
  );

  // Replace spaces in text with non-breaking spaces
  const noBreakSpaceText = text.replace(/ /g, "\u00A0");

  return (
    <>
      <button
        onClick={() => filterEvents(id)}
        className="mr-3 rounded-3xl border p-2 pl-3 pr-4 border-stone-200 bg-white shadow-md hover:shadow-lg transition-shadow flex flex-row items-center"
        style={{}} // Changed from maxWidth to width
      >
        {symbolIcon}
        <p className="font-stretch-semi-expanded">{noBreakSpaceText}</p>
      </button>
    </>
  );
}

// Placeholder component for time indicator
function TimeIndicator() {
  return (
    <>
      <div className="flex flex-row items-center">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-1 fill-green-400 mr-2 animate-ping "
          >
            <circle cx="12" cy="12" r="10" />
          </svg>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-1 fill-green-400 mr-2 animate-ping absolute"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
    );
}
