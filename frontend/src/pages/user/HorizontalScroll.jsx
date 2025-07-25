import { Children, useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const HorizontalScroll = ({ children }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group">
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all opacity-0 group-hover:opacity-100"
      >
        <FiChevronLeft className="text-gray-700 w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      
      <div 
        ref={scrollRef}
        className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide"
      >
        <div className="flex space-x-3 sm:space-x-4" style={{ minWidth: `${Children.count(children) * 140}px` }}>
          {children}
        </div>
      </div>

      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all opacity-0 group-hover:opacity-100"
      >
        <FiChevronRight className="text-gray-700 w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};

export default HorizontalScroll;