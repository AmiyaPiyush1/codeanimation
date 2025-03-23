import React from "react";
import "./NotFound.css"; // Import the CSS file

const NotFound = () => {
  return (
    <main className="main">
        <section className="home">
            <div className="home__container container">
                <div className="home__data">
                    <span className="home__subtitle">Error 404</span>
                    <h1 className="home__title">Hey Buddy</h1>
                    <p className="home__description">
                        We can't seem to find the page you are looking for.
                    </p>
                    <a href="/" className="home__button">
                        Go Home
                    </a>
                </div>

                <div className="home__img">
                    <img src="/public/ghost-img.png" alt="ghost-image" />
                    <div className="home__shadow"></div>
                </div>
            </div>
        </section>
    </main>
  );
};

export default NotFound;