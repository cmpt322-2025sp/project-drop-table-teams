
<div class="dashboard-container">
  <div class="logo">Math Maze</div>
  
  <div class="start-button">
    <a href="/game">
      <button>START GAME</button>
    </a>
  </div>
  
  <div class="view-progress-button">
    <button>View Progress</button>
  </div>
</div>

<style>
  .dashboard-container {
    background: #769576;
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .logo {
    color: #000000;
    font-family: "NovaFlat-Book", sans-serif;
    font-size: 5rem;
    line-height: 1.2;
    font-weight: 400;
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .start-button button {
    background: #ff9d00;
    border-radius: 8px;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20rem;
    height: 6rem;
    font-size: 2rem;
    font-weight: bold;
    color: #000000;
    font-family: "NovaFlat-Book", sans-serif;
    cursor: pointer;
    border: none;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
  
  .start-button button:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
  }
  
  .start-button button:active {
    transform: translateY(1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .view-progress-button {
    margin-top: 2rem;
  }
  
  .view-progress-button button {
    background: #f38f47;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 1rem;
    font-weight: 600;
    color: #000000;
    font-family: "CrimsonText-SemiBold", sans-serif;
    cursor: pointer;
    border: none;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
  
  .view-progress-button button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
</style>
