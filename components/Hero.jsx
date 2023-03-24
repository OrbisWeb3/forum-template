import React from 'react';
import { HeroIllustration } from "./Icons";

function Hero({ title, description, image }) {
  return (
    <section className="relative overflow-hidden mb-3">
      {/* Bg */}
      <div className="absolute inset-0 bg-opacity-60 pointer-events-none -z-10" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-6 pb-6">
          {/* Hero content */}
          <div className="relative max-w-xl mx-auto md:max-w-none text-center md:text-left flex flex-col md:flex-row">
            {/* Content */}
            <div className="flex flex-row items-center">
              {/* Copy */}
              <div className="flex flex-col md:pr-32">
                <h1 className="text-3xl font-bold text-primary pb-3">{title}</h1>
                <p className="text-lg text-secondary">{description}</p>
              </div>

              {/* Image */}
              <div className="hidden md:flex left-[42rem] pr-32 justify-center">
                {image}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
