import Hero from "./Hero";
import About from "./About";
import Categories from "./Categories";
import Story from "./Story";
import Contact from "./Contact";

export default function Home() {
  return (
    <>
      <section id="home">
        <Hero />
      </section>

      <section id="about">
        <About />
      </section>

      <section id="services">
        <Categories />
      </section>

      <section id="story">
        <Story />
      </section>

      <section id="contact">
        <Contact />
      </section>
    </>
  );
}