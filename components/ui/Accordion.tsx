import React, { useState } from "react";

type AccordionItemProps = {
  title: string;
  children: React.ReactNode;
};

type AccordionProps = {
  children: React.ReactNode;
};

const AccordionItem = ({ title, children }: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => setIsOpen(!isOpen);

  return (
    <div className="border-b border-neutral-800">
      <button
        onClick={toggleAccordion}
        className="w-full flex justify-between items-center py-4 text-slate-300 font-medium text-left hover:border-pink-500 focus:outline-none"
      >
        <span>{title}</span>
        <svg
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-screen" : "max-h-0"
        }`}
      >
        <div className="py-2 text-neutral-400">{children}</div>
      </div>
    </div>
  );
};

const Accordion = ({ children }: AccordionProps) => {
  return <div className="space-y-4">{children}</div>;
};

export { Accordion, AccordionItem };
