import "./styles.css";
import Scene from "./Scene";

function App() {
  return (
    <>
      <div class="frame">
        <h1 class="frame__title">
          WEBGL Neon Shader
          
        </h1>
      
        <div class="frame__links">
          <a href="https://isengupt.github.io/fiber-website/">
            Previous
          </a>
          <a href="#">Resume</a>
          <a href="https://github.com/isengupt/shader">
            GitHub
          </a>
        </div>
      </div>

      <Scene />
    </>
  );
}

export default App;
